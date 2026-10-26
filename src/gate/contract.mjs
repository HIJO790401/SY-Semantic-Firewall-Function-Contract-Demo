// Public research interface mapping only. Not a private SCBKR/AVRCK implementation.
import {createHash} from 'node:crypto';
export const CANON = Object.freeze({id:'SY-BSJC.v0.1', url:'PUBLIC_OWNER_DEFINITIONS.md'});
export const REQUIRED_RESEARCH_FIELDS = Object.freeze([
 'CASE_ID','OWNER_P0_REF','RULE_SPEC_VERSION','SUBJECT_CONTRACT_REF',
 'S_BUSINESS_PRINCIPAL','S_AUTHORITY_SCOPE','S_RULE_OWNER',
 'ENVIRONMENT_ID','TIME_WINDOW','CRITERION_ID','SCOPE_ID',
 'G_VERSION','G_FUNCTIONS','G_DETERMINISTIC_CAPABILITIES','G_CAPACITY_LIMITS','G_FAILURE_CONDITIONS',
 'P_VERSION','P_FUNCTIONS','P_UPGRADE_PATHS','P_DEV_API_PERMISSIONS','P_USER_INTERACTION',
 'GP_CAPABILITY_MAPPING','DEVELOPMENT_PARTICIPATION_BOUNDARY',
 'M_QUESTION_ID','M_VALUE_GOAL','M_EXPANSION_PATH_CANDIDATES','M_GP_SOLUTION_PATH','M_VALIDATION_POINT','M_FALSIFIER',
 'Y_SCOPE_CANDIDATE','Y_VALID_WHEN','Y_INVALID_WHEN','Y_REPLAY_REF',
 'EVIDENCE_REFS','OWNER_REVIEW_STATE'
]);
export function dataCopy(v) {
 if(v===null || typeof v==='string' || typeof v==='boolean') return v;
 if(typeof v==='number' && Number.isFinite(v)) return v;
 if(Array.isArray(v)) return v.map(dataCopy);
 if(v && Object.getPrototypeOf(v)===Object.prototype) {
  const result={};
  for(const key of Object.keys(v)) {
   const d=Object.getOwnPropertyDescriptor(v,key);
   if(!d || !('value' in d) || key==='__proto__') throw new TypeError('DATA_ONLY');
   result[key]=dataCopy(d.value);
  }
  return result;
 }
 throw new TypeError('DATA_ONLY');
}
export function freeze(v) { if(v && typeof v==='object') {Object.values(v).forEach(freeze);Object.freeze(v);} return v; }
const canonical = v => Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export const hash = v => createHash('sha256').update(typeof v==='string'?v:JSON.stringify(canonical(v))).digest('hex');
export const nonempty = v => typeof v==='string' && v.trim().length>0 && !/^(UNKNOWN|TBD|TODO|UNDEFINED|PENDING|N\/A)$/i.test(v.trim());
function supplied(v) {return nonempty(v) || (Array.isArray(v)&&v.length>0&&v.every(nonempty));}
export function researchGaps(c) {
 const r=c.researchContract??{};
 const missing=REQUIRED_RESEARCH_FIELDS.filter(k=>!supplied(r[k]));
 if(r.RULE_SPEC_VERSION!==CANON.id) missing.push('RULE_SPEC_VERSION:CANON_MISMATCH');
 if(r.CASE_ID!==c.caseId) missing.push('CASE_ID:BINDING_MISMATCH');
 if(r.OWNER_P0_REF!==c.ownerRef) missing.push('OWNER_P0_REF:BINDING_MISMATCH');
 for(const k of ['rubricId','rubricVersion','evaluatorId']) if(!nonempty(c.completion?.[k])) missing.push('completion.'+k);
 return [...new Set(missing)];
}
export function validateContract(input) {
 const c=dataCopy(input);
 for(const k of ['caseId','model','modelVersion','version','ownerRef']) if(!nonempty(c[k])) throw new TypeError('INVALID_CONTRACT:'+k);
 for(const k of ['maxCalls','maxTotalTokens','maxOutputPerCall']) if(!Number.isSafeInteger(c[k])||c[k]<0) throw new TypeError(k);
 for(const k of ['maxCostUsd','inputUsdPerMillion','outputUsdPerMillion']) if(!Number.isFinite(c[k])||c[k]<0) throw new TypeError(k);
 if(!Array.isArray(c.allowedTools)||!c.allowedTools.every(nonempty)||new Set(c.allowedTools).size!==c.allowedTools.length) throw new TypeError('allowedTools');
 for(const k of ['countMs','generateMs','verifyMs']) if(!Number.isSafeInteger(c.timeouts?.[k])||c.timeouts[k]<1||c.timeouts[k]>2147483647) throw new TypeError('timeouts.'+k);
 return freeze(c);
}
// Integer nano-USD, decimal parsing: no floating-point budget epsilon or negative/NaN loophole.
function ratio(value) {
 const [mantissa,exponent='0']=String(value).toLowerCase().split('e');
 const [whole,fraction='']=mantissa.split('.');const exp=Number(exponent)-fraction.length;
 return exp>=0?[BigInt(whole+fraction)*10n**BigInt(exp),1n]:[BigInt(whole+fraction),10n**BigInt(-exp)];
}
const ceilDiv=(a,b)=>(a+b-1n)/b;
export function usdNanos(n,{floor=false}={}) {const [a,b]=ratio(n);return floor?a*1000000000n/b:ceilDiv(a*1000000000n,b);}
export function tokenCost(input,output,c) {
 const [a,b]=ratio(c.inputUsdPerMillion),[d,e]=ratio(c.outputUsdPerMillion);
 return ceilDiv((BigInt(input)*a*e+BigInt(output)*d*b)*1000n,b*e);
}
export const displayInt = n => n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(n):n.toString();
export const displayUsd = n => {const decimal=n.toString().padStart(10,'0');const str=decimal.slice(0,-9)+'.'+decimal.slice(-9);return n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(str):str;};
