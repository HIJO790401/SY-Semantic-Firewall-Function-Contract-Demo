// Controlled, fail-closed public reference; never a private kernel or model sandbox.
import {dataCopy,freeze,hash,nonempty,validateContract,researchGaps,usdNanos,tokenCost,displayInt,displayUsd} from './contract.mjs';
import {validateAdapter,validateUsage} from './adapter.mjs';
export const STOP=Object.freeze(Object.fromEntries(['TASK_COMPLETE','OWNER_DEFINITION_REQUIRED','BUDGET_LIMIT_REACHED','RULE_BOUNDARY_VIOLATION','PROVIDER_USAGE_MISSING','PROVIDER_ERROR','PROVIDER_TIMEOUT','COMPLETION_UNVERIFIED','QUALITY_NOT_MET','EVALUATION_ERROR','OWNER_STOP'].map(k=>[k,k])));
export function createGate(contract,provider,{completionVerifier}={}) {
 const c=validateContract(contract), adapter=validateAdapter(provider,c), d=adapter.descriptor;
 if(completionVerifier!==undefined&&typeof completionVerifier!=='function') throw new TypeError('COMPLETION_VERIFIER');
 const contractHash=hash(c),events=[];const limit=usdNanos(c.maxCostUsd,{floor:true});
 let calls=0,busy=false,stopped=null,stage='IDLE',seq=0,controller=null,reservation=null;
 let input=0n,output=0n,rateCost=0n,reportedCost=0n,commitCost=0n,reportedCostCalls=0,unknownUsageCalls=0,pendingCalls=0,verified=0;
 const event=(kind,detail={})=>events.push(freeze({sequence:++seq,utc:new Date().toISOString(),kind,...dataCopy(detail)}));
 const snapshot=()=>dataCopy({schema_version:'SY-TOKEN-STOP-AB.RECEIPT.v0.2',case_id:c.caseId,model:c.model,model_version:c.modelVersion,version:c.version,contract_sha256:contractHash,adapter:d,
  scope:'PUBLIC_REFERENCE_CONTRACT_ONLY',calls,busy,stage,stop_reason:stopped,usage:{input_tokens:displayInt(input),output_tokens:displayInt(output),total_tokens:displayInt(input+output)},
  usage_completeness:pendingCalls?'PENDING':unknownUsageCalls?'UNRECONCILED':'RECONCILED',pending_calls:pendingCalls,unreconciled_calls:unknownUsageCalls,
  metered_rate_estimate_usd:displayUsd(rateCost),provider_reported_cost_usd:reportedCostCalls?displayUsd(reportedCost):null,provider_reported_cost_calls:reportedCostCalls,
  actual_total_cost_status:pendingCalls?'PENDING':unknownUsageCalls?'UNKNOWN':reportedCostCalls===calls&&calls>0?'PROVIDER_REPORTED_NOT_INDEPENDENTLY_AUDITED':'NOT_MEASURED_RATE_ESTIMATE_ONLY',
  budget_committed_usd:displayUsd(commitCost),budget_committed_nanousd:commitCost.toString(),reservation:reservation?{call_id:reservation.callId,tokens:displayInt(reservation.tokens),cost_nanousd:reservation.cost.toString(),status:reservation.status}:null,
  verified_completed_tasks:verified,commercial_Y_status:'NOT_EVALUATED',real_model_ab:'NOT_RUN_BY_PACKAGE',original_private_runtime_tested:false,receipt_events:events});
 const response=(status=stopped,extra={})=>({accepted:false,status, ...extra,receipt:snapshot()});
 function halt(reason,detail={}) {if(!stopped){stopped=reason;event('stop',{reason,...detail});controller?.abort(reason);}return response();}
 function stop(reason=STOP.OWNER_STOP) {if(reason!==STOP.OWNER_STOP) reason=STOP.OWNER_STOP;return halt(reason,{cancellation_guarantee:'NONE',future_dispatch_blocked:true});}
 // A timeout stops admission immediately; an in-flight provider may still bill and settle later.
 function timed(promise,ms,onTimeout) {
  let timer;return Promise.race([promise,new Promise(resolve=>{timer=setTimeout(()=>{onTimeout();resolve({timeout:true});},ms);})]).finally(()=>clearTimeout(timer));
 }
 function reconcile(raw,r,late=false) {
  pendingCalls--; let result;
  try {result=dataCopy(raw);} catch {result=null;}
  const check=validateUsage(result,d);
  // A monetary report is preserved independently even when token/provenance validation fails.
  const hasCost=Number.isFinite(result?.actual_cost_usd)&&result.actual_cost_usd>=0;
  const actual=hasCost?usdNanos(result.actual_cost_usd):0n;
  if(hasCost){reportedCost+=actual;reportedCostCalls++;}
  if(!check.valid){
   unknownUsageCalls++;r.status='UNRECONCILED';
   if(actual>r.cost) commitCost+=actual-r.cost;
   event('usage_rejected',{call_id:r.callId,late,errors:check.errors,provider_reported_cost_usd:hasCost?result.actual_cost_usd:null,charges_may_exist:true});
   halt(STOP.PROVIDER_USAGE_MISSING,{call_id:r.callId,errors:check.errors});return {valid:false};
  }
  const u=result.usage,estimated=tokenCost(u.input_tokens,u.output_tokens,c),charge=actual>estimated?actual:estimated;
  input+=BigInt(u.input_tokens);output+=BigInt(u.output_tokens);rateCost+=estimated;commitCost=commitCost-r.cost+charge;reservation=null;
  event('usage_reconciled',{call_id:r.callId,late,model:result.model,model_version:result.model_version,provider_request_id:result.request_id,usage_source:result.usage_source,usage:u,rate_estimate_usd:displayUsd(estimated),provider_reported_cost_usd:hasCost?result.actual_cost_usd:null,finish_reason:result.finish_reason??'UNKNOWN'});
  const breaches=[];
  if(u.input_tokens>r.inputCount) breaches.push('INPUT_EXCEEDS_COUNT_BOUND');
  if(u.output_tokens>c.maxOutputPerCall) breaches.push('OUTPUT_LIMIT_EXCEEDED');
  if(input+output>BigInt(c.maxTotalTokens)) breaches.push('TOTAL_TOKEN_BUDGET_EXCEEDED');
  if(commitCost>limit) breaches.push('COST_BUDGET_EXCEEDED');
  if(breaches.length){event('provider_bound_breach',{call_id:r.callId,breaches});halt(STOP.RULE_BOUNDARY_VIOLATION,{call_id:r.callId,breaches});return {valid:false};}
  return {valid:true,result};
 }
 async function runCore(request) {
  if(stopped) return response();
  if(busy) return response('RUN_IN_PROGRESS'); // synchronous single-flight; never queue reentrant work
  busy=true;controller=new AbortController();
  try {
   let req;try {req=dataCopy(request);}catch{return halt(STOP.RULE_BOUNDARY_VIOLATION,{field:'request'});}
   if(!req || typeof req!=='object' || Array.isArray(req)) return halt(STOP.RULE_BOUNDARY_VIOLATION,{field:'request_record'});
   const gaps=researchGaps(c);
   if(req.definitionsClosed!==undefined) gaps.push('definitionsClosed:LEGACY_BOOLEAN_NOT_ACCEPTED');
   if(gaps.length) return halt(STOP.OWNER_DEFINITION_REQUIRED,{X_PACKET:{classification:'UNVERIFIED_CLOSURE',X_REASON_CODE:'EVIDENCE_GAP',X_STOP_POINT:'PUBLIC_RESEARCH_CONTRACT_VALIDATION',X_MISSING_FIELDS:gaps,S_RETURN:c.ownerRef},commercial_failure_proven:false});
   if(typeof req.prompt!=='string'||!req.prompt.trim()) return halt(STOP.RULE_BOUNDARY_VIOLATION,{field:'prompt'});
   const allowedRequestKeys=['prompt','tool','system','context'];
   if(Object.keys(req).some(k=>!allowedRequestKeys.includes(k))) return halt(STOP.RULE_BOUNDARY_VIOLATION,{field:'unsupported_request_field'});
   if(req.tool!==undefined&&req.tool!==null&&!c.allowedTools.includes(req.tool)) return halt(STOP.RULE_BOUNDARY_VIOLATION,{field:'tool'});
   if(req.system!==undefined&&typeof req.system!=='string') return halt(STOP.RULE_BOUNDARY_VIOLATION,{field:'system'});
   if(req.context!==undefined&&(!Array.isArray(req.context)||!req.context.every(x=>typeof x==='string'))) return halt(STOP.RULE_BOUNDARY_VIOLATION,{field:'context'});
   if(calls>=c.maxCalls) return halt(STOP.BUDGET_LIMIT_REACHED,{field:'maxCalls'});
   // Both counter and generator receive the very same frozen payload (including system/context/tool).
   const payload=freeze({model:c.model,modelVersion:c.modelVersion,prompt:req.prompt,system:req.system??'',context:req.context??[],tool:req.tool??null,maxOutputTokens:c.maxOutputPerCall});
   stage='COUNT';event('count_started',{payload_sha256:hash(payload)});
   const counter=Promise.resolve().then(()=>adapter.count({payload,signal:controller.signal})).then(value=>({value}),error=>({error:true,error_name:typeof error?.name==='string'?error.name:'Error'}));
   const counted=await timed(counter,c.timeouts.countMs,()=>halt(STOP.PROVIDER_TIMEOUT,{stage:'COUNT',generation_started:false}));
   if(stopped) return response(); // includes STOP during count and count timeout; no generate below
   if(counted.error) return halt(STOP.PROVIDER_ERROR,{stage:'COUNT',error_name:counted.error_name,generation_started:false});
   const n=counted.value;
   if(!Number.isSafeInteger(n)||n<0) return halt(STOP.PROVIDER_USAGE_MISSING,{stage:'COUNT'});
   const tokens=BigInt(n)+BigInt(c.maxOutputPerCall),cost=tokenCost(n,c.maxOutputPerCall,c);
   if(input+output+tokens>BigInt(c.maxTotalTokens)||commitCost+cost>limit) return halt(STOP.BUDGET_LIMIT_REACHED,{stage:'RESERVATION'});
   // Atomic in this isolate: no await between final STOP check, reservation and call count.
   if(stopped) return response();
   calls++;const r={callId:calls,inputCount:n,tokens,cost,status:'PENDING'};reservation=r;commitCost+=cost;pendingCalls++;stage='GENERATE';
   event('call_reserved',{call_id:r.callId,tokens:displayInt(tokens),cost_nanousd:cost.toString(),payload_sha256:hash(payload)});
   let timedOut=false;const cancelled=Symbol('CANCELLED_BEFORE_DISPATCH');
   const operation=Promise.resolve().then(()=>{
    // stop() can happen between dispatch scheduling and this microtask.
    if(stopped){pendingCalls--;calls--;commitCost-=r.cost;reservation=null;event('dispatch_cancelled',{call_id:r.callId});return cancelled;}
    event('provider_dispatched',{call_id:r.callId});
    return adapter.generate({payload,signal:controller.signal,callId:r.callId,contractHash});
   }).then(raw=>raw===cancelled?{valid:false}:reconcile(raw,r,timedOut),error=>{
    pendingCalls--;unknownUsageCalls++;r.status='UNRECONCILED';event('provider_error',{call_id:r.callId,late:timedOut,error_name:typeof error?.name==='string'?error.name:'Error',charges_may_exist:true});halt(STOP.PROVIDER_ERROR,{call_id:r.callId});return {valid:false};
   });
   const generated=await timed(operation,c.timeouts.generateMs,()=>{timedOut=true;halt(STOP.PROVIDER_TIMEOUT,{stage:'GENERATE',charges_may_exist:true});});
   if(stopped) return response();
   if(!generated.valid) return response();
   const result=generated.result;
   if(typeof result.text!=='string') return halt(STOP.RULE_BOUNDARY_VIOLATION,{field:'result.text'});
   if(result.finish_reason!=='complete') return {accepted:true,status:'CONTINUE_WITHIN_SCOPE',text:result.text,receipt:snapshot()};
   if(!completionVerifier) return halt(STOP.COMPLETION_UNVERIFIED,{provider_finish_is_not_quality:true});
   stage='VERIFY';const outputHash=hash(result.text);
   const verification=Promise.resolve().then(()=>completionVerifier(Object.freeze({text:result.text,output_sha256:outputHash,caseId:c.caseId,contractHash,completion:c.completion,researchContract:c.researchContract,signal:controller.signal}))).then(value=>({value}),()=>({error:true}));
   const v=await timed(verification,c.timeouts.verifyMs,()=>halt(STOP.EVALUATION_ERROR,{stage:'VERIFY_TIMEOUT'}));
   if(stopped) return response();
   if(v.error) return halt(STOP.EVALUATION_ERROR,{stage:'VERIFY'});
   let q;try {q=dataCopy(v.value);}catch{return halt(STOP.COMPLETION_UNVERIFIED,{field:'verification'});}
   if(!q || typeof q!=='object' || Array.isArray(q) || q.caseId!==c.caseId||q.rubricId!==c.completion.rubricId||q.rubricVersion!==c.completion.rubricVersion||q.evaluatorId!==c.completion.evaluatorId||q.output_sha256!==outputHash||!Array.isArray(q.evidenceRefs)||!q.evidenceRefs.length||!q.evidenceRefs.every(nonempty)||typeof q.passed!=='boolean'||!Number.isSafeInteger(q.unauthorizedRuleInsertions)||q.unauthorizedRuleInsertions<0) return halt(STOP.COMPLETION_UNVERIFIED,{field:'verification_binding'});
   event('completion_review',{output_sha256:outputHash,review:q,commercial_Y_status:'NOT_EVALUATED'});
   if(!q.passed||q.unauthorizedRuleInsertions!==0) return halt(STOP.QUALITY_NOT_MET);
   verified++;halt(STOP.TASK_COMPLETE,{evaluator_id:q.evaluatorId,commercial_Y_status:'NOT_EVALUATED'});
   return {accepted:true,status:STOP.TASK_COMPLETE,text:result.text,receipt:snapshot()};
  } finally {busy=false;stage=stopped?'STOPPED':'IDLE';}
 }
 async function run(request) {const result=await runCore(request);return {...result,receipt:snapshot()};}
 return Object.freeze({run,stop,snapshot});
}
