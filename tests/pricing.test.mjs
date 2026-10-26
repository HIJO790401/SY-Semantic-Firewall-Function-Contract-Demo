import test from 'node:test';
import assert from 'node:assert/strict';
import {createPricing, compareDeliveries, PRICE_SCOPE, REFERENCE_SCOPE} from '../src/pricing.mjs';

// Every numerical rate in this suite is invented test data, not a market quote.
const card = (changes = {}) => ({rateCardId:'OFFLINE-TEST-NOT-A-MARKET-PRICE', version:'test-1', currency:'USD', currencyMinorExponent:2, scope:PRICE_SCOPE, sourceEvidence:['inert:test-fixture-only'], verifiedBy:'offline-test-harness', verification:'SYNTHETIC', modelRates:{small:{inputMinorPerMillion:100, outputMinorPerMillion:200}, large:{inputMinorPerMillion:300, outputMinorPerMillion:400}}, ...changes});
const offline = c => createPricing(c ?? card(), {mode:'OFFLINE_TEST'});
const input = (changes = {}) => ({modelId:'small', usage:{input_tokens:1000, output_tokens:500}, usageEvidence:'inert:measured-test-receipt', ...changes});
const complete = quote => ({deliveryStatus:'COMPLETE', quality:{passed:true,criterionId:'fixed-methods-test-v1'}, resultHash:'a'.repeat(64), quote});
const undefinedPrice = (q, reason) => { assert.equal(q.status,'PRICE_UNDEFINED'); assert.equal(q.owner_return,true); assert.equal(q.full_host_cost_closed,false); assert.equal(q.exact_minor_units,null); if(reason) assert.equal(q.reason,reason); };

