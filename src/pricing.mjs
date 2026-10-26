// Exact, scope-limited accounting from caller-supplied measured usage and a
// verified rate-card reference. This module does not verify external evidence,
// establish a market price, measure host cost, or award a model-size premium.
export const PRICING_VERSION = 'scope-limited-exact-pricing-v0.2';
export const PRICE_SCOPE = 'API_INPUT_OUTPUT_ONLY';
export const REFERENCE_SCOPE = 'PUBLISHED_PROVIDER_INFERENCE_REFERENCE';
const MILLION = 1000000n;
const safeCount = n => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
const nonempty = s => typeof s === 'string' && s.trim().length > 0;
const copy = v => structuredClone(v);
function freeze(v) {
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) freeze(v[k]); Object.freeze(v); }
  return v;
}
function record(v) {
  try {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
    if (![Object.prototype, null].includes(Object.getPrototypeOf(v))) return null;
    const out = Object.create(null), desc = Object.getOwnPropertyDescriptors(v);
    for (const k of Reflect.ownKeys(desc)) {
      if (typeof k !== 'string' || !Object.hasOwn(desc[k], 'value') || !desc[k].enumerable) return null;
      out[k] = desc[k].value;
    }
    return out;
  } catch { return null; }
}
function keys(v, required, optional = []) {
  return required.every(k => Object.hasOwn(v, k)) && Object.keys(v).every(k => [...required, ...optional].includes(k));
}
function evidence(value) {
  if (nonempty(value)) return value;
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return null;
  const descriptors = Object.getOwnPropertyDescriptors(value), length = descriptors.length?.value;
  if (!Number.isSafeInteger(length) || length < 1 || Reflect.ownKeys(descriptors).length !== length + 1) return null;
  const result = [];
  for (let i = 0; i < length; i++) {
    const item = descriptors[i];
    if (!item || !Object.hasOwn(item, 'value') || !item.enumerable || !nonempty(item.value)) return null;
    result.push(item.value);
  }
  return result;
}
const failure = (reason, missing_fields = [], extra = {}) => freeze({
  status: 'PRICE_UNDEFINED', owner_return: true, reason, missing_fields,
  currency: null, exact_minor_units: null, ceiling_minor_units: null,
  full_host_cost_closed: false, zero_api_price_implies_zero_total_cost: false,
  ...extra,
});
function normalizeCard(value, mode) {
  const required = ['rateCardId', 'version', 'currency', 'currencyMinorExponent', 'scope', 'sourceEvidence', 'verifiedBy', 'verification', 'modelRates'];
  if (value == null) return {error: failure('RATE_CARD_REQUIRED', required.map(k => `rateCard.${k}`))};
  const v = record(value);
  if (!v) return {error: failure('RATE_CARD_SCHEMA_INVALID', ['rateCard'])};
  const missing = required.filter(k => !Object.hasOwn(v, k));
  if (!keys(v, required)) return {error: failure('RATE_CARD_SCHEMA_INVALID', missing.map(k => `rateCard.${k}`))};
  for (const k of ['rateCardId', 'version', 'verifiedBy']) if (!nonempty(v[k])) return {error: failure('RATE_CARD_FIELD_INVALID', [`rateCard.${k}`])};
  if (typeof v.currency !== 'string' || !/^[A-Z]{3}$/.test(v.currency)) return {error: failure('CURRENCY_CODE_REQUIRED', ['rateCard.currency'])};
  if (!Number.isInteger(v.currencyMinorExponent) || v.currencyMinorExponent < 0 || v.currencyMinorExponent > 9) return {error: failure('CURRENCY_UNIT_EXPONENT_INVALID', ['rateCard.currencyMinorExponent'])};
  if (![PRICE_SCOPE, REFERENCE_SCOPE].includes(v.scope)) return {error: failure('UNSUPPORTED_COST_SCOPE', ['rateCard.scope'])};
  const sourceEvidence = evidence(v.sourceEvidence);
  if (!sourceEvidence) return {error: failure('SOURCE_EVIDENCE_REQUIRED', ['rateCard.sourceEvidence'])};
  if (!['VERIFIED', 'SYNTHETIC'].includes(v.verification)) return {error: failure('RATE_CARD_NOT_VERIFIED', ['rateCard.verification'])};
  if (v.verification === 'SYNTHETIC' && mode !== 'OFFLINE_TEST') return {error: failure('SYNTHETIC_RATE_CARD_FORBIDDEN_IN_PRODUCTION', ['rateCard.verification'])};
  const rates = record(v.modelRates);
  if (!rates || !Object.keys(rates).length) return {error: failure('MODEL_RATES_REQUIRED', ['rateCard.modelRates'])};
  const normalized = Object.create(null);
  for (const [model, entry] of Object.entries(rates)) {
    if (!nonempty(model) || ['__proto__', 'constructor', 'prototype'].includes(model)) return {error: failure('MODEL_ID_INVALID', ['rateCard.modelRates'])};
    const r = record(entry), requiredRates = ['inputMinorPerMillion', 'outputMinorPerMillion'];
    if (!r || !keys(r, requiredRates, ['cachedInputMinorPerMillion'])) return {error: failure('MODEL_RATE_SCHEMA_INVALID', [`rateCard.modelRates.${model}`])};
    for (const [key, rate] of Object.entries(r)) if (!safeCount(rate)) return {error: failure('RATE_NOT_NONNEGATIVE_SAFE_INTEGER', [`rateCard.modelRates.${model}.${key}`])};
    normalized[model] = {...r};
  }
  return {card: freeze({...v, sourceEvidence, modelRates: normalized})};
}
function exactAmount(numerator, denominator = MILLION) {
  return {numerator: numerator.toString(), denominator: denominator.toString()};
}

