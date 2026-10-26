# Run the public reference / 執行公開參考版

## 1. Choose the meaning of the run / 先分清執行種類

- `npm test` runs offline engineering assertions. Test doubles are not real model measurements.
- `npm run demo` runs a deterministic local JS demonstration. It is not an LLM study and has no model-token charge.
- The command below starts an owned local Ollama server, obtains a real typed model proposal, validates a prior permit, executes the fixed JS function, verifies the result and terminates. It produces a **new** receipt, not a replay of the historical study.
- `scripts/run-study.mjs` is the separate, bounded research runner for the full two-model/two-interface comparison. Do not run it merely to execute one command. Historical results are already included.

`npm test` 是離線工程斷言；`npm run demo` 是純 JS 示範，兩者均不能冒充真實模型實驗。以下真模型入口會產生新的收據，不修改或冒用既有成功紀錄。完整研究入口與日常單命令入口分開。

## 2. Prerequisites / 前提

Tested public port: Linux x86_64, Node.js 24.22.1, Bash, curl, coreutils (`timeout`, `realpath`, `getconf`), Ollama **0.40.11**, CPU only, 3 threads, context 2048, output cap 64. This reference uses the pinned Ollama bundle's **internal runner tokenization endpoint**, which is not a promised stable public API. A different version, runner layout, model digest, tokenizer or platform must fail closed and needs separate validation. Native Windows/macOS execution is **not validated**; Linux in WSL/container may be investigated separately, not claimed equivalent in advance.

這個真模型入口目前只驗證上述 Linux 環境。它使用指定版本內部 runner 的 tokenization，換版本或平台不得冒稱同版通過。

Use official sources to prepare a local bundle; this repository does not install software, download weights, create keys, sign in, or call a paid API:

- [Pinned Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.11)
- [Official Linux installation information](https://docs.ollama.com/linux)
- [Official Qwen3 model listing](https://ollama.com/library/qwen3)

Review applicable third-party licenses and verify release artifacts before installation. Do not run installation instructions merely because they appear here; the machine operator decides and authorizes setup.

Set `SY_OLLAMA_ROOT` to your own absolute bundle directory. It must contain:

```text
<bundle>/bin/ollama
<bundle>/lib/ollama/llama-server
<bundle>/models/manifests/...
<bundle>/models/blobs/...
```

Ollama also needs an **existing operator-initialized home**. `SY_OLLAMA_HOME` points to that directory; default is `<bundle>/home`. The wrapper checks only that its `.ollama/id_ed25519` exists and does not read, print, copy or create that key. If setup is missing, STOP and initialize Ollama yourself following vendor documentation. Never put the home directory, key files or model weights in this repository.

Ollama 需要既有且由操作者自行初始化的 home；wrapper 不會建立、讀取或複製金鑰。若缺少此設定就停止，不自動註冊或登入。

The exact model digests, blob names and renderer settings are in `model-pins.json`. The historical study used qwen3:0.6b and qwen3:1.7b, Q4_K_M. The published command first tries 0.6B. The 1.7B weights are **not loaded or required if the small model succeeds**; they are needed only for a permitted fallback or a full two-model study. A missing candidate does not silently download anything. To prohibit fallback explicitly, set `SY_ONE_COMMAND_MAX_CALLS=1`; a failure then stops rather than exceeding the limit.

## 3. One real model command / 一條真模型命令

Run from the repository root after approved setup. Substitute your actual bundle/home paths; these are not author-specific paths.

```bash
mkdir -p local-receipts
SY_OLLAMA_ROOT=/absolute/path/to/ollama-bundle \
SY_OLLAMA_HOME=/absolute/path/to/initialized-home \
SY_ALLOW_ONE_COMMAND=SY-MULTIMODEL-SUFFICIENCY-PRICE-20261026.v0.2 \
SY_ONE_COMMAND_MAX_CALLS=1 \
timeout --signal=TERM --kill-after=5s 120s \
bash scripts/with-server.sh \
node scripts/run-one-command.mjs --case T01 --interface json --model auto \
> local-receipts/T01.json 2> local-receipts/T01.stderr.log
```

This explicit activation starts at most **one generation** with this example setting, rejects an already-running unowned server on port 11434, binds to loopback, checks the pinned version/digest and exact input count, and shuts down the server it started. If you want the predeclared two-model fallback, explicitly set `SY_ONE_COMMAND_MAX_CALLS=2`. Successful small-model completion still terminates without calling the large model.

已通過公開版移植 smoke：T01 `add(12,4)` 真正回傳 16；小模型 1 次、大模型 0 次，382 input＋17 output＝399 tokens；按所附公開費率換算 USD 0.00002165。這是另一次公開版驗證，與歷史 57 次分開。

Expected fields to inspect, not hard-coded guarantees of future token counts:

- `receipt.status = COMPLETE`, `task_complete = true`, `result = 16`.
- `selected_model`, `model_calls`, `uninvoked_models`, and `sufficient_model_stopped_escalation`.
- Prior-permit events must precede actual JS execution. Terminal replay must not execute again.
- `attempts[].row.provider_usage` and `attempts[].quote` give actual token usage and reference valuation.
- `local_settlement_status` remains `PRICE_UNDEFINED`: local electricity/hardware costs were not measured. The public provider's rate is a reference conversion, not your local invoice or a guaranteed future sale price.

Missing definitions return to the responsible operator. Unknown functions, changed parameters, invalid permits, missing usage, identity mismatch, truncation and resource limits do not become successful delivery. Do not silently repair the input or turn an incomplete receipt into PASS.

## 4. Reproduce the bounded comparison / 重現完整有限對照

Only if you intend a **new** research run and authorize its CPU/time use:

```bash
SY_OLLAMA_ROOT=/absolute/path/to/ollama-bundle \
SY_OLLAMA_HOME=/absolute/path/to/initialized-home \
SY_ALLOW_SELECTOR_RUN=SY-MULTIMODEL-SUFFICIENCY-PRICE-20261026.v0.2 \
timeout --signal=TERM --kill-after=5s 1200s \
bash scripts/with-server.sh node scripts/run-study.mjs
```

This requires both exact pinned models and writes a new timestamped `results/` directory. It is bounded at 64 generations and the protocol time/token limits. Do not change tasks to improve the score or overwrite the historical evidence. Research-mode deliberate calls to both models are not the production selector's behavior. New machine/model outputs may differ; report actual PASS/FAIL/STOP and use the same acceptance criteria.

## 5. Integrity and edits / 完整性與改版

`PUBLIC_RUNTIME_FREEZE.json` records the derived public runtime, not the old private package's approval. The entrypoints verify its hashes before execution. A mismatch stops. `scripts/freeze-runtime.mjs` is a **maintainer derivation tool**; regenerating a hash does not create independent validation, Owner approval or proof of equivalent behavior. Any edits require explicit version notes and revalidation. Preserve original and derived hashes in the provenance manifest.

Do not publish fresh raw local receipts without reviewing them: runtime paths, timestamps and environment details may be present. Keep model outputs, token counts, quality outcomes and costs unchanged while recording any necessary metadata redactions.