test('missing ratecard returns Owner rather than throwing or a zero total', () => {
 const p=createPricing(); undefinedPrice(p.quote(input()),'RATE_CARD_REQUIRED'); assert.ok(p.quote(input()).missing_fields.includes('rateCard.sourceEvidence'));
});
test('scope-limited rational and ceiling are exact, JSON serializable', () => {
 const q=offline().quote(input()); assert.deepEqual(q.exact_minor_units,{numerator:'200000',denominator:'1000000'}); assert.equal(q.ceiling_minor_units,'1'); assert.equal(q.remainder_numerator,'200000'); assert.doesNotThrow(()=>JSON.stringify(q));
});
test('round once after summing fractions, not once per component', () => {
 const q=offline().quote(input({usage:{input_tokens:1,output_tokens:1}})); assert.equal(q.ceiling_minor_units,'1'); assert.equal(q.exact_minor_units.numerator,'300');
});
test('an exact integer amount has zero remainder and no extra unit', () => {
 const q=offline().quote(input({usage:{input_tokens:1000000,output_tokens:0}})); assert.equal(q.ceiling_minor_units,'100'); assert.equal(q.remainder_numerator,'0');
});
test('zero measured tokens means only zero priced API component', () => {
 const q=offline().quote(input({usage:{input_tokens:0,output_tokens:0,inference_wall_ms:80}})); assert.equal(q.ceiling_minor_units,'0'); assert.equal(q.inference_wall_ms_priced,false); assert.equal(q.full_host_cost_closed,false); assert.equal(q.zero_api_price_implies_zero_total_cost,false);
});
test('zero rate never establishes zero host total', () => {
 const q=offline(card({modelRates:{small:{inputMinorPerMillion:0,outputMinorPerMillion:0}}})).quote(input()); assert.equal(q.ceiling_minor_units,'0'); assert.equal(q.full_host_cost_closed,false);
});
test('source ratecard mutation cannot change accounting or ratecard version', () => {
 const c=card(), p=offline(c); c.modelRates.small.inputMinorPerMillion=900; c.version='changed'; c.sourceEvidence.push('changed'); const q=p.quote(input()); assert.equal(q.rateCardVersion,'test-1'); assert.equal(q.exact_minor_units.numerator,'200000'); assert.equal(q.sourceEvidence.length,1);
});
test('snapshot and quote are deeply immutable, do not expose internal rate object', () => {
 const p=offline(), s=p.snapshot(), q=p.quote(input()); assert.throws(()=>s.rate_card.modelRates.small.inputMinorPerMillion=0,TypeError); assert.throws(()=>q.usage.input_tokens=0,TypeError); assert.throws(()=>q.sourceEvidence.push('changed'),TypeError);
});
test('synthetic cards refused in default production mode', () => { undefinedPrice(createPricing(card()).quote(input()),'SYNTHETIC_RATE_CARD_FORBIDDEN_IN_PRODUCTION'); });
test('synthetic quotes retain explicit synthetic/offline labels', () => { const q=offline().quote(input()); assert.equal(q.synthetic,true); assert.equal(q.verification,'SYNTHETIC'); assert.equal(q.mode,'OFFLINE_TEST'); });
test('verified marker accepted only with required provenance fields, not proof of external verification', () => {
 const q=createPricing(card({verification:'VERIFIED'})).quote(input()); assert.equal(q.status,'QUOTED'); assert.equal(q.external_evidence_independently_verified,false); assert.equal(q.usage_evidence_independently_verified,false);
});
test('completion remains independent from price closure', () => {
 const c=complete(createPricing(null).quote(input())), result=compareDeliveries(c,c); assert.equal(result.same_qualified_result,true); assert.equal(result.additional_value,'NO_PROVEN_ADDITIONAL_VALUE'); assert.equal(result.price_comparable,false); assert.equal(result.owner_return,true); assert.equal(result.premium_justified,false);
});
for(const [field,value] of [['verification','true'],['verifiedBy',''],['sourceEvidence',[]],['currency','usd'],['scope','FULL_HOST_COST']]) {
 test(`ratecard invalid ${field} fails closed`,()=>undefinedPrice(offline(card({[field]:value})).quote(input())));
}
test('required ratecard version cannot be omitted',()=>{const c=card();delete c.version;undefinedPrice(offline(c).quote(input()),'RATE_CARD_SCHEMA_INVALID');});
test('unknown top-level ratecard fields are rejected',()=>undefinedPrice(offline(card({unverifiedPremium:10})).quote(input()),'RATE_CARD_SCHEMA_INVALID'));
test('unknown model is not silently priced at another model rate',()=>undefinedPrice(offline().quote(input({modelId:'unpriced'})),'MODEL_RATE_UNDEFINED'));
test('missing output rate remains undefined',()=>undefinedPrice(offline(card({modelRates:{small:{inputMinorPerMillion:1}}})).quote(input()),'MODEL_RATE_SCHEMA_INVALID'));
for(const rate of [-1,0.5,Number.MAX_SAFE_INTEGER+1,NaN,Infinity,'100',1n]) {
 test(`invalid rate ${String(rate)} ${typeof rate} is rejected`,()=>undefinedPrice(offline(card({modelRates:{small:{inputMinorPerMillion:rate,outputMinorPerMillion:1}}})).quote(input()),'RATE_NOT_NONNEGATIVE_SAFE_INTEGER'));
}
for(const value of [-1,0.25,Number.MAX_SAFE_INTEGER+1,NaN,Infinity,'1',1n]) {
 test(`invalid measured count ${String(value)} ${typeof value} is rejected`,()=>undefinedPrice(offline().quote(input({usage:{input_tokens:value,output_tokens:1}})),'USAGE_NOT_NONNEGATIVE_SAFE_INTEGER'));
}
test('BigInt intermediate prevents multiplication overflow; huge result remains exact decimal not unsafe Number',()=>{
 const max=Number.MAX_SAFE_INTEGER, q=offline(card({modelRates:{small:{inputMinorPerMillion:max,outputMinorPerMillion:max}}})).quote(input({usage:{input_tokens:max,output_tokens:max}}));
 assert.equal(q.exact_minor_units.numerator,(2n*BigInt(max)*BigInt(max)).toString()); assert.equal(q.ceiling_minor_units,((2n*BigInt(max)*BigInt(max)+999999n)/1000000n).toString()); assert.equal(q.ceiling_minor_units_safe_integer,null);
});
test('cached input without an explicit cached rate uses ordinary input rate, no invented discount',()=>{
 const q=offline().quote(input({usage:{input_tokens:100,output_tokens:10,cached_input_tokens:50}}));assert.equal(q.exact_minor_units.numerator,'12000');assert.equal(q.discountApplied,false);assert.equal(q.cached_input_pricing,'ORDINARY_INPUT_RATE_NO_DISCOUNT');
});
test('cached tokens are a subset of total input and not double counted',()=>{
 const q=offline(card({modelRates:{small:{inputMinorPerMillion:100,outputMinorPerMillion:200,cachedInputMinorPerMillion:20}}})).quote(input({usage:{input_tokens:100,output_tokens:10,cached_input_tokens:50}}));
 assert.equal(q.exact_minor_units.numerator,'8000'); assert.equal(q.components_minor_units.uncached_input.numerator,'5000'); assert.equal(q.components_minor_units.cached_input.numerator,'1000');
});
test('cached input cannot exceed total input',()=>undefinedPrice(offline().quote(input({usage:{input_tokens:1,output_tokens:0,cached_input_tokens:2}})),'CACHED_TOKENS_EXCEED_TOTAL_INPUT'));
test('time rate fields cannot silently extend token-only scope',()=>undefinedPrice(offline(card({modelRates:{small:{inputMinorPerMillion:1,outputMinorPerMillion:1,minorPerHour:1}}})).quote(input()),'MODEL_RATE_SCHEMA_INVALID'));
test('wall time has same safe nonnegative integer requirement',()=>undefinedPrice(offline().quote(input({usage:{input_tokens:1,output_tokens:0,inference_wall_ms:-1}})),'USAGE_NOT_NONNEGATIVE_SAFE_INTEGER'));
test('usage evidence is required and does not get invented',()=>undefinedPrice(offline().quote(input({usageEvidence:''})),'ACTUAL_USAGE_EVIDENCE_REQUIRED'));
for(const value of [null,1,'bad',true,[],new Date()]) test(`malformed quote record ${String(value)} is contained`,()=>undefinedPrice(offline().quote(value),'QUOTE_INPUT_SCHEMA_INVALID'));
test('accessor rate field is rejected without reading the getter',()=>{let called=0;const c=card();Object.defineProperty(c,'version',{enumerable:true,get(){called++;throw Error('no');}});undefinedPrice(offline(c).quote(input()));assert.equal(called,0);});
test('accessor usage field is rejected without reading getter',()=>{let called=0;const u={output_tokens:1};Object.defineProperty(u,'input_tokens',{enumerable:true,get(){called++;return 1;}});undefinedPrice(offline().quote(input({usage:u})));assert.equal(called,0);});
test('prototype-named model IDs never select Object prototype properties',()=>undefinedPrice(offline().quote(input({modelId:'constructor'})),'MODEL_RATE_UNDEFINED'));
test('invalid options fail closed',()=>undefinedPrice(createPricing(card(),{mode:'PROD'}).quote(input()),'PRICING_MODE_INVALID'));
test('same qualified output establishes no measured additional value or size premium',()=>{
 const p=offline(), a=complete(p.quote(input())), b=complete(p.quote(input({modelId:'large'}))), r=compareDeliveries(a,b);
 assert.equal(r.same_qualified_result,true);assert.equal(r.additional_value,'NO_PROVEN_ADDITIONAL_VALUE');assert.equal(r.premium_justified,false);assert.equal(r.model_size_used_for_valuation,false);assert.deepEqual(r.exact_minor_units_delta,{numerator:'300000',denominator:'1000000'});assert.equal(r.ceiling_minor_units_delta,'0');
});
test('negative exact price differences remain signed and accurate',()=>{const p=offline(),r=compareDeliveries(complete(p.quote(input({modelId:'large'}))),complete(p.quote(input())));assert.equal(r.exact_minor_units_delta.numerator,'-300000');});
test('different currency cannot be subtracted or auto converted',()=>{
 const r=compareDeliveries(complete(offline().quote(input())),complete(offline(card({currency:'JPY'})).quote(input())));assert.equal(r.price_reason,'CURRENCY_MISMATCH');assert.equal(r.exact_minor_units_delta,null);
});
test('different scope cannot yield a numeric price difference',()=>{
 const q=offline().quote(input()),r=compareDeliveries(complete(q),complete({...q,scope:'FULL_HOST_COST'}));assert.equal(r.price_comparable,false);assert.equal(r.exact_minor_units_delta,null);
});
test('synthetic and verified accounting cannot be mixed as a production comparison',()=>{
 const r=compareDeliveries(complete(offline().quote(input())),complete(createPricing(card({verification:'VERIFIED'})).quote(input())));assert.equal(r.price_reason,'VERIFICATION_CONTEXT_MISMATCH');assert.equal(r.exact_minor_units_delta,null);
});
test('different criteria do not establish equivalent value from same output hash',()=>{
 const a=complete(offline().quote(input())),b={...a,quality:{passed:true,criterionId:'different'}};const r=compareDeliveries(a,b);assert.equal(r.criterion_comparable,false);assert.equal(r.same_qualified_result,false);
});
test('quality failure is not upgraded by low or zero API price',()=>{const a=complete(offline().quote(input())),b={...a,quality:{...a.quality,passed:false}};assert.equal(compareDeliveries(a,b).same_qualified_result,false);});
test('STOP is not treated as completed even if result hash matches',()=>{const a=complete(offline().quote(input()));assert.equal(compareDeliveries(a,{...a,deliveryStatus:'STOP'}).same_qualified_result,false);});
test('different results do not establish an added-value premium automatically',()=>{const a=complete(offline().quote(input())),r=compareDeliveries(a,{...a,resultHash:'b'.repeat(64)});assert.equal(r.additional_value,'NOT_ESTABLISHED_BY_THIS_COMPARISON');assert.equal(r.premium_justified,false);});
test('invalid comparison data returns undefined without throwing',()=>{assert.equal(compareDeliveries(null,1).status,'COMPARISON_UNDEFINED');});
test('tampered rational/ceiling accounting not accepted for difference',()=>{const q=offline().quote(input()),r=compareDeliveries(complete(q),complete({...q,ceiling_minor_units:'999'}));assert.equal(r.price_comparable,false);});
test('reservation estimate is explicit and never labelled measured usage or actual cost',()=>{
 const e=offline().estimate({modelId:'small',usageBudget:{input_tokens:1984,output_tokens:64},estimateEvidence:'inert:protocol-budget'});
 assert.equal(e.status,'ESTIMATED'); assert.equal(e.usage_kind,'RESERVATION_ESTIMATE'); assert.equal(e.estimate_is_actual_cost,false); assert.equal(e.exact_minor_units.numerator,'211200'); assert.equal(Object.hasOwn(e,'usage'),false); assert.equal(Object.hasOwn(e,'usageEvidence'),false);
});
test('reservation estimates cannot substitute for actual cost in a completed delivery comparison',()=>{
 const p=offline(),e=p.estimate({modelId:'small',usageBudget:{input_tokens:1984,output_tokens:64},estimateEvidence:'inert:protocol-budget'});
 const r=compareDeliveries(complete(e),complete(p.quote(input())));assert.equal(r.price_comparable,false);assert.equal(r.price_reason,'PRICE_NOT_CLOSED');
});
test('reservation estimates also require a ratecard and provenance',()=>{
 undefinedPrice(createPricing().estimate({}),'RATE_CARD_REQUIRED');undefinedPrice(offline().estimate({modelId:'small',usageBudget:{input_tokens:1,output_tokens:1}}),'ESTIMATE_INPUT_SCHEMA_INVALID');
});
test('published provider reference from measured usage is not a local invoice or hardware cost',()=>{
 const q=offline(card({scope:REFERENCE_SCOPE,currencyMinorExponent:6})).quote(input());assert.equal(q.status,'PRICE_DEFINED_REFERENCE');assert.equal(q.basis_status,'QUOTED');assert.equal(q.usage_kind,'MEASURED');assert.equal(q.currencyMinorExponent,6);assert.equal(q.local_actual_cost,'NOT_MEASURED');assert.equal(q.local_paid_bill,false);assert.equal(q.paid_invoice_verified,false);
});
test('published reference reservation keeps separate estimate basis and not actual cost',()=>{
 const q=offline(card({scope:REFERENCE_SCOPE})).estimate({modelId:'small',usageBudget:{input_tokens:1984,output_tokens:64},estimateEvidence:'inert:budget'});assert.equal(q.status,'PRICE_DEFINED_REFERENCE');assert.equal(q.basis_status,'ESTIMATED');assert.equal(q.usage_kind,'RESERVATION_ESTIMATE');assert.equal(q.estimate_is_actual_cost,false);
});
test('reference and API-only scopes cannot be mixed for a price delta',()=>{
 const r=compareDeliveries(complete(offline().quote(input())),complete(offline(card({scope:REFERENCE_SCOPE})).quote(input())));assert.equal(r.price_reason,'SCOPE_MISMATCH');assert.equal(r.exact_minor_units_delta,null);
});
test('differently scaled currency units are not blindly subtracted',()=>{
 const r=compareDeliveries(complete(offline().quote(input())),complete(offline(card({currencyMinorExponent:6})).quote(input())));assert.equal(r.price_reason,'CURRENCY_UNIT_EXPONENT_MISMATCH');assert.equal(r.exact_minor_units_delta,null);
});
for(const exponent of [-1,10,1.5,'6',null]) test(`invalid currency unit exponent ${String(exponent)} is refused`,()=>undefinedPrice(offline(card({currencyMinorExponent:exponent})).quote(input()),'CURRENCY_UNIT_EXPONENT_INVALID'));
test('currency scale must be explicit, not inferred from a currency name',()=>{const c=card();delete c.currencyMinorExponent;undefinedPrice(offline(c).quote(input()),'RATE_CARD_SCHEMA_INVALID');});
test('sparse evidence arrays do not substitute for actual source references',()=>undefinedPrice(offline(card({sourceEvidence:Array(1)})).quote(input()),'SOURCE_EVIDENCE_REQUIRED'));
test('evidence array getters are rejected without invoking user code',()=>{let called=0;const source=['x'];Object.defineProperty(source,0,{enumerable:true,get(){called++;return 'not-read';}});undefinedPrice(offline(card({sourceEvidence:source})).quote(input()),'SOURCE_EVIDENCE_REQUIRED');assert.equal(called,0);});
test('qualified candidate completion absent from baseline is an observed delivery benefit, not a justified premium',()=>{
 const q=offline().quote(input()),b=complete(q),a={...b,deliveryStatus:'FAILED',resultHash:null,quality:{...b.quality,passed:false}},r=compareDeliveries(a,b);
 assert.equal(r.candidate_delivered_qualified_completion_baseline_did_not,true);assert.equal(r.additional_value,'CANDIDATE_DELIVERED_QUALIFIED_COMPLETION_BASELINE_DID_NOT');assert.equal(r.premium_justified,false);assert.equal(r.same_qualified_result,false);
 assert.equal(compareDeliveries(a,{...b,deliveryStatus:'STOP'}).candidate_delivered_qualified_completion_baseline_did_not,false);
 assert.equal(compareDeliveries(a,{...b,quality:{passed:true,criterionId:'different'}}).candidate_delivered_qualified_completion_baseline_did_not,false);
});
