import {MODEL_PINS} from '../src/runtime-config.mjs';import {verifyRuntime} from '../src/verify-runtime.mjs';
import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {parseCommandOptions} from '../src/command-options.mjs';import {createOllamaAdapter} from '../src/ollama-adapter.mjs';import {runOneCommand} from '../src/run-one-command.mjs';import {createSelector} from '../src/selector.mjs';import {createPricing} from '../src/pricing.mjs';
const root=new URL('../',import.meta.url),load=async n=>JSON.parse(await readFile(new URL(n,root),'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
const options=parseCommandOptions(process.argv.slice(2)),protocol=await load('protocol.candidate.json');
if(process.env.SY_ALLOW_ONE_COMMAND!==protocol.study_id)throw Error('EXPLICIT_ONE_COMMAND_ACTIVATION_REQUIRED');
await verifyRuntime(root);
const study=await load('evidence/reference-parity.json');
const pins=MODEL_PINS,task=(await load('acceptance.tasks.json')).find(t=>t.id===options.caseId),pricing=createPricing(await load('ratecard.json')),ledger={modelCalls:0,tokens:0},adapters=[],abort=new AbortController(),timer=setTimeout(()=>abort.abort('ONE_COMMAND_DEADLINE'),110000);let receipt;
const serverPid=Number(process.env.OLLAMA_SERVER_PID);if(!Number.isSafeInteger(serverPid)||serverPid<1)throw Error('OWNED_SERVER_REQUIRED');
const commandCallCap=Number(process.env.SY_ONE_COMMAND_MAX_CALLS??2);if(![1,2].includes(commandCallCap))throw Error('ONE_COMMAND_CALL_CAP_REQUIRED');
const bounded={...protocol,max_total_new_generation_calls:commandCallCap,aggregate_input_output_token_reservation:4096},candidates=pins.filter(p=>options.model==='auto'||p.model===options.model).map(p=>({modelId:p.model}));
async function execute(candidate,t){const pin=pins.find(p=>p.model===candidate.modelId),adapter=createOllamaAdapter({pin,structuredOutput:options.interfaceMode==='JSON_FUNCTION',serverPid,calibrationEvidence:study.parity[pin.model],generationAuthorization:{scope:'ROOT_APPROVED_BOUNDED_LOCAL_RUN',approvalRef:'Explicit operator SY_ALLOW_ONE_COMMAND activation; frozen Owner scope',runId:protocol.study_id+':one-command',maxCalls:commandCallCap,maxOutputTokens:64},requestTimeoutMs:60000});adapters.push(adapter);return runOneCommand({interfaceMode:options.interfaceMode,task:t,phase:'one-command',adapter,protocol:bounded,ledger,signal:abort.signal});}
try{
 if(options.interfaceMode==='JSON_FUNCTION'){const selector=createSelector({task,candidates,pricing,usageBudget:{input_tokens:1984,output_tokens:64},ownerRef:protocol.owner_approval_ref,execute});receipt=await selector.run();receipt.terminal_replay=await selector.run();}
 else {const row=await execute(candidates[0],task);receipt={...row,price:pricing.quote({modelId:candidates[0].modelId,usage:{input_tokens:row.provider_usage.input_tokens,output_tokens:row.provider_usage.output_tokens,cached_input_tokens:row.provider_usage.cached_tokens??0},usageEvidence:'one-command-provider-report'}),local_settlement_status:'PRICE_UNDEFINED',actual_local_cost:'NOT_MEASURED'};}
 console.log(JSON.stringify({command:options,receipt,ledger,adapter_traces:adapters.map(a=>a.snapshot()),reference_cache_scenario:'NO_CACHE_DISCOUNT',edition:'SY-PUBLIC-REFERENCE.v0.2.1',newly_requested_execution:true,not_a_replay_of_saved_success:true,historical_study_unchanged:true},null,2));
}catch(e){console.log(JSON.stringify({status:'STOP',reason:e?.message??String(e),ledger,adapter_traces:adapters.map(a=>a.snapshot())},null,2));process.exitCode=1;}finally{clearTimeout(timer);}
