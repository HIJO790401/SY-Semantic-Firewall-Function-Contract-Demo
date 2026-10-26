import {resolve,isAbsolute} from 'node:path';
import {homedir} from 'node:os';
import pins from '../model-pins.json' with {type:'json'};
export function runtimeRoot(value=process.env.SY_OLLAMA_ROOT){
 const root=value??resolve(homedir(),'.local/share/sy-ollama');
 if(typeof root!=='string'||!root.trim()||!isAbsolute(root))throw Error('SY_OLLAMA_ROOT_MUST_BE_ABSOLUTE');
 return resolve(root);
}
export function resolvePin(pin,root=runtimeRoot()) {
 for(const key of ['blob','runner','server']) if(typeof pin[key]!=='string'||isAbsolute(pin[key])||pin[key].split(/[\\/]/).includes('..'))throw Error('PIN_PATH_MUST_BE_RELATIVE:'+key);
 return Object.freeze({...pin,blob:resolve(root,'models',pin.blob),runner:resolve(root,pin.runner),server:resolve(root,pin.server)});
}
export const MODEL_PINS=Object.freeze(pins.map(p=>resolvePin(p)));
