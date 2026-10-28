> **沈耀語意防火牆｜確定性函式契約 DEMO / Shen-Yao Semantic Firewall | Deterministic Function Contract DEMO · v0.3.0 · PIG v0.4**
>
> [新版展示 / New replay](https://hijo790401.github.io/SY-Semantic-Firewall-Function-Contract-Demo/demo/v04/) · [新版說明 / Study and boundaries](docs/PIG-v04-PUBLIC-CANDIDATE.md) · [v0.2.1 歷史發布 / Historical release](https://github.com/HIJO790401/SY-Semantic-Firewall-Function-Contract-Demo/releases/tag/v0.2.1)
>
> 我的實驗：639 完整有效 / 640 原定槽位，1 EXECUTION_UNKNOWN；638 成本配對。0.6B / 1.7B 小模型同案例完整判詞與交付 bytes 一致。模型選擇的成本可控性與本版雙層接線開銷分列；不宣稱本版 A/B 更便宜。這是實際紀錄回放，非線上模型服務；我的私有共用架構與商業函式契約由我設計與授權。與我合作：沈耀888π／許文耀，SERENE SCHOOL STUDIO。
>
> My experiment: 639 complete / 640 planned slots, one EXECUTION_UNKNOWN; 638 cost-matched pairs. Complete same-case verdicts and delivery bytes match across the tested 0.6B / 1.7B models. Model-selection cost control is separate from this two-stage implementation's overhead. This release does not claim cheaper A/B execution. Historical replay, not hosted inference. I design and license my private architecture and commercial function contracts. Work with me: Wen-Yao Hsu / Shen-Yao 888π, SERENE SCHOOL STUDIO.
>
> 下方保留 v0.2.1 歷史研究說明，不與新實驗混算。 / The v0.2.1 study below is retained as history, not pooled with the new study.

# 沈耀語意防火牆｜確定性函式契約 DEMO
# Shen-Yao Semantic Firewall | Deterministic Function Contract DEMO

**[繁體中文（本頁下方）](#繁體中文) · [English (on this page)](#english)**  
[獨立中文版](README.zh-TW.md) · [English-only version](README.en.md) · Public Reference Edition v0.2.1

本首頁完整提供中文與英文，先中文、後英文。  
This homepage includes both complete language versions, Chinese first and English below.

<a id="繁體中文"></a>
## 繁體中文

### 工作室與合作聯絡

正式工作室名稱：**SERENE SCHOOL STUDIO（沉靜流派工作室）**。既有網域 `silentschool.studio` 與 `silentschool` 網路識別均指同一工作室，並非另一家公司或團隊。創辦人／定義主體：許文耀／沈耀888π（Wen-Yao Hsu）。合作聯絡：[ken0963521@gmail.com](mailto:ken0963521@gmail.com)；[官網](https://silentschool.studio/zh)。

### 定義主體與模型協助分工

**函式定義、原始判準、任務邊界與驗收條件的提供及決定主體：許文耀／沈耀888π。** 模型依這些定義協助程式實作、執行測試與整理紀錄，不是定義來源，也不能自行改寫判準。執行時，模型只提出受限函式與參數；host 核准後，固定 JS 才真正執行。缺定義就停止並回 Owner。這不表示每行 AI 輔助程式都由 Owner 親自撰寫；定義來源與實作分工如上。

## 先有主體，再有命令與可執行規則

誰定義命令？誰負責？依哪個版本和邊界執行？缺定義回誰？完成或失效如何停？這些必須先講清楚。自然語言可以由 Owner 定義、糾錯、驗收直到閉環；函式把這些已定義條件固定為可執行規則。完整鏈是：**主體定義與責任 → 版本與條件 → 許可與執行 → 驗收與終止／回主體**。不是自然語言對 JSON、skill 對函式，也不是只有後端閘門。指令和 skill 可以是入口，但不能跳過主體與責任。

這不是多寫幾句提示，而是將主體定義固定成模型可引用、執行端強制的版本函式，避免每次自行重解而偷換判準；失配就停止、回 Owner，不自行補義。

## 這些紀錄怎麼支撐我的判斷

1. 固定相同函式、參數、權限與驗收：模型提案先取得 permit，才真正執行 JS；完成或失效後進入終態。
2. 本組兩模型各完成 8 項有效任務，另 4 項正確停止或交回主體。這是整批 12 命令，不把停止算成完成。
3. JSON 路徑整批公開費率參照價：0.6B 為 USD 0.00017350，1.7B 為 USD 0.00037030。多付 USD 0.00019680，新增合格交付 0。
4. 生產選擇器的小模型已達標，大模型實際呼叫 0。因此，在這個同任務、同驗收條件下，多收費就要交出額外價值；模型大小本身不構成升級理由。

只靠 skill 或自然語言指令，沒有可強制執行的權限、驗收、停止與責任規則，就不能把任務交付與成本受控當成已成立的承諾。Skill／指令可以是受控系統入口；判據在背後執行閘門，不因名稱就判定有無規則。費用是實測用量按公開費率的參照換算，不是本地帳單。下方的強勢挑戰，依據就是這條有限而可重現的證據鏈。

## 我的宣言

我是沈耀888π／許文耀。少拿模型比較大當成你多收錢的理由。你的 Agent 綁哪個函式？邊界在哪？跑完由什麼規則讓它停？交出來。我放的是實際跑過、有紀錄能驗的 Demo，不是吹未來。真正的商業函式體系在我手上，要談跨領域合作，就把需求、邊界和驗收講清楚，再來找我。想複製？研究照授權來，商用先談。你自己改、自己部署，就自己驗證、自己扛成本與一致性，別拿我的名字替你的結果背書。


**這個函式、這個模型、完成這個已定義效果，對應多少可核對的費用。**

創造與定義：**許文耀／沈耀888π**，SCBKR 與相關公式框架創造者。AI 協助實作、測試、證據分析與文件整理，分工見 AUTHORS.md。

本專案的判準：沒有可負責的主體、明確定義、可驗證函式執行與停止條件，就無法建立可核驗的任務交付與可控成本承諾。不是反對 agent，而是問：**agent 綁定哪個版本的函式與任務邊界？完成或失效後，什麼規則強制停止？**

這不是「所有大模型都沒有用」，也不是從少數測試推算某家公司必然虧損。小模型已交出相同驗收品質，就不必再啟動大模型；額外收費須對應額外可驗收價值或服務。

## 真實實驗紀錄回放

下載後雙擊 [demo/index.html](demo/index.html)，主要畫面回放已真實執行的測試，附 run id 與原始證據連結；動畫不編造未測過的模型行為。另有明確分區的瀏覽器有限 JS 固定劇本示範。沒有訪客輸入框、線上模型、API 金鑰或後端；回放與瀏覽器示範都不冒充新的 LLM 推論。需要複驗者仍可使用下方 CLI。

## 直接執行

Node.js 24（已驗 24.22.1），無 npm 相依套件、無 API 金鑰：

```sh
npm test
npm run demo -- --case T01
npm run verify-evidence
```

預設 demo 是**確定性 JS 示範**：明示固定提案→事前許可→真正執行→結果→停止；不是呼叫真模型，不宣稱驗證模型理解力，模型呼叫為零且不杜撰模型價格。真模型入口與環境說明見 RUN.md，需明確啟動，不會自動改用付費 API 或重跑研究。

## 實際觀察

同一批 12 命令包含 8 個有效任務與 4 個失效／越權案例：

- JSON 函式鏈：0.6B 與 1.7B 各 8/8 合格完成；各 2 項回主體、2 項停止，停止不灌進完成數。
- 整批參照價格：小模型 USD 0.00017350；大一級 USD 0.00037030。
- 多付 USD 0.00019680，本批新增合格交付 **0 項**。
- 生產選擇器：小模型完成 8 項後立即停，大模型實際呼叫 **0 次**。
- 自然語言直接作答：機讀驗收 2/8、7/8；數值正確 3/8、8/8。格式錯誤不冒稱算術錯誤。
- 原單入口驗證：12+4=16，小模型 1 次、大模型 0 次、399 tokens、參照 USD 0.00002165。

原研究 56 次加原入口驗證 1 次，共 57 次。公開版移植驗證另列，不改原結果。JSON 這條路徑同時包含表示方式、結構化解碼、外部控制器，不是只換提示詞的單因果實驗。

自然語言也能透過主體定義、糾正與驗收閉環。關鍵是責任、定義、許可、回傳、失效與停止條件，不是 JSON 字面。先前多次漏接 Owner 需求是實作交付缺口，不是 Owner 方法的成果或缺陷。

## 價格與授權邊界

費用是本地實測用量乘上 2026-10-26 查得 Boardwalk 同名模型公開推論費率；不套 cache 折扣。本地 Q4_K_M 與供應商 bf16 不同，這是**公開費率參照換算**，不是本地帳單、完整硬體電費、發布時價格或未來保價。原始失敗、格式差異與 1.7B JSON 比自然語言更貴的結果一併保留。

僅授權非商業研究與重現驗證，商用必須另取得書面許可。公開可讀不是完整開源授權；複製／引用不等於符合我的定義、得到認證或成為正式版本。衍生版本必須清楚標示，主張符合者須交出完整結構與收據。詳見 LICENSE、CONFORMANCE.md。

真正商業函式庫、SCBKR／AVRCK 私有 Runtime、私人核心與原始私有推導均不在此公開版。

商用與合作：**ken0963521@gmail.com**  
官網：**https://silentschool.studio/zh**

## 作者判準、部署責任與邀約

作者已提出主體定義、可驗證函式、明確停止與成本責任判準。企業複製邏輯，不代表作者替其部署的真實成本、一致性或商業承諾背書；採用、修改、部署者須自行驗證並承擔自己的操作及宣稱責任，不因引用就轉由沈耀888π／許文耀承擔。依法不得排除的責任不在排除範圍。

歡迎研究、技術交流與商業合作邀約；邀約或討論不等於取得商用許可。「確定性」指受約束的 host、函式、permit 與終態規則，不代表語言模型本身零機率失敗。

自然語言整批參照價格另列：0.6B USD 0.00018770、1.7B USD 0.00034520；1.7B JSON 比其自然語言路徑多 USD 0.00002510。公開換算價率：每百萬 input/output tokens，0.6B USD 0.05/0.15，1.7B USD 0.10/0.25。詳列來源於 evidence/prices，不宣稱cache折抵。

公開的歷史證據經私人metadata去識別，不假稱與私人原件逐位元相同；EVIDENCE_TRANSFORMATIONS.json 列出原雜湊、公開雜湊及每項變更，數值、模型原輸出、失敗與時間戳保留。npm run verify-evidence 只核檔，不冒稱重新推論。

## 商業合作邊界

真正商業函式邏輯與私有 Runtime 留在創造者手上。合作先明確定義需求、任務邊界、驗收與責任，再議定版本化函式交付、費用、可重複條件與正式合約；不是預先保證任何需求都可行，也不是移交全部私人核心。本輪是可下載 CLI 與實測證據，不是 HTTP 網頁服務或付費後端。

## 給 AI Agent 供應商的兩個問題與挑戰

1. 你的 Agent 綁定哪個版本的函式與任務邊界？
2. 任務完成或條件失效時，由哪條規則強制停止？

**同一任務、同一驗收，小模型已經完成。要我為更大模型多付錢，就交出額外可驗收的價值。交不出來，少拿「模型比較大，所以比較強」當這次升級的理由。**

這個立場對應已測硬結果：本組兩模型各 8 項有效任務合格，大模型新增合格交付 0，生產選擇器大模型呼叫 0。挑戰鎖定這份任務契約與驗收，不擴寫成所有領域的大模型都無益，也不把它變成未經證明的特定企業欺詐指控。

## 公開範圍不等於私人完整體系的範圍

本 Demo 僅公開有限驗證案例，不代表沈耀888π／許文耀完整函式體系的範圍。跨領域需求與商業合作，請直接聯繫本人，明確定義需求、邊界、驗收與合約。自行複製、修改或部署者，須自行驗證並承擔其成本、一致性與部署責任，不得視為本人交付或背書。公開測試不替未公開能力作證，也不以公開案例數量否定私人能力；具體合作依雙方明確同意的範圍辦理。

---

<a id="english"></a>
## English

### Studio and collaboration

Official studio name: **SERENE SCHOOL STUDIO (沉靜流派工作室)**. The existing `silentschool.studio` domain and `silentschool` online identifiers refer to the same studio, not a separate company or team. Founder / defining principal: Wen-Yao Hsu / Shen-Yao 888π (許文耀／沈耀888π). Collaboration: [ken0963521@gmail.com](mailto:ken0963521@gmail.com); [official website](https://silentschool.studio/en).

### Defining principal and model assistance

**Wen-Yao Hsu / Shen-Yao 888π (許文耀／沈耀888π) is the principal who supplies and decides the function definitions, original criteria, task boundaries and acceptance conditions.** Models assist implementation, test execution and record preparation under those definitions; they are not the source of the definitions and may not rewrite the criteria. At execution time, the model proposes only bounded functions and arguments; the host authorizes them before fixed JavaScript actually executes. Missing definitions stop and return to the Owner. This does not claim the Owner personally wrote every line of AI-assisted code; definition authority and implementation work are distinct.

## An accountable principal comes before commands and executable rules

Who defines the command? Who is responsible? Which version and boundary govern execution? Who receives missing definitions? What stops completion or failure? These must be explicit. An Owner can define, correct and accept natural-language instructions until the task closes; functions fix those defined conditions into executable rules. The complete chain is **principal-defined meaning and responsibility → version and conditions → permission and execution → acceptance and termination or return to the principal**. This is not natural language versus JSON, or skills versus functions, and not merely a backend gate. Commands and skills may be entrypoints but cannot omit the principal and responsibility.

This is not merely more prompting: principal-defined meaning is fixed into versioned functions the model can reference and the host enforces, instead of reinterpreting the criterion on each call; a mismatch stops and returns to the Owner rather than inventing meaning.

## How the records support my judgment

1. Hold functions, arguments, permissions and acceptance fixed: a model proposal receives a prior permit before actual JS execution; completion or failure reaches a terminal state.
2. Each model delivered 8 valid tasks and correctly stopped or returned 4 others. This is a whole 12-command basket; stopping is not counted as completed delivery.
3. The JSON route's whole-basket public-rate reference cost is USD 0.00017350 for 0.6B and USD 0.00037030 for 1.7B. An additional USD 0.00019680 bought zero additional qualified deliveries.
4. The production selector met acceptance with the smaller model and actually called the larger model zero times. Under this same task and acceptance, a premium therefore needs additional value; model size alone is not an upgrade justification.

A skill or natural-language instruction alone, without enforceable permission, acceptance, stopping and responsibility rules, does not establish a promise of task delivery and controlled cost. Skills and instructions can be entrypoints to a controlled system; the criterion is the execution gate behind them, not their label. Amounts value measured usage using public rates, not a local invoice. The challenge below rests on this finite, reproducible evidence chain.

## My challenge

I am Shen-Yao 888π / Wen-Yao Hsu. Stop using a bigger model as your reason to charge me more. Which function is your Agent bound to? Where is the boundary? What rule stops it when the work is done? Show it. I am publishing a Demo that actually ran, with records you can verify, not promises about the future. My commercial function system remains in my hands. Want cross-domain cooperation? Define the requirements, boundaries and acceptance, then come talk to me. Want to copy it? Follow the research license. For commercial use, talk to me first. If you modify and deploy it yourself, verify it yourself and take responsibility for your costs and consistency. Do not use my name to endorse your results.


**A defined function, an accountable task boundary, a verified outcome, a stop rule, and a traceable price.**

Created and defined by **Wen-Yao Hsu / Shen-Yao 888π (許文耀／沈耀888π)**, creator of SCBKR and the associated formula framework. AI assisted implementation, testing, evidence analysis and documentation; see [AUTHORS](AUTHORS.md).

The design criterion is explicit: without an accountable principal, defined functions, verifiable execution and stopping conditions, a service cannot substantiate its promised task delivery and controlled-cost boundary. A skill or natural-language instruction alone, without enforceable permission, acceptance, stopping and responsibility rules, does not establish promised task delivery and controlled cost. Skills and instructions may be entrypoints to a controlled system; the criterion is the execution gate behind them, not their name.

## Replay verified experimental records

Open [demo/index.html](demo/index.html) after downloading this repository. Its primary view replays the actual recorded experiments, with run identity and raw evidence links; animation does not fabricate model behavior. A separately labelled limited browser JS controller can also execute fixed scenarios. No visitor inputs, online model, API key or backend is required. Neither playback nor the browser controller is a new LLM inference. For reproducibility, the CLI remains below.

## What you can run

Requires Node.js 24 (tested 24.22.1). No npm dependencies, account or API key.

```sh
npm test
npm run demo -- --case T01
npm run verify-evidence
```

The default demo executes the fixed JS registry with an explicitly labelled deterministic proposal. It is **not a live model call**, does not reproduce model understanding and reports zero model calls with no model token price. It demonstrates prior permission, actual execution, result and terminal replay. For a real model run, see [RUN](RUN.md). Real-model execution is separate and explicitly activated; it never silently buys API calls or reruns the entire study.

## Observed study, not a universal benchmark

Original study on 2026-10-26: same 12 commands (8 valid, 4 invalid), two local Qwen3 models and two execution routes. The JSON route changes command representation, constrained decoding and host execution together; it is not a pure prompt-only causal experiment.

| Whole 12-command basket | Qwen3 0.6B | Qwen3 1.7B |
|---|---:|---:|
| JSON function route: qualified valid deliveries | 8/8 | 8/8 |
| JSON route: correct invalid handling | 4/4 | 4/4 |
| JSON route: reference USD | 0.00017350 | 0.00037030 |
| Direct natural-language machine-readable acceptance | 2/8 | 7/8 |
| Direct natural-language numerically correct answers | 3/8 | 8/8 |
| Natural-language route: reference USD | 0.00018770 | 0.00034520 |

The larger JSON route cost an additional reference **USD 0.00019680**, with **zero additional qualified deliveries** in this basket. The production selector completed all 8 valid tasks with the smaller model and invoked the larger model **zero times**. Missing definitions return to the principal; forbidden operations stop; these are not counted as completed tasks.

A separate original one-command CLI check returned `add(12,4) = 16`: smaller model one call, larger zero, 399 tokens, reference USD 0.00002165. Original research = 56 generations, original CLI = 1, total = 57. Public-port validation, if performed, is recorded separately and never inserted into the original study.

Natural language can be defined, corrected and accepted by an accountable principal. JSON syntax is not magical. Larger models can help other tasks; parameter count alone does not establish extra value under the same acceptance criterion. A higher price may buy additional verified capability or service, but that benefit must be identified rather than assumed.

## Price boundary

Measured local input/output tokens are valued using Boardwalk's public exact-name inference rates checked on 2026-10-26: 0.6B USD 0.05/0.15 and 1.7B USD 0.10/0.25 per million input/output tokens. No cache discount is used. See [price evidence](evidence/prices/research_summary.md).

This is **public-rate reference valuation**, not the local paid invoice, total energy/hardware cost, launch-date price, a quote for future runs, or a guaranteed sale price. Local Q4_K_M and remote bf16 deployments differ. The original 1.7B JSON route also costs more than its natural-language route; this contrary observation is retained.

## Evidence and reproduction

- [Fixed tasks](acceptance.tasks.json), [definitions](OWNER_DEFINITIONS.md), [conformance](CONFORMANCE.md).
- [Evidence provenance](EVIDENCE.md): original measured outcomes preserved; private metadata redacted with hashes and an explicit transformation ledger.
- [Research-only license](LICENSE), [third-party notices](THIRD_PARTY_NOTICES.md).
- [Run instructions](RUN.md): portable local entry, exact model pins and stop-on-mismatch behavior.

This reference contains only bounded `add` / `subtract` functions. It does **not** contain the private SCBKR/AVRCK runtime, commercial function library, private derivations, subject cores, credentials, or customer material.

## Research use and commercial inquiries

Research and reproducibility use only under the included license. **Commercial use requires separate written permission.** This is source-available research code, not an OSI open-source release. Copying or citing is not certification, affiliation or proof of conformance. Modified implementations must be identified as such and their operators are responsible for their own claims and deployment, subject to applicable law.

Contact: **ken0963521@gmail.com**  
Website: **https://silentschool.studio/zh**

## Author criterion, deployment responsibility and invitations

The author has established the criterion of accountable definition, verifiable function execution, explicit stopping and cost responsibility. A company copying the logic does not obtain a guarantee that its implementation can bear its real costs, preserve consistency or meet commercial commitments. Adopters and modifiers must verify and take responsibility for their own deployments and claims; the author does not assume those obligations merely because this reference is copied. This statement does not exclude liability that applicable law cannot exclude.

Research, technical exchange and commercial collaboration invitations are welcome at the contact above. An invitation or discussion does not itself grant commercial permission. “Deterministic” describes the constrained host/functions/permit/terminal rules, not an infallible or non-probabilistic language model.

## Commercial cooperation boundary

The actual commercial function logic and private runtime remain with the creator. For collaboration, first define the required outcome, task boundary, acceptance criteria and accountable parties. Only then negotiate the versioned function delivery, fees, reproducibility conditions and formal agreement. This invitation is not a promise that every requested task is feasible, nor a blanket transfer of the private core. The present release is downloadable CLI code and measured evidence, not a hosted HTTP service or paid backend.

## Two questions and a challenge to AI Agent providers

1. Which versioned function and task boundary is your Agent bound to?
2. Which rule forces it to stop when the task is complete or its conditions fail?

**Same task, same acceptance: the smaller model has already delivered. If you want me to pay more for a larger model, show the additional verifiable value. If you cannot, stop using “the model is bigger, therefore stronger” as the reason for this upgrade.**

This position is tied to measured facts: both models delivered all 8 valid tasks in this basket; the larger model added zero qualified deliveries; the production selector invoked the larger model zero times. The challenge is scoped to this task contract and acceptance, not a claim that larger models are useless in every domain or an unproven accusation of fraud against any company.

## Public scope is not the scope of the complete private system

This Demo publishes only finite verified cases; it does not define the full scope of Shen-Yao 888π / Wen-Yao Hsu's function system. For cross-domain requirements and commercial cooperation, contact the creator directly and define the requirements, boundaries, acceptance and agreement. Anyone independently copying, modifying or deploying must verify and take responsibility for their costs, consistency and deployment, and must not present it as the creator's delivery or endorsement. Public tests neither establish unexposed capabilities nor use the number of public cases to deny private capability; concrete cooperation follows an explicitly agreed scope.
