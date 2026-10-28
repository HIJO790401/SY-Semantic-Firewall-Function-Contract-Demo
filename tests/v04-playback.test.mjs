import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {replayFrames} from '../demo/v04/replay-flow.mjs';
const data=JSON.parse(readFileSync(new URL('../demo/v04/data/data.json',import.meta.url)));
test('all six replay sequences retain actual packets, scoped verdict and final',()=>{
 for(const s of data.samples){const before=JSON.stringify(s),f=replayFrames(s);assert.deepEqual(f.map(x=>x.key),['entry','domain','verdict','delivery']);assert.deepEqual(f.map(x=>x.modelCalls),[1,2,2,2]);assert.equal(f[0].payload,s.B.calls[0]);assert.equal(f[1].payload,s.B.calls[1]);assert.equal(f[2].payload,s.B.result);assert.equal(f[3].payload.final,s.B.final_text);assert.equal(JSON.stringify(s),before);}
});
test('incomplete evidence cannot create a replay',()=>{assert.throws(()=>replayFrames({B:{calls:[]}}));});
