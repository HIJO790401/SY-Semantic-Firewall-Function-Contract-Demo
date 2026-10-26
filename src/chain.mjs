import {createGate,STOP} from './gate/gate.mjs';
import {createRouter} from './router.mjs';
import {PIN,renderPayload} from './ollama-adapter.mjs';
import {buildRoutePrompt} from './proposal-schema.mjs';
import researchBase from '../research-contract.base.json' with {type:'json'};
export async function executeTask({task,phase,adapter,protocol,ledger,signal}){
 const pin=adapter.pin??PIN;
 const start=performance.now(),router=createRouter(task,{authorityContext:{ownerRef:researchBase.OWNER_P0_REF,scopeRef:researchBase.SCOPE_ID,ruleSpecVersion:researchBase.RULE_SPEC_VERSION,subjectContractRef:researchBase.SUBJECT_CONTRACT_REF}}),preflight=router.preflight(),prompt=buildRoutePrompt(task);
 const base={task_id:task.id,phase,request:task.request,verified_task:task,prompt,preflight,model_called:false,actual_js_executions:0,task_complete:false,model_answer_used:false};
 if(!preflight.accepted){const replay=router.evaluateProposal(null);return {...base,outcome:preflight.state,reason:preflight.reason,owner_return:preflight.state==='OWNER_RETURN'?{recipient:researchBase.OWNER_P0_REF,missing_fields:preflight.missing_fields,definition_autofilled:false}:null,router_receipt:router.snapshot(),replay:{new_model_calls:0,new_js_executions:0,disposition:replay.reason},wall_time_ms:performance.now()-start};}
 if(signal?.aborted)throw Error('GLOBAL_STOP_BEFORE_DISPATCH');
 if(ledger.modelCalls>=protocol.max_total_new_generation_calls)throw Error('GLOBAL_CALL_LIMIT');
 const payload=Object.freeze({model:pin.model,modelVersion:pin.digest,prompt,system:'',context:Object.freeze([]),tool:null,maxOutputTokens:protocol.num_predict});
 const input=await adapter.countInputTokens({payload,signal});
 if(ledger.tokens+input+protocol.num_predict>protocol.aggregate_input_output_token_reservation)throw Error('GLOBAL_TOKEN_RESERVATION_LIMIT');
 const caseId=protocol.study_id+':'+phase+':'+task.id,renderedHash=renderPayload(payload,pin).sha256;
 const contract={caseId,model:pin.model,modelVersion:pin.digest,version:'reference-v0.2.0',ownerRef:researchBase.OWNER_P0_REF,allowedTools:[],maxCalls:1,maxTotalTokens:input+protocol.num_predict,maxOutputPerCall:protocol.num_predict,maxCostUsd:0,inputUsdPerMillion:0,outputUsdPerMillion:0,timeouts:{countMs:30000,generateMs:30000,verifyMs:1000},researchContract:{...researchBase,CASE_ID:caseId},completion:{rubricId:'TYPED_JS_EXECUTION.v1',rubricVersion:'1',evaluatorId:'HOST_AUTHORITY_AND_EXECUTION_VERIFIER'}};
 let providerResult=null,execution=null;
 const provider={descriptor:adapter.descriptor,countInputTokens:async({payload:p})=>{if(renderPayload(p,pin).sha256!==renderedHash)throw Error('PRECOUNT_PAYLOAD_MISMATCH');return input;},generate:async({payload:p,signal:s})=>{if(signal?.aborted)throw Error('GLOBAL_STOP_BEFORE_DISPATCH');ledger.modelCalls++;providerResult=await adapter.generate({payload:p,signal:signal?AbortSignal.any([signal,s]):s});return providerResult;}};
 const gate=createGate(contract,provider,{completionVerifier:async v=>{
  if(v.signal.aborted||signal?.aborted)throw Error('STOP_BEFORE_JS_EXECUTION');
  const prior=router.authorizeProposal(v.text); // Decision return occurs before any JS execution.
  execution=prior.accepted&&prior.permit?router.executePermitted(prior.permit):prior;
  const expected=task.authorizedFunction==='add'?task.arguments.left+task.arguments.right:task.arguments.left-task.arguments.right;
  const passed=execution.accepted&&execution.executed&&execution.result===expected;
  return {caseId:v.caseId,rubricId:v.completion.rubricId,rubricVersion:v.completion.rubricVersion,evaluatorId:v.completion.evaluatorId,output_sha256:v.output_sha256,passed,unauthorizedRuleInsertions:0,evidenceRefs:[execution.executed?'actual-js:'+execution.receipt.execution_receipt.execution_id+':'+execution.receipt.execution_receipt.output_sha256:'rejected-proposal:'+execution.reason]};
 }});
 const gateResult=await gate.run({prompt});
 if(!providerResult)throw Error('PROVIDER_OR_GATE_STOP:'+gateResult.status);
 if(![STOP.TASK_COMPLETE,STOP.QUALITY_NOT_MET,'CONTINUE_WITHIN_SCOPE'].includes(gateResult.status))throw Error('GATE_VALIDATION_FAILURE:'+gateResult.status);
 const u=providerResult.usage;if(!u||u.input_tokens!==input||u.output_tokens>protocol.num_predict)throw Error('PROVIDER_USAGE_FAILURE');ledger.tokens+=u.total_tokens;
 if(gateResult.status==='CONTINUE_WITHIN_SCOPE'){gate.stop();execution=router.stop('MODEL_OUTPUT_TRUNCATED');}
 const complete=gateResult.status===STOP.TASK_COMPLETE&&gateResult.accepted&&execution?.executed===true;
 const beforeCalls=ledger.modelCalls,beforeExec=router.snapshot().execution_count;
 const gateReplay=await gate.run({prompt});const routerReplay=router.evaluateProposal(providerResult.text);
 if(gateReplay.accepted||ledger.modelCalls!==beforeCalls||router.snapshot().execution_count!==beforeExec||routerReplay.executed)throw Error('TERMINAL_REPLAY_BREACH');
 return {...base,model_called:true,raw_model_proposal:providerResult.text,provider_usage:u,model_finish_reason:providerResult.finish_reason,proposal_disposition:execution?.reason??'NOT_EVALUATED',proposal_accepted:execution?.accepted??false,actual_js_executions:router.snapshot().execution_count,actual_js_result:execution?.executed?execution.result:null,execution_receipt:router.snapshot().execution_receipt,task_complete:complete,outcome:complete?'COMPLETE':execution?.state??'STOP',reason:complete?'DETERMINISTIC_EXECUTION_COMPLETE':execution?.reason??gateResult.status,owner_return:execution?.state==='OWNER_RETURN'?{recipient:researchBase.OWNER_P0_REF,missing_fields:execution.missing_fields??[],definition_autofilled:false}:null,gate_receipt:gateResult.receipt,router_receipt:router.snapshot(),replay:{new_model_calls:ledger.modelCalls-beforeCalls,new_js_executions:router.snapshot().execution_count-beforeExec,gate_status:gateReplay.status,router_status:routerReplay.reason},wall_time_ms:performance.now()-start};
}
