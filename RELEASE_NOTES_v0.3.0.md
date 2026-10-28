# v0.3.0｜成本可控性 × 安全交付 / Cost controllability × safe delivery

[開啟新版 Demo / Open new replay](https://hijo790401.github.io/SY-Semantic-Firewall-Function-Contract-Demo/demo/v04/)

Demo package **v0.3.0** presents **PIG standard v0.4**, study date 2026-10-28. Original v0.2.1 tag, release and historical evidence are preserved; the root demonstration now opens the new replay.

## 繁體中文
- 640 原定槽位：**639 完整有效、1 EXECUTION_UNKNOWN**；未知不重跑、不補零。0.6B 319完整，1.7B 320完整。
- 1,278 次真實模型回傳、639 次入口／領域執行、639 次完整判詞與最終 UTF-8 bytes 一致；第三次模型自由 final 為0。多 scope 的 VOID、STOP_0、DELIVER 原樣保留。
- 六筆 I03/F02/R06 真實案例對照 Skill 原輸出與受控交付；模型產生 schema-constrained JSON，由 Host dispatch，並非 Ollama 原生 tool_calls。最終答案由 Host 依判詞交付。
- 小模型已能完成這條契約內交付；有效判斷不必每次啟動大模型。企業可選能完成合法呼叫的較低價模型，並代入自己的 API 費率。
- 接線開銷另列：638 成本配對，B 輸出 tokens 減54.8027%，總 tokens 為6.2613倍、歷史參照價4.1887倍。本版不宣稱 A/B 更便宜；參照價不是實付帳單。未知用量保留未知。
- 頁面是歷史實驗回放與本地 bytes 驗證，不是線上模型服務；外部生產出口未接入，不能把關閉與拒絕測試冒充實際部署。
- 244 項公開工程測試通過；原14份公開證據雜湊核對。主 Host 108/108與領域等價35/35是另列的原研究結果，不與模型槽位相加。

## English
- **639 complete / 640 planned slots; one EXECUTION_UNKNOWN**. No rerun or zero-fill of the unknown slot. Qwen3 0.6B: 319 complete; 1.7B: 320.
- 1,278 actual model returns; 639 entry executions and 639 domain executions; 639 exact full-verdict/final UTF-8 matches. No third free-final model call. Scoped VOID, STOP_0 and DELIVER remain intact.
- Six I03/F02/R06 samples compare original Skill responses with controlled delivery. Model-generated schema-constrained JSON is Host-dispatched, not native Ollama tool_calls. Host renders the final answer.
- The tested small models achieve same-contract delivery; an effective contract need not invoke a large model for every judgment. Enterprises can select a capable lower-priced model and enter their own API rates.
- Wiring overhead is separate: 638 matched slots show 54.8027% fewer B output tokens, 6.2613× total tokens and 4.1887× historical reference cost. This release does not claim cheaper A/B execution. Reference valuation is not an actual invoice; unknown usage stays unknown.
- Historical replay and local byte verification, not hosted inference. Production external adapters were not connected. Closed/rejection-tested exits are not deployed integrations.
- 244 public engineering tests and 14 legacy evidence hashes pass. Original Host 108/108 and domain parity 35/35 remain separate study denominators.

**定義主體 / Defining principal：許文耀／沈耀888π · SERENE SCHOOL STUDIO.** Public evidence is a minimal inspection entry, not the complete private architecture or function library. Bring concrete requirements to Owner for function-contract design, integration delivery and usage licensing. Research use and commercial use remain separate under the unchanged LICENSE.

[合作 / Contact](https://silentschool.studio/zh/#contact) · [Study details](https://github.com/HIJO790401/SY-Semantic-Firewall-Function-Contract-Demo/blob/v0.3.0/docs/PIG-v04-PUBLIC-CANDIDATE.md) · [Historical v0.2.1](https://github.com/HIJO790401/SY-Semantic-Firewall-Function-Contract-Demo/releases/tag/v0.2.1)
