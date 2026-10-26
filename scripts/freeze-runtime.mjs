// Maintainer-only derivation step. A new freeze is NOT independent approval or new research evidence.
import {readFile,writeFile,readdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url), files=[];
async function walk(dir){for(const d of await readdir(new URL(dir,root),{withFileTypes:true})){if(d.isDirectory())await walk(dir+d.name+'/');else if(d.name.endsWith('.mjs')||d.name.endsWith('.sh'))files.push(dir+d.name);}}
await walk('src/');await walk('scripts/');
files.push('model-pins.json','protocol.candidate.json','research-contract.base.json','acceptance.tasks.json','development.tasks.json','ratecard.json','evidence/reference-parity.json','evidence/small-model-prior-parity.json');
const hashes={};for(const path of files.sort())hashes[path]=createHash('sha256').update(await readFile(new URL(path,root))).digest('hex');
await writeFile(new URL('PUBLIC_RUNTIME_FREEZE.json',root),JSON.stringify({edition:'SY-PUBLIC-REFERENCE.v0.2.1',status:'DERIVED_PUBLIC_RUNTIME_INTEGRITY_NOT_INDEPENDENT_RESEARCH_APPROVAL',source_private_release_sha256:'47ed4337737977764754febdf17d1aa603b1ba1b322d8c8c1e44b4b15493c173',scope:'Portable Linux paths and public execution authority; historical results are not relabeled as public reruns',files_sha256:hashes},null,2)+'\n');
