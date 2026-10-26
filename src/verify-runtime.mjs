import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function verifyRuntime(root=new URL('../',import.meta.url)){
 const f=JSON.parse(await readFile(new URL('PUBLIC_RUNTIME_FREEZE.json',root),'utf8'));
 if(f.edition!=='SY-PUBLIC-REFERENCE.v0.2.1'||!f.files_sha256||Object.keys(f.files_sha256).length<15)throw Error('PUBLIC_RUNTIME_FREEZE_REQUIRED');
 for(const [path,expected] of Object.entries(f.files_sha256)){
  if(path.startsWith('/')||path.split('/').includes('..'))throw Error('FREEZE_PATH_INVALID');
  const actual=createHash('sha256').update(await readFile(new URL(path,root))).digest('hex');
  if(actual!==expected)throw Error('PUBLIC_RUNTIME_CHANGED:'+path);
 }
 return f;
}
