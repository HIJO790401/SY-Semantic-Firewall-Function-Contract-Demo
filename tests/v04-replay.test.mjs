import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compareBytes,demonstrationMutation,calculatePairedCost} from '../demo/v04/verify.mjs';
const data=JSON.parse(readFileSync(new URL('../demo/v04/data/data.json',import.meta.url)));
test('browser comparator verifies all six originals and detects each one-byte change',async()=>{
 for(const s of data.samples){const r=await compareBytes(s.B.canonical_text,s.B.final_text);assert.equal(r.verbatim_equal,true);assert.equal(r.final_sha256,s.B.byte_verification.final_hash);
 const neg=await compareBytes(s.B.canonical_text,demonstrationMutation(s.B.final_text));assert.equal(neg.verbatim_equal,false);assert.equal(neg.first_mismatch_offset,r.final_utf8_bytes);}
});
test('byte comparison distinguishes newline and Unicode representations',async()=>{
 assert.equal((await compareBytes('é','e\u0301')).verbatim_equal,false);
 assert.equal((await compareBytes('x\n','x\r\n')).first_mismatch_offset,1);
 assert.equal((await compareBytes('甲','乙')).verbatim_equal,false);
});
test('enterprise rate substitution restores historical reference without fees APIs',()=>{
 const c=calculatePairedCost(data.cost,[.05,.15,.10,.25]);assert.ok(Math.abs(c.A-.05578940)<1e-12);assert.ok(Math.abs(c.B-.23368695)<1e-12);
 assert.equal(calculatePairedCost(data.cost,[0,0,0,0]).ratio,null);
 for(const r of [[-1,0,0,0],[NaN,0,0,0],[Infinity,0,0,0],[1e308,0,0,0],[]])assert.throws(()=>calculatePairedCost(data.cost,r));
});
