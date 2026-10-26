// Separate candidate. Never modifies or silently activates frozen v0.2.
import {createHash,randomUUID} from 'node:crypto';
import {PROPOSAL_SCHEMA} from './proposal-schema.mjs';
import {readFile,readlink,stat,readdir} from 'node:fs/promises';
const sha = value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const clone=value=>structuredClone(value);
const natural=(n)=>Number.isSafeInteger(n)&&n>=0;
const fail=code=>{throw Object.assign(new Error(code),{code});};
import {MODEL_PINS} from './runtime-config.mjs';
export const PIN=MODEL_PINS[0];
const controlToken=/<\|(?:im_start|im_end|endoftext)\|>|<\/?think>/;
export function renderPayload(payload,pin=PIN) {
 if(!payload||typeof payload!=='object'||payload.model!==pin.model||payload.modelVersion!==pin.digest)fail('PAYLOAD_MODEL_PIN_MISMATCH');
 if(typeof payload.prompt!=='string'||!payload.prompt.trim()||typeof payload.system!=='string'||!Array.isArray(payload.context)||!payload.context.every(s=>typeof s==='string')||payload.tool!==null)fail('PAYLOAD_UNSUPPORTED');
 if(!natural(payload.maxOutputTokens)||payload.maxOutputTokens<1||payload.maxOutputTokens>512)fail('OUTPUT_LIMIT_REQUIRED_1_TO_512');
 const fields=[payload.system,...payload.context,payload.prompt];if(fields.some(s=>controlToken.test(s)))fail('RESERVED_TEMPLATE_TOKEN_IN_INPUT');
 const user=[...payload.context,payload.prompt].join('\n\n');
 const text=(payload.system?`<|im_start|>system\n${payload.system}<|im_end|>\n`:'')+`<|im_start|>user\n${user} /no_think<|im_end|>\n<|im_start|>assistant\n<think>\n\n</think>\n\n`;
 return Object.freeze({text,sha256:sha(text),renderVersion:pin.renderVersion,payloadHash:sha(payload)});
}
// Only read command lines of owned local descendants matching the exact approved runner/blob.
export async function discoverRunner({serverPid,expected=PIN}={}) {
 if(!natural(serverPid)||serverPid<1)fail('OWNED_SERVER_PID_REQUIRED');
 const serverExe=await readlink(`/proc/${serverPid}/exe`),ns=await readlink(`/proc/${serverPid}/ns/pid`);
 if(serverExe!==expected.server||(await stat(`/proc/${serverPid}`)).uid!==process.getuid()||ns!==await readlink('/proc/self/ns/pid'))fail('SERVER_OWNERSHIP_MISMATCH');
 // This sandbox may omit /proc/PID/task/PID/children. Read only stat parent
 // identifiers globally; do not inspect unrelated process arguments or environment.
 const parents=new Map();
 for(const name of (await readdir('/proc')).filter(x=>/^\d+$/.test(x))){try{const text=await readFile(`/proc/${name}/stat`,'utf8');parents.set(Number(name),Number(text.slice(text.lastIndexOf(')')+2).split(' ')[1]));}catch{}}
 const matches=[];
 for(const pid of parents.keys()){
  let ancestor=parents.get(pid),owned=false;const seen=new Set();
  while(ancestor>0&&!seen.has(ancestor)){if(ancestor===serverPid){owned=true;break;}seen.add(ancestor);ancestor=parents.get(ancestor);}
  if(!owned)continue;
  try {
   if((await stat(`/proc/${pid}`)).uid!==process.getuid()||await readlink(`/proc/${pid}/ns/pid`)!==ns)continue;
   if(await readlink(`/proc/${pid}/exe`)!==expected.runner)continue;
   const argv=(await readFile(`/proc/${pid}/cmdline`,'utf8')).split('\0').filter(Boolean);
   if(argv[argv.indexOf('--model')+1]!==expected.blob||argv[argv.indexOf('--host')+1]!=='127.0.0.1')continue;
   const port=Number(argv[argv.indexOf('--port')+1]);if(!natural(port)||port<1||port>65535)continue;
   const rawStat=await readFile(`/proc/${pid}/stat`,'utf8');const startTime=rawStat.slice(rawStat.lastIndexOf(')')+2).split(' ')[19];
   matches.push({pid,port,serverPid,startTime,namespace:ns,modelPath:expected.blob,runnerPath:expected.runner});
  }catch{/* owned child may disappear; fail closed below */}
 }
 if(matches.length!==1)fail('OWNED_RUNNER_NOT_UNIQUE');return Object.freeze(matches[0]);
}
export function createOllamaAdapter({pin=PIN,structuredOutput=true,calibrationMode=false,calibrationPayloadHashes=[],serverPid,fetchImpl=fetch,discover=discoverRunner,generationAuthorization=null,calibrationEvidence=null,sessionId=randomUUID(),requestTimeoutMs=20000}={}) {
 pin=Object.freeze({...pin});
 const events=[];let runner=null,prepared=false,preparePending=null,generationCalls=0,tokenizeCalls=0,httpRequests=0,modelLoads=0,generationBusy=false;
 const preparedPayloads=new Map();
 async function runnerResources(){const raw=await readFile(`/proc/${runner.pid}/stat`,'utf8'),f=raw.slice(raw.lastIndexOf(')')+2).split(' ');return {runner_pid:runner.pid,user_cpu_ticks:Number(f[11]),system_cpu_ticks:Number(f[12]),rss_pages:Number(f[21]),clock_ticks_per_second:Number(process.env.SY_CLOCK_TICKS)||null,page_size_bytes:Number(process.env.SY_PAGE_SIZE)||null};}
 const record=(kind,detail={})=>events.push({sequence:events.length+1,utc:new Date().toISOString(),kind,...clone(detail)});
 const descriptor=Object.freeze({id:'OLLAMA_TYPED_JS_SELECTOR_V02:'+pin.model,structured_output_schema_sha256:structuredOutput?sha(PROPOSAL_SCHEMA):null,kind:'local',model:pin.model,modelVersion:pin.digest,counting:'EXACT_PAYLOAD_UPPER_BOUND',outputLimit:'ENFORCED',priceScope:'INPUT_OUTPUT_ONLY',counterMayBill:false,cancellation:'BEST_EFFORT'});
 async function request(base,path,body,signal,kind) {
  const url=new URL(path,base);if(url.protocol!=='http:'||url.hostname!=='127.0.0.1'||url.username||url.password||!/^\d+$/.test(url.port))fail('LOOPBACK_ONLY');
  const started=performance.now(),requestId=`${sessionId}:${++httpRequests}`;const timed=AbortSignal.timeout(requestTimeoutMs);const combined=signal?AbortSignal.any([signal,timed]):timed;
  record('http_started',{requestId,operation:kind,url:url.href,request:body??null});
  try {
   const response=await fetchImpl(url,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json'},redirect:'error',signal:combined,...(body===undefined?{}:{body:JSON.stringify(body)})});
   if(!response.ok)fail('LOCAL_HTTP_ERROR_'+response.status);
   const data=await response.json();record('http_finished',{requestId,operation:kind,wall_time_ms:performance.now()-started,response:data});return {data,requestId};
  } catch(error){record('http_failed',{requestId,operation:kind,wall_time_ms:performance.now()-started,error_name:error?.name??'Error',generation_usage:kind==='generation'?'UNKNOWN':'NOT_A_GENERATION_REQUEST'});throw error;}
 }
 async function verifyIdentity(signal) {
  const {data:v}=await request('http://127.0.0.1:11434','/api/version',undefined,signal,'metadata');if(v.version!==pin.ollamaVersion)fail('OLLAMA_VERSION_MISMATCH');
  const {data:t}=await request('http://127.0.0.1:11434','/api/tags',undefined,signal,'metadata');const m=t.models?.find(x=>x.name===pin.model);
  if(!m||m.digest!==pin.digest||m.details?.family!=='qwen3'||m.details?.quantization_level!=='Q4_K_M')fail('MODEL_DIGEST_MISMATCH');
 }
 async function ensurePrepared(signal) {
  if(prepared)return;
  if(!preparePending)preparePending=(async()=>{
   await verifyIdentity(signal);
   const {data:s}=await request('http://127.0.0.1:11434','/api/show',{model:pin.model},signal,'metadata');
   if(s.model_info?.['tokenizer.ggml.add_bos_token']!==false||s.model_info?.['tokenizer.ggml.model']!=='gpt2'||s.model_info?.['tokenizer.ggml.pre']!=='qwen2')fail('TOKENIZER_METADATA_MISMATCH');
   modelLoads++;const {data:loaded}=await request('http://127.0.0.1:11434','/api/generate',{model:pin.model,prompt:'',stream:false,keep_alive:'5m',shift:false,truncate:false,options:{num_ctx:pin.context,num_thread:pin.threads,num_gpu:0}},signal,'model_load_only');
   if(loaded.done!==true||loaded.done_reason!=='load'||loaded.response!==''||(loaded.eval_count??0)!==0||(loaded.prompt_eval_count??0)!==0)fail('LOAD_ONLY_RESPONSE_NOT_PROVEN');
   runner=await discover({serverPid,expected:pin});record('runner_identity',runner);prepared=true;
  })();
  try {await preparePending;}finally {if(!prepared)preparePending=null;}
 }
 async function sameRunner() {
  const now=await discover({serverPid,expected:pin});if(!runner||JSON.stringify(now)!==JSON.stringify(runner))fail('RUNNER_CHANGED');
 }
 async function countInputTokens({payload,signal}={}) {
  const rendered=renderPayload(payload,pin);await ensurePrepared(signal);if(signal?.aborted)fail('ABORTED_BEFORE_TOKENIZE');await sameRunner();
  tokenizeCalls++;const {data,requestId}=await request(`http://127.0.0.1:${runner.port}`,'/tokenize',{content:rendered.text,add_special:true,parse_special:true},signal,'tokenization_only');
  if(!Array.isArray(data.tokens)||!data.tokens.length||!data.tokens.every(natural))fail('TOKENIZER_RESPONSE_INVALID');
  const count=data.tokens.length;if(count+payload.maxOutputTokens>=pin.context)fail('CONTEXT_RESERVATION_EXCEEDED');
  preparedPayloads.set(rendered.payloadHash,{rendered,count,tokenIds:clone(data.tokens),requestId,runner:clone(runner)});
  record('precount',{payload_sha256:rendered.payloadHash,rendered_sha256:rendered.sha256,input_tokens:count,token_ids_sha256:sha(data.tokens),tokenizer_request_id:requestId,model_inference_calls:0,output_tokens:0,computation_cost_usd:'NOT_MEASURED'});
  return count;
 }
 function authorize(payload) {
  const a=generationAuthorization;
  if(!a||a.scope!=='ROOT_APPROVED_BOUNDED_LOCAL_RUN'||typeof a.approvalRef!=='string'||!a.approvalRef||!natural(a.maxCalls)||!natural(a.maxOutputTokens)||!a.runId)fail('GENERATION_NOT_AUTHORIZED');
  if(!calibrationMode&&(!calibrationEvidence||calibrationEvidence.status!=='RAW_PRECOUNT_PARITY_PASS'||calibrationEvidence.modelDigest!==pin.digest||calibrationEvidence.ollamaVersion!==pin.ollamaVersion||calibrationEvidence.renderVersion!==pin.renderVersion||!Array.isArray(calibrationEvidence.caseHashes)||calibrationEvidence.caseHashes.length<2))fail('RAW_PRECOUNT_CALIBRATION_REQUIRED');
  if(calibrationMode&&(a.maxCalls>2||!calibrationPayloadHashes.includes(renderPayload(payload,pin).sha256)))fail('CALIBRATION_NOT_FROZEN_FIRST_TWO_DEV');
  if(generationCalls>=a.maxCalls||payload.maxOutputTokens>a.maxOutputTokens)fail('ADAPTER_CALL_OR_OUTPUT_LIMIT');
 }
 async function generate({payload,signal}={}) {
  if(generationBusy)fail('GENERATION_IN_PROGRESS');generationBusy=true;
  try {
  authorize(payload);const rendered=renderPayload(payload,pin),p=preparedPayloads.get(rendered.payloadHash);if(!p)fail('PAYLOAD_NOT_PRECOUNTED');
  await sameRunner();await verifyIdentity(signal);if(signal?.aborted)fail('ABORTED_BEFORE_GENERATION');
  // No queue/retry. This increment is synchronous immediately before the one generation request.
  generationCalls++;preparedPayloads.delete(rendered.payloadHash);
  const body={model:pin.model,prompt:p.rendered.text,raw:true,stream:false,think:false,truncate:false,shift:false,...(structuredOutput?{format:PROPOSAL_SCHEMA}:{}),keep_alive:'5m',options:{num_ctx:pin.context,num_thread:pin.threads,num_gpu:0,num_predict:payload.maxOutputTokens,temperature:0,seed:42}};
  const resourcesBefore=await runnerResources();
  const {data:r,requestId}=await request('http://127.0.0.1:11434','/api/generate',body,signal,'generation');
  const resourcesAfter=await runnerResources();record('generation_resources',{requestId,before:resourcesBefore,after:resourcesAfter,user_cpu_ticks_delta:resourcesAfter.user_cpu_ticks-resourcesBefore.user_cpu_ticks,system_cpu_ticks_delta:resourcesAfter.system_cpu_ticks-resourcesBefore.system_cpu_ticks,scope:'OWNED_RUNNER_CPU_NOT_ENERGY_OR_CURRENCY'});
  if(r.model!==pin.model||r.done!==true||typeof r.response!=='string'||!natural(r.prompt_eval_count)||!natural(r.eval_count))fail('GENERATION_RESPONSE_INVALID');
  if(r.prompt_eval_count!==p.count){record('precount_mismatch',{expected:p.count,actual:r.prompt_eval_count,requestId});fail('RAW_PRECOUNT_MISMATCH');}
  if(r.eval_count>payload.maxOutputTokens)fail('OUTPUT_LIMIT_BREACH');
  const usage={input_tokens:r.prompt_eval_count,output_tokens:r.eval_count,total_tokens:r.prompt_eval_count+r.eval_count};
  if(r.prompt_eval_cached_count!==undefined){if(!natural(r.prompt_eval_cached_count)||r.prompt_eval_cached_count>r.prompt_eval_count)fail('CACHE_USAGE_INVALID');usage.cached_tokens=r.prompt_eval_cached_count;}
  return {text:r.response,model:pin.model,model_version:pin.digest,request_id:requestId,request_id_source:'LOCAL_ADAPTER_NOT_PROVIDER_ID',usage_source:'provider_reported',finish_reason:r.done_reason==='stop'?'complete':'length',usage};
  } finally {generationBusy=false;}
 }
 const snapshot=()=>clone({status:'SEPARATE_TYPED_JS_ROUTER_ADAPTER',pin,prepared,runner,http_requests:httpRequests,load_requests:modelLoads,tokenization_requests:tokenizeCalls,generation_requests:generationCalls,api_fee_usd:0,api_fee_scope:'NO_PAID_REMOTE_API_USED',local_compute_electricity_hardware_cost_usd:'NOT_MEASURED',server_cancellation:'BEST_EFFORT',calibration_status:calibrationEvidence?.status??'NOT_RUN',events});
 return Object.freeze({pin:Object.freeze({...pin}),descriptor,countInputTokens,generate,snapshot});
}
