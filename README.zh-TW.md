# 沈耀語意防火牆｜確定性函式契約 DEMO
# Shen-Yao Semantic Firewall | Deterministic Function Contract DEMO

[English](README.en.md) · [雙語首頁](README.md)

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
