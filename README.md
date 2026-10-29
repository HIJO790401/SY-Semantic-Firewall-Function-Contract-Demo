# 沈耀語意防火牆｜確定性函式契約 DEMO
# Shen-Yao Semantic Firewall | Deterministic Function Contract DEMO

[繁體中文](#繁體中文) · [English](#english) · [獨立中文版](README.zh-TW.md) · [English-only version](README.en.md)

<a id="繁體中文"></a>
## 繁體中文

我是沈耀888π／許文耀，SERENE SCHOOL STUDIO 的創辦人與定義者。這是我「沈耀語意防火牆｜確定性函式契約」的公開研究展示。

判決的有效性不依賴模型。模型可用於輸入轉換與表述，其輸出受契約約束，不得改變判詞，亦不得取得判決效力。

我定義判準、函式、作用範圍與停止條件。模型在已授權範圍提出呼叫，Host 執行並綁定合法回傳、版本與收據；沒有合法回傳，就沒有合法後繼。本版展示 STRICT_VERBATIM 的完整判詞與最終 UTF-8 交付核對。

## v0.4.0｜跨案例可通用性：直接審查 Anthropic 農會問題

我審查的是 Anthropic〈How AI agents shape experts’ judgment calls〉的農會問題。我的兩個追問：「大農場到什麼門檻可用產權算3-4%？」「小農場的產權3-4%標準是什麼？」必要不變量沒有定義，就沒有有效判決資格；模型不得用偏好補前提。

同一既有契約架構，這次由 Qwen3:0.6b／1.7b 完成16次新案例執行、32次真模型回傳、16次完整判詞逐字交付。A為VOID；合成B依固定條件DELIVER或STOP。這是已完成真模型實驗的摘要回放，不是即時推論。原v0.3.0成本 × 安全證據與完整成本帳保留，分母不合併。

[開啟v0.4.0案例回放](https://hijo790401.github.io/SY-Semantic-Firewall-Function-Contract-Demo/demo/case13/) · [來源／判準／實測界線](docs/CASE13-TRUE-MODEL-20261029.md) · [Anthropic原文](https://www.anthropic.com/research/agents-judgment-calls)

## v0.3.0｜成本 × 安全：既有研究證據

公開 Demo 版本：v0.4.0（新案例）／v0.3.0（既有研究）。工程標準仍為PIG v0.4；不是同一版本編號。
[開啟v0.3.0成本與安全展示](https://hijo790401.github.io/SY-Semantic-Firewall-Function-Contract-Demo/demo/v04/?v=0.3.0)
這裡回放已完成的真實實驗紀錄，Verify 執行瀏覽器本地 bytes/hash 核對。訪客點按不會重新呼叫模型，不需要提供 API 金鑰。

本輪原定640槽位：639完整有效、1 EXECUTION_UNKNOWN，未知保留。639完整槽位包含1,278次兩層模型回傳、639次入口執行、639次領域執行與639次完整判詞一致交付，沒有第三次模型自由final。公開展示是這份證據的有限窗口，不是完整私人架構。

成本另以638配對槽位比較：B輸出tokens減少54.8027%，總tokens為A的6.2613倍，歷史參考價格試算為4.1887倍。本輪不宣稱A/B總成本更低，參考試算不是實際帳單。詳見本版研究與邊界文件。

研究與重現依現有LICENSE；商業使用另議書面授權。帶具體需求來找我，沈耀888π／許文耀；我依需求設計、交付對應函式契約與使用授權。私人核心、完整共用架構與商業函式庫不隨此Demo公開。

## 研究、驗證與版本入口
- [本版研究與邊界](docs/PIG-v04-PUBLIC-CANDIDATE.md)
- [v0.3.0 發布](https://github.com/HIJO790401/SY-Semantic-Firewall-Function-Contract-Demo/releases/tag/v0.3.0)
- [Hugging Face 展示](https://huggingface.co/spaces/Yao888pi/SY-Semantic-Firewall-Function-Contract-Demo)
- [研究授權](LICENSE) · [定義與模型協助分工](AUTHORS.md)
- [v0.2.1 完整歷史說明](README.v0.2.1-history.zh-TW.md) · [舊版展示](demo/index.html) · [舊版執行說明](RUN.md)

歷史研究的 12 命令、8 項有效任務、57 次生成與舊價格均保留在歷史文件，不與本輪 640 槽位、638 成本配對合併。舊版可執行程式與原始證據不因首頁重整而改寫。

合作：[ken0963521@gmail.com](mailto:ken0963521@gmail.com) · [中文官網](https://silentschool.studio/zh)

---

<a id="english"></a>
## English

I am Shen-Yao 888π / Wen-Yao Hsu, founder and defining principal of SERENE SCHOOL STUDIO. This is the public research demonstration of my Shen-Yao Semantic Firewall | Deterministic Function Contract.

The validity of a judgment does not depend on the model. A model may be used for input transformation and expression; its output is bound by contract, may not alter the verdict, and may not acquire the effect of a judgment.

I define the criteria, functions, scope and stopping conditions. The model proposes calls within the authorized contract. The Host executes them and binds valid returns, versions and receipts; without a valid return, there is no authorized successor. This edition demonstrates STRICT_VERBATIM comparison of complete verdicts and final UTF-8 delivery.

## v0.4.0 | Cross-case applicability: examining Anthropic’s farm problem

I examine the farm problem in Anthropic’s “How AI agents shape experts’ judgment calls.” My two questions: “At what threshold may a large farm use property rights to calculate 3–4%?” and “What is the standard for the small farm’s 3–4% property rights?” Without defined necessary invariants, there is no entitlement to a valid judgment. Models may not replace missing premises with preferences.

Using the same existing contract architecture, Qwen3:0.6b/1.7b completed 16 new-case runs, 32 real model returns, and 16 exact complete-verdict deliveries. A returns VOID; synthetic B returns DELIVER or STOP according to fixed conditions. This is a summary replay of completed real-model experiments, not live inference. The v0.3.0 cost × safety evidence and complete cost account remain separate; denominators are not pooled.

[Open v0.4.0 case replay](https://hijo790401.github.io/SY-Semantic-Firewall-Function-Contract-Demo/demo/case13/) · [Sources, criteria and execution scope](docs/CASE13-TRUE-MODEL-20261029.md) · [Anthropic source](https://www.anthropic.com/research/agents-judgment-calls)

## v0.3.0 | Cost × safety: retained research evidence

Public Demo: v0.4.0 (new case) / v0.3.0 (retained study). The engineering standard remains PIG v0.4, a separate version identifier.
[Open v0.3.0 cost and safety demonstration](https://hijo790401.github.io/SY-Semantic-Firewall-Function-Contract-Demo/demo/v04/?v=0.3.0)
The page replays recorded experiments. Verify compares bytes and hashes locally in the browser. Clicking does not run a new model inference or require an API key.

The study planned 640 slots: 639 complete and one EXECUTION_UNKNOWN, retained as unknown. The complete slots contain 1,278 two-stage model returns, 639 entry executions, 639 domain executions and 639 exact full-verdict deliveries, with zero third free-final model calls. This public demonstration is a bounded evidence window, not the complete private architecture.

Cost comparison uses a separate set of 638 matched slots: B reduces output tokens by 54.8027%, while total tokens are 6.2613 times A and historical reference cost is 4.1887 times A. I do not claim lower total A/B cost for this study. Reference valuation is not an actual bill. See the study and boundaries document.

Research and reproduction follow the existing LICENSE; commercial use requires separate written authorization. Bring concrete requirements to me, Shen-Yao 888π / Wen-Yao Hsu. I design and deliver corresponding function contracts with defined usage licenses. This Demo does not disclose my private core, complete shared architecture or commercial function library.

## Research, verification and version entrypoints
- [Current study and boundaries](docs/PIG-v04-PUBLIC-CANDIDATE.md)
- [v0.3.0 release](https://github.com/HIJO790401/SY-Semantic-Firewall-Function-Contract-Demo/releases/tag/v0.3.0)
- [Hugging Face demonstration](https://huggingface.co/spaces/Yao888pi/SY-Semantic-Firewall-Function-Contract-Demo)
- [Research license](LICENSE) · [Definition authority and model assistance](AUTHORS.md)
- [Complete v0.2.1 historical description](README.v0.2.1-history.en.md) · [Historical demonstration](demo/index.html) · [Historical run instructions](RUN.md)

The historical 12-command study, 8 valid tasks, 57 generations and reference prices remain in the history document. They are not pooled with the current 640 planned slots or 638 cost-matched pairs. This introduction update does not rewrite the historical executable code or evidence.

Contact: [ken0963521@gmail.com](mailto:ken0963521@gmail.com) · [English website](https://silentschool.studio/en)
