import {createRouter} from './router.mjs';
const ESCALATABLE=new Set(['FUNCTION_AUTHORITY_MISMATCH','ARGUMENT_AUTHORITY_MISMATCH','INVALID_JSON','DUPLICATE_JSON_KEYS','PROPOSAL_SCHEMA_INVALID','PROPOSAL_ARGUMENT_TYPE_OR_RANGE','MODEL_UNCERTAIN','PROPOSAL_ARGUMENT_MISSING']);
export function orderCandidates(candidates,pricing,usageBudget){
 const estimates=candidates.map(c=>({modelId:c.modelId,estimate:pricing.estimate({modelId:c.modelId,usageBudget,estimateEvidence:'COMMON_PROTOCOL_RESERVATION_NOT_ACTUAL_USAGE'})}));
 const first=estimates[0]?.estimate,all=first&&estimates.every(x=>(x.estimate.status==='ESTIMATED'||(x.estimate.status==='PRICE_DEFINED_REFERENCE'&&x.estimate.basis_status==='ESTIMATED'))&&x.estimate.verification==='VERIFIED'&&x.estimate.currency===first.currency&&x.estimate.scope===first.scope&&x.estimate.exact_minor_units.denominator===first.exact_minor_units.denominator);
 const order=all?[...candidates].sort((a,b)=>{const x=BigInt(estimates.find(e=>e.modelId===a.modelId).estimate.exact_minor_units.numerator),y=BigInt(estimates.find(e=>e.modelId===b.modelId).estimate.exact_minor_units.numerator);return x<y?-1:x>y?1:0;}):[...candidates];
 return {candidates:order,selection_basis:all?'VERIFIED_PUBLISHED_RATECARD_RESERVATION_ESTIMATE':'DECLARED_RESOURCE_PRIORITY_NOT_MONETARY_CHEAPEST',estimates};
}
export function createSelector({task,candidates,execute,pricing,usageBudget,ownerRef}){
 const fixedTask=structuredClone(task),ordered=orderCandidates(candidates.map(x=>Object.freeze({...x})),pricing,usageBudget);let busy=false,terminal=null;
 async function run(){
  if(terminal)return {status:'TERMINAL_NO_RECALL',new_model_calls:0,new_js_executions:0,original:structuredClone(terminal)};
  if(busy)return {status:'RUN_IN_PROGRESS',new_model_calls:0,new_js_executions:0};busy=true;
  try{
   const pre=createRouter(fixedTask).preflight(),attempts=[];
   if(!pre.accepted){terminal={status:pre.state,task_id:fixedTask.id,reason:pre.reason,task_complete:false,attempts,model_calls:0,js_executions:0,owner_return:pre.state==='OWNER_RETURN'?{recipient:ownerRef,missing_fields:pre.missing_fields,definition_autofilled:false}:null,selection_basis:ordered.selection_basis,price_status:'NO_GENERATION_NO_CHARGE_WITHIN_MODEL_TOKEN_SCOPE',actual_local_compute_cost:'NOT_MEASURED'};return structuredClone(terminal);}
   for(const candidate of ordered.candidates){
    const row=await execute(candidate,fixedTask);
    const quote=pricing.quote({modelId:candidate.modelId,usage:row.provider_usage?{input_tokens:row.provider_usage.input_tokens,output_tokens:row.provider_usage.output_tokens,cached_input_tokens:row.provider_usage.cached_tokens??0}:null,usageEvidence:'provider-reported:'+fixedTask.id+':'+candidate.modelId});
    attempts.push({modelId:candidate.modelId,row,quote});
    if(row.task_complete){terminal={status:'COMPLETE',task_id:fixedTask.id,task_complete:true,selected_model:candidate.modelId,result:row.actual_js_result,quality:{passed:true,criterionId:'TYPED_JS_EXECUTION.v1'},attempts,model_calls:attempts.filter(x=>x.row.model_called).length,js_executions:attempts.reduce((n,x)=>n+x.row.actual_js_executions,0),sufficient_model_stopped_escalation:true,uninvoked_models:ordered.candidates.slice(attempts.length).map(x=>x.modelId),selection_basis:ordered.selection_basis,selection_estimates:ordered.estimates,price_status:attempts.every(x=>(x.quote.status==='QUOTED'||(x.quote.status==='PRICE_DEFINED_REFERENCE'&&x.quote.basis_status==='QUOTED')))?'PRICED_WITHIN_DECLARED_REFERENCE_SCOPE':'PRICE_UNDEFINED',actual_local_compute_cost:'NOT_MEASURED',reference_valuation_status:attempts.every(x=>x.quote.status==='PRICE_DEFINED_REFERENCE')?'PRICE_DEFINED_REFERENCE':'PRICE_UNDEFINED',local_settlement_status:'PRICE_UNDEFINED',local_settlement_owner_return:{recipient:ownerRef,missing_fields:['local_actual_bill_or_authorized_user_charge_basis'],definition_autofilled:false,does_not_block_verified_task_execution:true},settlement_owner_return:attempts.some(x=>x.quote.status==='PRICE_UNDEFINED')?{recipient:ownerRef,missing_fields:['verified_price_basis'],definition_autofilled:false}:null};return structuredClone(terminal);}
    if(!ESCALATABLE.has(row.reason)){terminal={status:row.outcome??'STOP',task_id:fixedTask.id,task_complete:false,reason:row.reason,attempts,model_calls:attempts.filter(x=>x.row.model_called).length,js_executions:0,escalation_blocked:'NOT_EXPLICIT_MODEL_UNDERSTANDING_OR_QUALITY_FAILURE'};return structuredClone(terminal);}
   }
   terminal={status:'OWNER_RETURN',task_id:fixedTask.id,task_complete:false,reason:'ALL_AUTHORIZED_MODELS_INSUFFICIENT',attempts,model_calls:attempts.length,js_executions:0,owner_return:{recipient:ownerRef,missing_fields:['sufficient_verified_delivery'],definition_autofilled:false}};return structuredClone(terminal);
  }catch(e){terminal={status:'STOP',task_id:fixedTask.id,task_complete:false,reason:'INFRASTRUCTURE_OR_BUDGET_FAILURE',error:e?.message??String(e),no_further_escalation:true};throw e;}finally{busy=false;}
 }
 return Object.freeze({run,snapshot:()=>structuredClone(terminal)});
}
