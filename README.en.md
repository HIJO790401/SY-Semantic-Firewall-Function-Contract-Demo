> **Demo v0.3.0 · PIG v0.4｜成本可控性 × 安全交付 / Cost controllability × safe delivery**
>
> [新版展示 / New replay](https://hijo790401.github.io/SY-Semantic-Firewall-Function-Contract-Demo/demo/v04/) · [新版說明 / Study and boundaries](docs/PIG-v04-PUBLIC-CANDIDATE.md) · [v0.2.1 歷史發布 / Historical release](https://github.com/HIJO790401/SY-Semantic-Firewall-Function-Contract-Demo/releases/tag/v0.2.1)
>
> 639 完整有效 / 640 原定槽位，1 EXECUTION_UNKNOWN；638 成本配對。0.6B / 1.7B 小模型同案例完整判詞與交付 bytes 一致。模型選擇的成本可控性與本版雙層接線開銷分列；不宣稱本版 A/B 更便宜。這是實際紀錄回放，非線上模型服務；私有共用架構與商業函式契約須洽 Owner 設計與授權。
>
> 639 complete / 640 planned slots, one EXECUTION_UNKNOWN; 638 cost-matched pairs. Complete same-case verdicts and delivery bytes match across the tested 0.6B / 1.7B models. Model-selection cost control is separate from this two-stage implementation's overhead. This release does not claim cheaper A/B execution. Historical replay, not hosted inference. Private architecture and commercial function contracts require Owner design and licensing.
>
> 下方保留 v0.2.1 歷史研究說明，不與新實驗混算。 / The v0.2.1 study below is retained as history, not pooled with the new study.

# Shen-Yao Semantic Firewall | Deterministic Function Contract DEMO

[繁體中文](README.zh-TW.md) · [雙語首頁 / Bilingual home](README.md) · Public Reference Edition v0.2.1

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
