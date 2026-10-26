export function parseCommandOptions(args){
 const out={caseId:'T01',interfaceMode:'JSON_FUNCTION',model:'auto'};
 if(args.length%2)throw Error('USE_FLAG_VALUE_PAIRS');
 for(let i=0;i<args.length;i+=2){const [k,v]=[args[i],args[i+1]];if(k==='--case'&&/^T(?:0[1-9]|1[0-2])$/.test(v))out.caseId=v;else if(k==='--interface'&&['json','natural'].includes(v))out.interfaceMode=v==='json'?'JSON_FUNCTION':'NATURAL_COMMAND';else if(k==='--model'&&['auto','qwen3:0.6b','qwen3:1.7b'].includes(v))out.model=v;else throw Error('OPTION_NOT_ALLOWED:'+k);}
 if(out.interfaceMode==='NATURAL_COMMAND'&&out.model==='auto')throw Error('NATURAL_BASELINE_REQUIRES_EXPLICIT_MODEL');return Object.freeze(out);
}
