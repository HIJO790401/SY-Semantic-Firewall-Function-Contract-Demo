import test from 'node:test';import assert from 'node:assert/strict';
import {runtimeRoot,resolvePin,MODEL_PINS} from '../src/runtime-config.mjs';
test('runtime root must be absolute',()=>{assert.throws(()=>runtimeRoot('relative'));assert.equal(runtimeRoot('/tmp/portable-ollama'),'/tmp/portable-ollama');});
test('both pinned models resolve relative bundle paths',()=>{assert.equal(MODEL_PINS.length,2);assert.equal(MODEL_PINS[0].model,'qwen3:0.6b');assert.ok(MODEL_PINS[0].server.endsWith('/bin/ollama'));assert.ok(MODEL_PINS[1].runner.endsWith('/lib/ollama/llama-server'));});
test('pin cannot escape runtime with absolute or parent path',()=>{for(const bad of ['/tmp/evil','../evil','x/../evil'])assert.throws(()=>resolvePin({blob:bad,runner:'lib/runner',server:'bin/ollama'},'/tmp/runtime'));});
