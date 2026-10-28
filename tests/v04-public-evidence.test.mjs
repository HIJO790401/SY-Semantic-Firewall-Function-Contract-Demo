import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const dir=new URL('../demo/v04/data/',import.meta.url);
const read=p=>readFileSync(new URL(p,dir));
const data=JSON.parse(read('data.json'));
const sha=b=>createHash('sha256').update(b).digest('hex');
test('640 original slots remain 639 complete and one explicitly unknown',()=>{
 assert.equal(data.summary.planned,640);assert.equal(data.summary.complete,639);
 assert.equal(data.summary.unknown.length,1);assert.equal(data.cost.paired_n,638);
 assert.equal(data.cost.unknown_second_response_usage,null);
 assert.equal(data.summary.case_summary.length,16);
 assert.equal(data.summary.case_summary.reduce((n,x)=>n+x.count,0),639);
});
test('six selected actual samples retain exact canonical/final bytes and source hashes',()=>{
 assert.equal(data.samples.length,6);
 for(const s of data.samples){
  assert.ok(['I03','F02','R06'].includes(s.case));assert.equal(s.run,1);
  const b=Buffer.from(s.B.final_text,'utf8'),v=Buffer.from(s.B.canonical_text,'utf8');
  assert.deepEqual(b,v);assert.equal(sha(b),s.B.byte_verification.final_hash);
  assert.equal(b.length,s.B.byte_verification.final_length_bytes);assert.equal(s.B.calls.length,2);
  assert.equal(s.synthetic_fixture,true);assert.ok(s.A.text.length>0);
 }
});
test('all public data file hashes match their candidate manifest',()=>{
 for(const f of JSON.parse(read('PUBLIC_EXPORT_CANDIDATE_MANIFEST.json')).files){
  const b=read(f.path);assert.equal(b.length,f.bytes);assert.equal(sha(b),f.sha256,f.path);
 }
});
test('comparison states input and total increases alongside reduced output',()=>{
 const {A,B}=data.cost.paired.all;
 assert.equal(A.n,638);assert.equal(B.n,638);
 assert.equal(A.input_total,339066);assert.equal(B.input_total,2942003);
 assert.equal(A.output_total,140984);assert.equal(B.output_total,63721);
 assert.equal(A.total_tokens,480050);assert.equal(B.total_tokens,3005724);
 assert.ok(B.total_tokens/A.total_tokens>6.26);
 assert.ok(Number(B.historical_reference_usd)/Number(A.historical_reference_usd)>4.18);
});
test('tampering one UTF-8 byte is detected; restored bytes match',()=>{
 const original=Buffer.from(data.samples[0].B.final_text,'utf8'),modified=Buffer.from(original);
 modified[0]^=1;assert.notEqual(sha(original),sha(modified));
 assert.equal(original.findIndex((x,i)=>x!==modified[i]),0);
 modified[0]^=1;assert.deepEqual(original,modified);
});
test('candidate contains no private source identifiers or machine paths',()=>{
 const serialized=JSON.stringify(data);
 for(const re of [/\/workspace\//,/\/home\/agent\//,/libfile_/,/1lPONTCEsRH3qAa6fggyA8NmtBPMLpFOI/,/SHENAN_RULE_RETRIEVAL_V1/,/BEGIN PRIVATE KEY/]) assert.equal(re.test(serialized),false,String(re));
});
