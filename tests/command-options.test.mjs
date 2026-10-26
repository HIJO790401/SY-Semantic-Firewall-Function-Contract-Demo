import test from 'node:test';import assert from 'node:assert/strict';import {parseCommandOptions} from '../src/command-options.mjs';
test('production defaults JSON auto sufficient-first',()=>assert.deepEqual(parseCommandOptions([]),{caseId:'T01',interfaceMode:'JSON_FUNCTION',model:'auto'}));
test('explicit baseline mode requires known model',()=>assert.deepEqual(parseCommandOptions(['--case','T04','--interface','natural','--model','qwen3:1.7b']),{caseId:'T04',interfaceMode:'NATURAL_COMMAND',model:'qwen3:1.7b'}));
for(const v of [['--interface','natural'],['--model','remote-paid'],['--case','/etc/passwd'],['--shell','rm'],['--case'],['--interface','eval']])test('reject unapproved options '+v,()=>assert.throws(()=>parseCommandOptions(v)));