// input_tokens INCLUDES cached_input_tokens. Without a published cached rate,
// every input token uses the ordinary input rate; no cache discount is invented.
// inference_wall_ms is recorded only: this scope has no time/hardware rate.
export function createPricing(rateCard, options = {}) {
  const opts = record(options);
  const mode = opts && keys(opts, [], ['mode']) ? (opts.mode ?? 'PRODUCTION') : null;
  let normalized;
  try { normalized = ['PRODUCTION', 'OFFLINE_TEST'].includes(mode) ? normalizeCard(rateCard, mode) : {error: failure('PRICING_MODE_INVALID', ['options.mode'])}; }
  catch { normalized = {error: failure('RATE_CARD_SCHEMA_INVALID', ['rateCard'])}; }
  const {card, error} = normalized;
  function snapshot() { return freeze({version: PRICING_VERSION, mode, rate_card: card ? copy(card) : null, validation: error ? copy(error) : {status: 'RATE_CARD_ACCEPTED', external_evidence_independently_verified: false}}); }
  function quote(input) {
    if (error) return error;
    try {
      const q = record(input);
      if (!q || !keys(q, ['modelId', 'usage', 'usageEvidence']) || !nonempty(q.modelId)) return failure('QUOTE_INPUT_SCHEMA_INVALID', ['modelId', 'usage', 'usageEvidence']);
      if (!nonempty(q.usageEvidence)) return failure('ACTUAL_USAGE_EVIDENCE_REQUIRED', ['usageEvidence']);
      if (!Object.hasOwn(card.modelRates, q.modelId)) return failure('MODEL_RATE_UNDEFINED', [`rateCard.modelRates.${q.modelId}`]);
      const usage = record(q.usage);
      if (!usage || !keys(usage, ['input_tokens', 'output_tokens'], ['cached_input_tokens', 'inference_wall_ms'])) return failure('USAGE_SCHEMA_INVALID', ['usage.input_tokens', 'usage.output_tokens']);
      for (const [key, value] of Object.entries(usage)) if (!safeCount(value)) return failure('USAGE_NOT_NONNEGATIVE_SAFE_INTEGER', [`usage.${key}`]);
      const cached = usage.cached_input_tokens ?? 0;
      if (cached > usage.input_tokens) return failure('CACHED_TOKENS_EXCEED_TOTAL_INPUT', ['usage.cached_input_tokens']);
      const rate = card.modelRates[q.modelId];
      const cachedRateDefined = Object.hasOwn(rate, 'cachedInputMinorPerMillion');
      const cachedRate = cachedRateDefined ? rate.cachedInputMinorPerMillion : rate.inputMinorPerMillion;
      const inputN = BigInt(usage.input_tokens - cached) * BigInt(rate.inputMinorPerMillion);
      const cachedN = BigInt(cached) * BigInt(cachedRate);
      const outputN = BigInt(usage.output_tokens) * BigInt(rate.outputMinorPerMillion);
      const n = inputN + cachedN + outputN, ceiling = (n + MILLION - 1n) / MILLION;
      return freeze({
        status: card.scope === REFERENCE_SCOPE ? 'PRICE_DEFINED_REFERENCE' : 'QUOTED', basis_status: 'QUOTED', usage_kind: 'MEASURED', owner_return: false, pricing_version: PRICING_VERSION,
        modelId: q.modelId, usage: {...usage, cached_input_tokens: cached}, usageEvidence: q.usageEvidence,
        usage_evidence_independently_verified: false, input_tokens_include_cached: true,
        rateCardId: card.rateCardId, rateCardVersion: card.version, currency: card.currency, currencyMinorExponent: card.currencyMinorExponent,
        scope: card.scope, sourceEvidence: copy(card.sourceEvidence), verifiedBy: card.verifiedBy,
        verification: card.verification, mode, synthetic: card.verification === 'SYNTHETIC',
        external_evidence_independently_verified: false,
        exact_minor_units: exactAmount(n), ceiling_minor_units: ceiling.toString(),
        ceiling_minor_units_safe_integer: ceiling <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(ceiling) : null,
        remainder_numerator: (n % MILLION).toString(), rounding: 'CEILING_ONCE_AFTER_COMPONENT_SUM',
        components_minor_units: {uncached_input: exactAmount(inputN), cached_input: exactAmount(cachedN), output: exactAmount(outputN)},
        inference_wall_ms_priced: false, full_host_cost_closed: false,
        cached_rate_defined: cachedRateDefined, discountApplied: cached > 0 && cachedRateDefined && cachedRate < rate.inputMinorPerMillion,
        cached_input_pricing: cachedRateDefined ? 'EXPLICIT_CACHED_RATE' : 'ORDINARY_INPUT_RATE_NO_DISCOUNT',
        valuation_basis: card.scope === REFERENCE_SCOPE ? 'PUBLISHED_PROVIDER_REFERENCE' : 'API_INPUT_OUTPUT_RATE_CARD',
        local_paid_bill: false, local_actual_cost: 'NOT_MEASURED', paid_invoice_verified: false,
        zero_api_price_implies_zero_total_cost: false,
      });
    } catch { return failure('QUOTE_INPUT_SCHEMA_INVALID', ['quoteInput']); }
  }
  function estimate(input) {
    if (error) return error;
    try {
      const e = record(input);
      if (!e || !keys(e, ['modelId', 'usageBudget', 'estimateEvidence']) || !nonempty(e.estimateEvidence)) return failure('ESTIMATE_INPUT_SCHEMA_INVALID', ['modelId', 'usageBudget', 'estimateEvidence']);
      const calculated = quote({modelId: e.modelId, usage: e.usageBudget, usageEvidence: e.estimateEvidence});
      if (!['QUOTED', 'PRICE_DEFINED_REFERENCE'].includes(calculated.status)) return calculated;
      const {usage, usageEvidence, usage_evidence_independently_verified, ...rest} = calculated;
      return freeze({...rest, status: card.scope === REFERENCE_SCOPE ? 'PRICE_DEFINED_REFERENCE' : 'ESTIMATED', basis_status: 'ESTIMATED', usage_kind: 'RESERVATION_ESTIMATE', usageBudget: usage, estimateEvidence: usageEvidence, estimate_is_actual_cost: false});
    } catch { return failure('ESTIMATE_INPUT_SCHEMA_INVALID', ['estimateInput']); }
  }
  return Object.freeze({snapshot, quote, estimate});
}

