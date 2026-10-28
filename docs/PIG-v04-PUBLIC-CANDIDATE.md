# 成本可控性 × 安全交付 / Cost controllability × safe delivery

**Owner-approved public reference edition.** Demo package v0.3.0; PIG standard v0.4. Study date: 2026-10-28. Existing v0.2.1 and its 12-command evidence remain unchanged.

## 硬規則 / Enforced contract

同一有效且已鎖定的 P0/C0、定義域、函式版本、輸入與執行狀態下，**未授權生成不得取得有效答案效力**。Runtime 強制實際呼叫；入口收據綁定下一層領域呼叫；完整 scoped 判詞綁定最終 UTF-8 bytes。失效、缺回傳或跨域沒有合法後繼。原判詞有多個 scope，就分別保留 VOID、STOP_0、DELIVER、reason 與 value，不以一句摘要替換。

For the same valid, locked proposition, contract, domain, function version, input and execution state, **unauthorized generation cannot acquire effective-answer authority**. Runtime requires actual calls; the entry receipt binds the domain call; the full scoped verdict binds the final UTF-8 bytes. Invalidity, a missing return or a domain change has no authorized successor.

本標準「幻覺污染」指不具合法函式與責任資格的生成內容取得有效答案效力。不是用模型猜對機率取代契約。不阻止契約內說人話；本次展示已驗收 STRICT_VERBATIM，人話模板模式未啟用。

This standard uses “hallucination contamination” for generated content without qualified function/responsibility authority becoming an effective answer. The demonstrated mode is STRICT_VERBATIM. A separate contract-bound natural-language presentation mode is not enabled here.

## 已落地的受控本地實作 / Implemented controlled local execution

- Original denominator: **640 planned slots = 639 complete + 1 EXECUTION_UNKNOWN**. No unknown slot is rerun or zero-filled.
- Qwen3 0.6B: 319 complete / 320 planned. Qwen3 1.7B: 320 / 320.
- Complete slots contain **1,278 actual model returns**, 639 entry executions, 639 domain executions and 639 exact final deliveries. Third model free-final calls: **0**.
- Models produce schema-constrained JSON packets dispatched by Host; these are **not Ollama native `tool_calls`**. Final bytes are **Host-rendered**, not a model reciting a verdict.
- Unknown `qwen3_0.6b-R03-02`: the first response has 669 input / 28 output tokens; second response usage and final delivery are unknown, not zero.
- Across the 16 registered cases, complete outputs retain the same per-case verdict and final bytes across both tested model sizes. This page replays original records; pressing Verify performs local byte/hash comparison, not a new model execution.
- Named identities, refund policies, approvals and fixture timestamps in these cases are **synthetic experiment inputs**.

The selected I03/F02/R06 records retain full original verdict/final bytes. Receipt fields are explicitly projected into a minimum public candidate; original source hashes identify private originals, but a projected receipt is not the complete original receipt. Hashes establish byte integrity, not a signature, external acceptance or new authorization.

## 成本，不偷換分母 / Cost without changing denominators

Common paired set: **638 slots**. A and B have different missing slots; the full observed groups each contain 639 records. A's seven truncated records remain marked; truncation is not automatically a wrong answer.

| 638 paired | A Skill | B two-layer contract |
|---|---:|---:|
| Input tokens | 339,066 | 2,942,003 |
| Output tokens | 140,984 | 63,721 |
| Total tokens | 480,050 | 3,005,724 |
| Historical reference USD | 0.05578940 | 0.23368695 |

**B output is 54.8027% lower; total tokens are 6.2613× and historical reference cost is 4.1887×. This version is not presented as cheaper.** It makes the authorized path, required calls, stopping conditions and stage cost auditable. A: one call, output cap 512, context 2,048. B: two calls, cap 2,048 per call, context 12,288. A does not receive B's trusted context or oracle; this is not an equal-resource comparison. Correct A fragments remain visible.

Reference rates, USD per million tokens: 0.6B input 0.05 / output 0.15; 1.7B input 0.10 / output 0.25. These are historical study assumptions, **not current provider quotations or a local CPU bill**. The calculator substitutes the visitor's own rates; it does not contact a provider, bill, charge, or receive API keys. Local cloud CPU expense is not recorded and is not counted as zero. Unknown usage is excluded and expressly retained.

## 出口與成功狀態 / Sinks and success states

CALL_SUCCESS, VALIDATED and COMPLETED are separate. VALIDATED can preserve a legitimate VOID or STOP_0; it is not synonymous with DELIVER. COMPLETED here is answer delivery, not real payment or message sending.

Tested in-memory: FINAL_ANSWER, AUDIT_LOG_VIEW, STREAM and ERROR_FALLBACK. Entry/domain tool arguments are controlled by the dispatcher. CALLBACK, DOWNSTREAM_AGENT, FILE_AUTHORITY, MEMORY_AUTHORITY, EVENT_BUS and EXTERNAL_API are disabled and negative-tested; production external adapters were not connected. Main Host test denominator is 108/108 scenarios; domain parity is 35/35, separate from the model-study denominator.

## 內部設計與公開入口 / Internal design and public evidence

我是沈耀888π／許文耀，SERENE SCHOOL STUDIO 的創辦人與定義者。模型依我的定義執行，不自行定規、改判詞或創造授權。本公開展示是可檢查的最小展示，不含完整內部 Host、母核、函式庫、系統提示或私人規則。與我合作：沈耀888π／許文耀。我依實際需求設計對應函式契約、交付整合與使用授權。流程為企業需求 → 我的共用架構／領域函式設計 → API／Agent 接入 → 驗收與授權；各企業 adapter 待配置及驗收，不抹去已落地的本地實作與639筆完整紀錄。觀看 Demo 不等於取得完整私有設計。

I am Wen-Yao Hsu / Shen-Yao 888π, the defining principal at SERENE SCHOOL STUDIO. The public evidence window is not the private system or its capability ceiling. Existing research-and-reproducibility licensing remains unchanged; commercial use requires a separate agreement. See the unchanged repository LICENSE.

- [中文產品與合作](https://silentschool.studio/zh/products/deterministic-function-contract)
- [English product and collaboration](https://silentschool.studio/en/products/deterministic-function-contract)
- [Historical v0.2.1 Demo](../demo/index.html)
- [My current Demo](../demo/v04/index.html)

- [與我合作：沈耀888π／許文耀](https://silentschool.studio/zh/#contact) · [Work with me: Wen-Yao Hsu / Shen-Yao 888π](https://silentschool.studio/en/#contact)
