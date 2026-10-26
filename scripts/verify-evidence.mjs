import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),ledger=JSON.parse(await readFile(new URL('EVIDENCE_TRANSFORMATIONS.json',root))),hash=b=>createHash('sha256').update(b).digest('hex');
for(const f of ledger.files){if(f.public_path.includes('..')||f.public_path.startsWith('/'))throw Error('UNSAFE_PATH');if(hash(await readFile(new URL(f.public_path,root)))!==f.public_sha256)throw Error('EVIDENCE_HASH_MISMATCH:'+f.public_path);}
const result=JSON.parse(await readFile(new URL('evidence/original/results/selector-2026-10-26T03-56-49-929Z/result.json',root)));
if(result.status!=='COMPLETED_BOUNDED_MULTI_MODEL_STUDY'||result.ledger.modelCalls!==56)throw Error('ORIGINAL_STUDY_IDENTITY_MISMATCH');
console.log(JSON.stringify({status:'PASS',verified_public_evidence_files:ledger.files.length,original_study_model_calls:56,mode:'READBACK_ONLY_NO_INFERENCE',redactions:'Metadata only; original and public hashes are intentionally distinct'},null,2));
