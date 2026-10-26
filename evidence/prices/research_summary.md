# Qwen3 exact-model external token price research

Verified on 2026-10-26. This is **REFERENCE_PROVIDER_VALUATION**, not the local Ollama paid bill. Active benchmark unchanged; no API calls, purchases, account writes, or external writes made.

## Current published rates (USD per 1,000,000 tokens)

| Exact hosted model | Uncached input | Output incl. reasoning | Cache read | Cache write |
|---|---:|---:|---:|---:|
| Qwen/Qwen3-0.6B | 0.05 | 0.15 | 0.005 | 0.00 |
| Qwen/Qwen3-1.7B | 0.10 | 0.25 | 0.01 | 0.00 |

Provider's exact-model pages: [0.6B](https://www.boardwalk.cloud/docs/models/Qwen/Qwen3-0.6B), [1.7B](https://www.boardwalk.cloud/docs/models/Qwen/Qwen3-1.7B). [Central catalog](https://www.boardwalk.cloud/docs/models) confirms input/output rates and USD/M units. These are direct provider-published rates, not Qwen/Alibaba's tariff. The public pages agree; conflicting search snippets were not used.

Both hosted configurations are **bfloat16, unquantized, vLLM**, referencing the exact upstream Qwen repositories. The experiment is **local Ollama Q4_K_M**. Same model name is insufficient to claim identical serving or billing. Local paid settlement remains **PRICE_UNDEFINED**; external reference valuation can nevertheless be calculated and shown separately.

No geographic service region or tariff effective-from date is stated in the checked rate pages. Use “observed 2026-10-26,” not “effective since launch.” Actual pinned source/config revision was not obtained; the API docs' example revision is not real evidence.

## Billing rules

[Provider pricing](https://www.boardwalk.cloud/docs/pricing) distinguishes paid catalog tokens from GPU-time private deployments. New organizations begin with zero credits; a purchase of at least USD 5 is required before inference. The above are normal paid rates, not a free quota. Automatic cache-write tokens are explicitly zero-priced, but other token categories are not free.

[Metering documentation](https://www.boardwalk.cloud/docs/metering) counts generated reasoning and tool calls as output. Prompt totals include cached plus uncached input; never double-count them. Cache counts that are unknown must remain unknown; a no-cache estimate is an explicitly labeled scenario. For a provider-style rounded simulation, sum all token-category charges and round upward once per request to a whole microdollar. Keep exact rational reference estimates separately if desired.

## Launch-date tariff remains a specific gap

Official release date: **2025-04-29**. [Alibaba's release announcement](https://www.alibabagroup.com/en-US/document-1853940226976645120) names both small models, describes free weight downloads, and says Model Studio API access was forthcoming. It gives no per-token launch fee. [Qwen's release blog](https://qwenlm.github.io/blog/qwen3/) confirms the release but does not establish a tariff.

Current official [English inference pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing) (updated Oct 22, 2026) and [Chinese inference pricing](https://help.aliyun.com/zh/model-studio/model-pricing) contain neither exact small model ID in the retrieved content. This is not proof that the models never had API pricing; it means these current pages cannot support an exact current Alibaba tariff or a backdated launch price. Older community/aggregator values are leads, not accepted official launch evidence. Fine-tuning token prices were rejected as the wrong service.

Do not invent zero prices, interpolate from parameter count, substitute Turbo/Plus/Max/4B/8B, or backdate Boardwalk's current rates. A replacement model is unnecessary merely to obtain an external rate, because exact-model provider rates are now verified.

## Files

- ratecard.json: machine-readable prices, integer micro-USD rates, scope, missing fields, formulas and caveats.
- evidence_sources.json: primary URLs, observation times and evidence paraphrases.
- research_summary.md: this summary.

