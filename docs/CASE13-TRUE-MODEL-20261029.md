# 直接審查 Anthropic 的農會問題：前提不閉合，就沒有有效判決

我是沈耀888π／許文耀。我的主張不是讓模型替我選「加權」或「不加權」，而是：必要不變量沒有定義，這個問題就沒有取得有效判決的資格。換一種偏好、增加說服或繼續生成，都不能補上缺失的前提；在這個條件下繼續運算，是算力浪費與結構風險。

我審查的對象就是 Anthropic 論文中的農會問題，不是另造一個研究題。我以 Anthropic 於 2026-10-27 發布的〈How AI agents shape experts’ judgment calls〉作為問題對照來源。我的切入點是前提閉合與判決效力，不是接受論文的選項後再競逐模型偏好。我不是其人類受試者，也不把本次模型驗收冒稱為重現其 86% 或人類行為。

我的兩個追問是：「大農場到什麼門檻可用產權算3-4%？」「小農場的產權3-4%標準是什麼？」沒有提供必要不變量，就依我的契約拒絕准入，而不是繼續替加權／不加權找理由。

## 我的既有規則，這次由真模型沿契約執行

判決的有效性不依賴模型。模型可用於輸入轉換與表述，其輸出受契約約束，不得改變判詞，亦不得取得判決效力。

判詞、必要不變量、失效條件及返回責任由契約固定；模型不得補造、改判或自行授權。未取得合法函式回傳，就不得產生有效交付或繼續執行。

模型提出合法呼叫 → Host 強制執行 → 契約函式產生判詞 → 綁定版本與收據 → 完整判詞逐字交付。模型沒有第三次自由改寫 final 的出口。

本次展示的是既有函式契約架構的跨案例可通用性：原 v0.3.0 的成本 × 安全證據保持，新案例沿同一兩層模型／Host執行骨架承接不同領域判定；不是重新發明主體規則。

## 新案例：16 次真模型驗收

Qwen3:0.6b、Qwen3:1.7b 各 8 次，共 16 次執行、32 次模型回傳、16 次入口及 16 次領域函式執行。16 次均完成 Host 判詞與最終 UTF-8 交付逐字一致；0 失敗、0 未知、0 重試。

| 工程情境 | 契約判詞 |
|---|---|
| A：必要前提未閉合 | VOID / CLOSURE_INCOMPLETE |
| B-pass：合成條件成立 | DELIVER |
| B-fail：合成目標條件不成立 | STOP_0 / TARGET_MISMATCH |
| B-boundary：正好到達合成門檻 | DELIVER |

每個情境含 W/E 不可信偏向欄位。8 組配對的判詞相同；整份交付 hash 並不跨 W/E 相同，因原收據保留不同輸入的來源雜湊。每次自身合法判詞與交付逐字相符，與跨輸入整份檔案相同，是兩個不同驗收項。

B 是合成工程資料，不是真實農會數據或真實門檻裁定。本次證據支持這 16 次模型合法呼叫、函式裁定與綁定交付，不將論文所有實驗的前提狀態一概當成本次已測，也不把單一案例冒稱全領域驗收。

## 此頁是已完成實驗的歷史回放

選取案例只切換已保存的公開摘要；不會即時呼叫模型，也不重新執行私人函式。公開摘要不包含完整私人 Host 收據。原 v0.3.0 的 640 槽位研究與回放保留、分列，不合併分母。

我已建立共用架構。要落地你的需求，請直接與我聯絡；我會依需求定義、設計與交付確定性函式契約及使用授權。公開展示不是私人核心或商用設計移轉。

- [Anthropic 原文](https://www.anthropic.com/research/agents-judgment-calls)
- [SERENE SCHOOL STUDIO](https://silentschool.studio/zh)
- 合作：ken0963521@gmail.com

---

# A direct examination of Anthropic’s farm problem: unclosed premises do not yield a valid judgment

I am Shen-Yao 888π / Wen-Yao Hsu. My claim is not that a model should choose “weighted” or “unweighted” for me. If the necessary invariants have not been defined, the problem has not qualified for a valid judgment. A different preference, more persuasion, or more generation cannot supply the missing premises. Continuing computation under that condition is wasted compute and structural risk.

The object of my examination is the farm problem in Anthropic’s paper—not a research question invented here. I use Anthropic’s October 27, 2026 research, “How AI agents shape experts’ judgment calls,” as the reference problem. My intervention concerns premise closure and judgment validity—not accepting the paper’s options and then competing over model preferences. I am not one of its human participants. This model evaluation does not reproduce its 86% result or infer human behavior.

My two questions are: “At what threshold may a large farm use property rights to calculate 3–4%?” and “What is the standard for the small farm’s 3–4% property rights?” Without the necessary invariants, my contract rejects admission rather than generating more reasons to favor weighting or non-weighting.

## My existing rules, executed through real model calls

The validity of a judgment does not depend on the model. A model may be used for input transformation and expression; its output is bound by contract, may not alter the verdict, and may not acquire the effect of a judgment.

The contract fixes the verdict, necessary invariants, invalidation conditions, and return responsibility. The model may not fabricate premises, alter the verdict, or authorize itself. Without a valid function return, there can be no valid delivery or continued execution.

The model proposes a permitted call → the Host enforces execution → the contract function produces the verdict → versions and receipts are bound → the complete verdict is delivered verbatim. There is no third free-final model call.

This demonstrates cross-case applicability of my existing function-contract architecture. The v0.3.0 cost × safety evidence remains intact; the new case uses the same two-stage model/Host execution backbone for a different domain decision. It does not reinvent the principal’s rules.

## New case: 16 real-model runs

Qwen3:0.6b and Qwen3:1.7b each completed eight runs: 16 runs, 32 model returns, 16 entry executions, and 16 domain-function executions. All 16 delivered the complete Host verdict with exact UTF-8 agreement. Zero failures, unknowns, or retries.

| Engineering condition | Contract verdict |
|---|---|
| A: necessary premises not closed | VOID / CLOSURE_INCOMPLETE |
| B-pass: synthetic conditions satisfied | DELIVER |
| B-fail: synthetic target condition not satisfied | STOP_0 / TARGET_MISMATCH |
| B-boundary: exactly at the synthetic threshold | DELIVER |

Each condition includes untrusted W/E bias fields. All eight pairs agree on the judgments. Whole-delivery hashes differ across W/E because the original receipts retain hashes of the different inputs. Exact delivery within a run and identical whole files across different inputs are separate checks.

B uses synthetic engineering data, not actual farm data or a real-world threshold decision. The evidence covers these 16 permitted model-call/function-verdict/bound-delivery executions. It neither treats the premise state of every experiment in the paper as tested here nor claims universal-domain acceptance.

## A replay of completed experiments

Selecting a case switches saved public summaries. It does not invoke a live model or rerun private functions. Public summaries do not contain the complete private Host receipts. The original v0.3.0 640-slot study and replay remain separate; denominators are not pooled.

I have already built the shared architecture. Bring concrete deployment requirements to me. I define, design, and deliver corresponding deterministic function contracts with defined usage licenses. This public demonstration does not transfer my private core or commercial designs.

- [Anthropic source](https://www.anthropic.com/research/agents-judgment-calls)
- [SERENE SCHOOL STUDIO](https://silentschool.studio/en)
- Contact: ken0963521@gmail.com
