// Pure allowlisted arithmetic execution. No dynamic code, I/O tools, retries, or argument repair.
import {createHash,randomUUID} from 'node:crypto';
export const ROUTER_VERSION='safe-typed-js-prior-permit-router-v0.2';
const FUNCTIONS=Object.freeze({add:(left,right)=>left+right,subtract:(left,right)=>left-right});
const STATES=Object.freeze({READY:'READY',AUTHORIZED:'AUTHORIZED',EXECUTING:'EXECUTING',COMPLETE:'COMPLETE',STOP:'STOP',OWNER_RETURN:'OWNER_RETURN'});
const integer=n=>Number.isSafeInteger(n)&&n>=-1000&&n<=1000;
const clone=v=>structuredClone(v);
const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
function record(value) {
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const proto=Object.getPrototypeOf(value);if(proto!==Object.prototype&&proto!==null)return null;
 const descriptors=Object.getOwnPropertyDescriptors(value),out=Object.create(null);
 for(const key of Reflect.ownKeys(descriptors)){
  if(typeof key!=='string'||!('value' in descriptors[key]))return null;
  out[key]=descriptors[key].value;
 }
 return out;
}
const exactKeys=(v,keys)=>Object.keys(v).sort().join('|')===[...keys].sort().join('|');
function copyTask(value) {
 const t=record(value);if(!t||!exactKeys(t,['id','request','authorizedFunction','arguments','policy']))throw new TypeError('VERIFIED_TASK_SCHEMA');
 if(typeof t.id!=='string'||!t.id.trim()||typeof t.request!=='string'||!t.request.trim())throw new TypeError('VERIFIED_TASK_ID_REQUEST');
 if(!(t.authorizedFunction===null||typeof t.authorizedFunction==='string')||!['ALLOWED','MISSING_DEFINITION','FORBIDDEN'].includes(t.policy))throw new TypeError('VERIFIED_TASK_POLICY');
 const a=record(t.arguments);if(!a||Object.keys(a).some(k=>!['left','right'].includes(k)))throw new TypeError('VERIFIED_ARGUMENT_SCHEMA');
 const args={};for(const key of ['left','right'])if(Object.hasOwn(a,key)){
  if(!(a[key]===null||typeof a[key]==='number'||typeof a[key]==='string'||typeof a[key]==='boolean'))throw new TypeError('VERIFIED_ARGUMENT_DATA_ONLY');
  args[key]=a[key];
 }
 return Object.freeze({id:t.id,request:t.request,authorizedFunction:t.authorizedFunction,arguments:Object.freeze(args),policy:t.policy});
}
function hasDuplicateKeys(text) {
 const tokens=text.match(/"(?:\\.|[^"\\])*"|[{}\[\]:,]/g)??[],stack=[];
 for(let i=0;i<tokens.length;i++){
  const token=tokens[i];
  if(token==='{')stack.push(new Set());else if(token==='[')stack.push(null);
  else if(token==='}'||token===']')stack.pop();
  else if(token.startsWith('"')&&tokens[i+1]===':'){
   const keys=stack.at(-1),key=JSON.parse(token);if(keys.has(key))return true;keys.add(key);
  }
 }
 return false;
}
export function createRouter(verifiedTask,{onExecute,authorityContext}={}) {
 const task=copyTask(verifiedTask);if(onExecute!==undefined&&typeof onExecute!=='function')throw new TypeError('OBSERVER_MUST_BE_FUNCTION');
 const permitInstanceId=randomUUID(),taskHash=hash(task),authority=Object.freeze({...authorityContext??{ownerRef:'CALLER_VERIFIED_TASK_NOT_EXTERNAL_AUTHORITY',scopeRef:'FIXED_PURE_ADD_SUBTRACT',ruleSpecVersion:ROUTER_VERSION,subjectContractRef:taskHash}});
 if(!['ownerRef','scopeRef','ruleSpecVersion','subjectContractRef'].every(k=>typeof authority[k]==='string'&&authority[k].trim()))throw new TypeError('AUTHORITY_CONTEXT_REQUIRED');
 let pendingPermit=null,permitRecord=null;const authorizationEvents=[];
 let state=STATES.READY,terminalReason=null,attempts=0,executionCount=0,lastDecision=null,executionReceipt=null,observerError=null;
 const snapshot=()=>clone({version:ROUTER_VERSION,task_id:task.id,task_sha256:taskHash,state,terminal_reason:terminalReason,proposal_attempts:attempts,execution_count:executionCount,execution_receipt:executionReceipt,prior_permit:permitRecord,authorization_events:authorizationEvents,last_decision:lastDecision,observer_error:observerError,model_arithmetic_used:false});
 function response({accepted=false,executed=false,result=null,reason=terminalReason,...extra}={}) {return {accepted,executed,state,reason,result,...extra,receipt:snapshot()};}
 function end(next,reason,detail={}) {state=next;terminalReason=reason;lastDecision={state:next,reason,...clone(detail)};return response({...detail});}
 function terminalResponse(){return response({reason:'TERMINAL_NO_RECALL',original_terminal_reason:terminalReason});}
 function preflight(){
  if(state!==STATES.READY)return terminalResponse();
  if(task.policy==='FORBIDDEN')return end(STATES.STOP,'POLICY_FORBIDDEN');
  const missing=['left','right'].filter(k=>!Object.hasOwn(task.arguments,k)||task.arguments[k]===null);
  if(task.authorizedFunction===null)missing.unshift('authorizedFunction');
  if(task.policy==='MISSING_DEFINITION'||missing.length)return end(STATES.OWNER_RETURN,'OWNER_DEFINITION_REQUIRED',{owner_return_required:true,missing_fields:missing.length?missing:['verified_task_definition'],definition_autofilled:false});
  if(!Object.hasOwn(FUNCTIONS,task.authorizedFunction))return end(STATES.STOP,'VERIFIED_FUNCTION_NOT_ALLOWED');
  if(![task.arguments.left,task.arguments.right].every(integer))return end(STATES.STOP,'VERIFIED_ARGUMENT_INVALID');
  return response({accepted:true,reason:'READY_FOR_MODEL_PROPOSAL'});
 }
 function authorizeProposal(input){
  attempts++;
  if(state!==STATES.READY)return terminalResponse();
  const admissible=preflight();if(!admissible.accepted)return admissible;
  let value=input;
  if(typeof input==='string'){
   if(input.length>8192)return end(STATES.STOP,'PROPOSAL_TOO_LARGE');
   try{value=JSON.parse(input);if(hasDuplicateKeys(input))return end(STATES.STOP,'DUPLICATE_JSON_KEYS');}catch{return end(STATES.STOP,'INVALID_JSON');}
  }
  const proposal=record(value);
  if(!proposal||!exactKeys(proposal,['function','arguments']))return end(STATES.STOP,'PROPOSAL_SCHEMA_INVALID');
  const args=record(proposal.arguments);
  if(typeof proposal.function!=='string'||!args||!exactKeys(args,['left','right']))return end(STATES.STOP,'PROPOSAL_SCHEMA_INVALID');
  if(![args.left,args.right].every(v=>v===null||integer(v)))return end(STATES.STOP,'PROPOSAL_ARGUMENT_TYPE_OR_RANGE');
  if(proposal.function==='owner_return'){
   if(['left','right'].some(k=>args[k]!==null&&args[k]!==task.arguments[k]))return end(STATES.STOP,'ARGUMENT_AUTHORITY_MISMATCH');
   return end(STATES.OWNER_RETURN,'MODEL_UNCERTAIN',{owner_return_required:true,missing_fields:[],definition_autofilled:false});
  }
  if(!Object.hasOwn(FUNCTIONS,proposal.function))return end(STATES.STOP,'FUNCTION_NOT_ALLOWED');
  if(proposal.function!==task.authorizedFunction)return end(STATES.STOP,'FUNCTION_AUTHORITY_MISMATCH');
  if(args.left===null||args.right===null)return end(STATES.OWNER_RETURN,'PROPOSAL_ARGUMENT_MISSING',{owner_return_required:true,missing_fields:['left','right'].filter(k=>args[k]===null),definition_autofilled:false});
  if(args.left!==task.arguments.left||args.right!==task.arguments.right)return end(STATES.STOP,'ARGUMENT_AUTHORITY_MISMATCH');
  pendingPermit=Object.freeze({permit_id:task.id+':permit:'+attempts,permit_instance_id:permitInstanceId,task_sha256:taskHash,model_proposal_sha256:hash(typeof input==='string'?input:JSON.stringify(input)),function:proposal.function,arguments:Object.freeze({left:args.left,right:args.right}),registry_version:ROUTER_VERSION,authority,scope:'FIXED_ALLOWLISTED_PURE_JS_ONLY',max_executions:1});
  permitRecord={permit:clone(pendingPermit),issued_before_execution:true,execution_count_at_issue:executionCount,consumed:false};
  authorizationEvents.push({sequence:authorizationEvents.length+1,event:'PERMIT_ISSUED',permit_id:pendingPermit.permit_id,execution_count:executionCount});state=STATES.AUTHORIZED;
  return response({accepted:true,executed:false,reason:'PRIOR_PERMIT_GRANTED',permit:clone(pendingPermit)});
 }
 function executePermitted(input){
  if([STATES.COMPLETE,STATES.STOP,STATES.OWNER_RETURN,STATES.EXECUTING].includes(state))return terminalResponse();
  if(state!==STATES.AUTHORIZED||!pendingPermit)return end(STATES.STOP,'PRIOR_PERMIT_REQUIRED');
  const p=record(input),a=p&&record(p.arguments),auth=p&&record(p.authority);
  const valid=p&&a&&auth&&exactKeys(p,Object.keys(pendingPermit))&&exactKeys(a,['left','right'])&&exactKeys(auth,Object.keys(authority))&&Object.keys(pendingPermit).filter(k=>!['arguments','authority'].includes(k)).every(k=>p[k]===pendingPermit[k])&&a.left===pendingPermit.arguments.left&&a.right===pendingPermit.arguments.right&&Object.keys(authority).every(k=>auth[k]===authority[k]);
  if(!valid)return end(STATES.STOP,'PRIOR_PERMIT_BINDING_MISMATCH');
  const permit=pendingPermit;pendingPermit=null;permitRecord.consumed=true;
  authorizationEvents.push({sequence:authorizationEvents.length+1,event:'PERMIT_CONSUMED',permit_id:permit.permit_id,execution_count:executionCount});
  state=STATES.EXECUTING;executionCount++;
  const result=FUNCTIONS[permit.function](permit.arguments.left,permit.arguments.right);
  authorizationEvents.push({sequence:authorizationEvents.length+1,event:'JS_EXECUTED',permit_id:permit.permit_id,execution_count:executionCount});
  if(!Number.isSafeInteger(result)){state=STATES.STOP;terminalReason='EXECUTION_RESULT_INVALID';return response();}
  executionReceipt=Object.freeze({execution_id:task.id+':execution:'+executionCount,prior_permit_id:permit.permit_id,prior_permit_sha256:hash(permit),model_proposal_sha256:permit.model_proposal_sha256,invocation_index:executionCount,function:permit.function,arguments:permit.arguments,result,output_sha256:hash(JSON.stringify(result)),task_sha256:taskHash,implementation_version:ROUTER_VERSION,execution_source:'HOST_ALLOWLISTED_JAVASCRIPT',model_proposal_validated:true,arguments_repaired:false});
  state=STATES.COMPLETE;terminalReason='DETERMINISTIC_EXECUTION_COMPLETE';lastDecision={state,reason:terminalReason};
  if(onExecute){try{onExecute(clone(executionReceipt));}catch(error){observerError={name:typeof error?.name==='string'?error.name:'Error'};}}
  return response({accepted:true,executed:true,result});
 }
 function evaluateProposal(input){const decision=authorizeProposal(input);return decision.accepted&&decision.permit?executePermitted(decision.permit):decision;}
 function stop(reason='HOST_STOP'){if(![STATES.READY,STATES.AUTHORIZED].includes(state))return terminalResponse();return end(STATES.STOP,typeof reason==='string'?reason:'HOST_STOP');}
 return Object.freeze({preflight,authorizeProposal,executePermitted,evaluateProposal,snapshot,stop});
}