function delivery(value) {
  const d = record(value), q = d && record(d.quality);
  if (!d || !keys(d, ['deliveryStatus', 'quality', 'resultHash', 'quote']) || !['COMPLETE', 'STOP', 'OWNER_RETURN', 'FAILED'].includes(d.deliveryStatus)) return null;
  if (!q || !keys(q, ['passed', 'criterionId']) || typeof q.passed !== 'boolean' || !nonempty(q.criterionId)) return null;
  if (!(d.resultHash === null || (typeof d.resultHash === 'string' && /^[a-f0-9]{64}$/.test(d.resultHash)))) return null;
  if (d.deliveryStatus === 'COMPLETE' && !d.resultHash) return null;
  return {...d, quality: q};
}
function quoteForComparison(value) {
  const q = record(value), amount = q && record(q.exact_minor_units);
  if (!q || !['QUOTED', 'PRICE_DEFINED_REFERENCE'].includes(q.status) || q.basis_status !== 'QUOTED' || q.usage_kind !== 'MEASURED' || ![PRICE_SCOPE, REFERENCE_SCOPE].includes(q.scope) || typeof q.currency !== 'string' || !/^[A-Z]{3}$/.test(q.currency)) return null;
  if ((q.scope === REFERENCE_SCOPE) !== (q.status === 'PRICE_DEFINED_REFERENCE') || !Number.isInteger(q.currencyMinorExponent) || q.currencyMinorExponent < 0 || q.currencyMinorExponent > 9) return null;
  if (!['VERIFIED', 'SYNTHETIC'].includes(q.verification) || !['PRODUCTION', 'OFFLINE_TEST'].includes(q.mode) || (q.verification === 'SYNTHETIC' && q.mode !== 'OFFLINE_TEST')) return null;
  if (!amount || !keys(amount, ['numerator', 'denominator']) || typeof amount.numerator !== 'string' || !/^(0|[1-9][0-9]*)$/.test(amount.numerator) || amount.denominator !== MILLION.toString()) return null;
  if (amount.numerator.length > 40) return null; // More than sufficient for safe-integer counts × rates.
  const n = BigInt(amount.numerator);
  if (q.ceiling_minor_units !== ((n + MILLION - 1n) / MILLION).toString()) return null;
  return {...q, n};
}

