import {dataCopy,freeze,nonempty} from './contract.mjs';
export function validateAdapter(provider,c) {
 if(!provider||typeof provider.generate!=='function'||typeof provider.countInputTokens!=='function') throw new TypeError('PROVIDER_MUST_SUPPLY_GENERATE_AND_TOKEN_COUNT');
 const d=freeze(dataCopy(provider.descriptor));
 if(!nonempty(d.id)||!['fixture','local','remote'].includes(d.kind)||d.model!==c.model||d.modelVersion!==c.modelVersion) throw new TypeError('ADAPTER_IDENTITY_MISMATCH');
 for(const [k,v] of Object.entries({counting:'EXACT_PAYLOAD_UPPER_BOUND',outputLimit:'ENFORCED',priceScope:'INPUT_OUTPUT_ONLY',counterMayBill:false})) if(d[k]!==v) throw new TypeError('ADAPTER_CAPABILITY:'+k);
 if(!['BEST_EFFORT','NOT_SUPPORTED'].includes(d.cancellation)) throw new TypeError('ADAPTER_CANCELLATION');
 return Object.freeze({descriptor:d,count:provider.countInputTokens.bind(provider),generate:provider.generate.bind(provider)});
}
export function validateUsage(result,d) {
 const errors=[]; const u=result?.usage;
 if(!u || typeof u!=='object' || Array.isArray(u)) return {valid:false,errors:['USAGE_MISSING_OR_INVALID_RECORD']};
 for(const k of ['input_tokens','output_tokens','total_tokens']) if(!Number.isSafeInteger(u[k])||u[k]<0) errors.push('INVALID_'+k);
 if(errors.length===0 && BigInt(u.total_tokens)!==BigInt(u.input_tokens)+BigInt(u.output_tokens)) errors.push('TOTAL_MISMATCH');
 for(const [k,max] of [['cached_tokens',u.input_tokens],['reasoning_tokens',u.output_tokens]]) if(k in u && (!Number.isSafeInteger(u[k])||u[k]<0||u[k]>max)) errors.push('INVALID_'+k);
 if(!nonempty(result?.request_id)||!nonempty(result?.usage_source)) errors.push('PROVENANCE_MISSING');
 if(result?.model!==d.model||result?.model_version!==d.modelVersion) errors.push('MODEL_VERSION_MISMATCH');
 if(d.kind==='fixture'?result?.usage_source!=='fixture':result?.usage_source!=='provider_reported') errors.push('USAGE_SOURCE_MISMATCH');
 if('actual_cost_usd' in (result??{})&&(!Number.isFinite(result.actual_cost_usd)||result.actual_cost_usd<0)) errors.push('INVALID_ACTUAL_COST');
 if(result?.unpriced_charges===true) errors.push('UNPRICED_CHARGES');
 return {valid:errors.length===0,errors};
}
