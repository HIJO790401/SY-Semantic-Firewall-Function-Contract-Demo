import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {replayFrames} from '../demo/v04/replay-flow.mjs';
const data=JSON.parse(readFileSync(new URL('../demo/v04/data/data.json',import.meta.url)));
test('all six replay sequences retain actual packets, scoped verdict and final',()=>{
 for(const s of data.samples){const before=JSON.stringify(s),f=replayFrames(s);assert.deepEqual(f.map(x=>x.key),['entry','domain','verdict','delivery']);assert.deepEqual(f.map(x=>x.modelCalls),[1,2,2,2]);assert.equal(f[0].payload,s.B.calls[0]);assert.equal(f[1].payload,s.B.calls[1]);assert.equal(f[2].payload,s.B.result);assert.equal(f[3].payload.final,s.B.final_text);assert.equal(JSON.stringify(s),before);}
});
test('incomplete evidence cannot create a replay',()=>{assert.throws(()=>replayFrames({B:{calls:[]}}));});

test('formal product name retains brand, semantic firewall and deterministic contract',()=>{
 const html=readFileSync(new URL('../demo/v04/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../demo/v04/app.mjs',import.meta.url),'utf8');
 assert.ok(html.includes('沈耀語意防火牆｜確定性函式契約 DEMO'));
 assert.ok(app.includes('Shen-Yao Semantic Firewall | Deterministic Function Contract DEMO'));
 assert.ok(app.includes("document.title=T[lang].brandName"));
 for(const f of ['README.md','README.en.md','README.zh-TW.md','RELEASE_NOTES_v0.3.0.md'])assert.ok(readFileSync(new URL('../'+f,import.meta.url),'utf8').split('\n')[0].includes('確定性函式契約 DEMO'));
});