// Delivery/quality observations and price closure are independent. Same result
// means only no additional value established by this criterion and result hash;
// it does not prove equivalence on other tasks or infer value from model size.
export function compareDeliveries(baseline, candidate) {
  try {
    const a = delivery(baseline), b = delivery(candidate);
    if (!a || !b) return freeze({status: 'COMPARISON_UNDEFINED', owner_return: true, reason: 'DELIVERY_SCHEMA_INVALID', price_comparable: false, exact_minor_units_delta: null});
    const sameCriterion = a.quality.criterionId === b.quality.criterionId;
    const sameResult = sameCriterion && a.deliveryStatus === 'COMPLETE' && b.deliveryStatus === 'COMPLETE' && a.quality.passed && b.quality.passed && a.resultHash === b.resultHash;
    const candidateCompletedBaselineDidNot = sameCriterion && b.deliveryStatus === 'COMPLETE' && b.quality.passed && !(a.deliveryStatus === 'COMPLETE' && a.quality.passed);
    const qa = quoteForComparison(a.quote), qb = quoteForComparison(b.quote);
    let priceReason = null;
    if (!qa || !qb) priceReason = 'PRICE_NOT_CLOSED';
    else if (qa.currency !== qb.currency) priceReason = 'CURRENCY_MISMATCH';
    else if (qa.scope !== qb.scope) priceReason = 'SCOPE_MISMATCH';
    else if (qa.currencyMinorExponent !== qb.currencyMinorExponent) priceReason = 'CURRENCY_UNIT_EXPONENT_MISMATCH';
    else if (qa.verification !== qb.verification || qa.mode !== qb.mode) priceReason = 'VERIFICATION_CONTEXT_MISMATCH';
    return freeze({
      status: 'COMPARED', owner_return: Boolean(priceReason),
      baseline_delivery_status: a.deliveryStatus, candidate_delivery_status: b.deliveryStatus,
      baseline_quality_passed: a.quality.passed, candidate_quality_passed: b.quality.passed,
      criterion_comparable: sameCriterion, same_qualified_result: Boolean(sameResult),
      candidate_delivered_qualified_completion_baseline_did_not: candidateCompletedBaselineDidNot,
      additional_value: sameResult ? 'NO_PROVEN_ADDITIONAL_VALUE' : candidateCompletedBaselineDidNot ? 'CANDIDATE_DELIVERED_QUALIFIED_COMPLETION_BASELINE_DID_NOT' : 'NOT_ESTABLISHED_BY_THIS_COMPARISON',
      premium_justified: false, model_size_used_for_valuation: false,
      price_comparable: !priceReason, price_reason: priceReason,
      currency: priceReason ? null : qa.currency, scope: priceReason ? null : qa.scope,
      currencyMinorExponent: priceReason ? null : qa.currencyMinorExponent,
      exact_minor_units_delta: priceReason ? null : exactAmount(qb.n - qa.n),
      ceiling_minor_units_delta: priceReason ? null : (BigInt(qb.ceiling_minor_units) - BigInt(qa.ceiling_minor_units)).toString(),
      delta_direction: 'CANDIDATE_MINUS_BASELINE', full_host_cost_closed: false,
    });
  } catch { return freeze({status: 'COMPARISON_UNDEFINED', owner_return: true, reason: 'COMPARISON_INPUT_INVALID', price_comparable: false, exact_minor_units_delta: null}); }
}
