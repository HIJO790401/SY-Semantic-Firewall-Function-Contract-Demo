import {readFile} from 'node:fs/promises';
import {createRouter} from '../src/router.mjs';
const args=process.argv.slice(2);if(args.length&&!(args.length===2&&args[0]==='--case'))throw Error('Use --case T01..T12');
const tasks=JSON.parse(await readFile(new URL('../acceptance.tasks.json',import.meta.url))),task=tasks.find(t=>t.id===(args[1]??'T01'));if(!task)throw Error('UNKNOWN_FIXED_TASK');
const router=createRouter(task,{authorityContext:{ownerRef:'PUBLIC_DEMO_OPERATOR',scopeRef:'FIXED_RESEARCH_DEMO',ruleSpecVersion:'public-v0.2.1',subjectContractRef:'PUBLIC_FIXED_TASK_V1'}}),preflight=router.preflight();
let result=preflight;
if(preflight.accepted){const proposal=JSON.stringify({function:task.authorizedFunction,arguments:task.arguments});const permission=router.authorizeProposal(proposal);result=permission.accepted?router.executePermitted(permission.permit):permission;}
const before=router.snapshot().execution_count,replay=router.evaluateProposal(null),after=router.snapshot().execution_count;
if(before!==after)throw Error('TERMINAL_REPLAY_BREACH');
console.log(JSON.stringify({mode:'DETERMINISTIC_JS_DEMO_NOT_MODEL_INFERENCE',model_calls:0,model_tokens:null,model_price:'NOT_APPLICABLE_NO_MODEL_CALL',task_id:task.id,result,terminal_replay:{new_executions:after-before,reason:replay.reason},scope:'Validates host execution only, not model understanding or model selection performance'},null,2));
