# OldWeb MCP loop 2 — future bulk processing and learning

Date: 2026-10-10. Mode: research/propose. Requested outcome: a repository plan for later bulk analysis, privacy filtering, cheap Azure models and evidence-based context improvements.

The [future plan](../../../FUTURE-BULK-LEARNING-PLAN.md) records the design, primary sources, proposed controls, staged delivery and acceptance gates. The [prior evaluation](../../../reports/REPORT-2026-10-10.md) supplies the input-mutation and bounded-response evidence. No new external adoption evidence was collected; bulk demand remains a hypothesis. The previously reported $0.12 spend is historical and was not refreshed for this documentation-only iteration.

## Research findings and decisions

- Prefer canonical programmatic/artifact submission and exact deterministic aggregation. The existing model failures justify testing this path; they do not prove the future design will succeed.
- Shortlist a finite Container Apps Job with private Blob/Queue artifacts for the first cloud prototype. [Microsoft's Jobs documentation](https://learn.microsoft.com/en-us/azure/container-apps/jobs) supports finite manual/scheduled/event work. Actual throughput, memory and cost remain unmeasured.
- Defer Data Factory Mapping Data Flows. [Its pricing documentation](https://azure.microsoft.com/en-us/pricing/details/data-factory/data-pipeline/) specifies eight-vCore minimum execution and separate storage costs. Consider [Copy activities](https://learn.microsoft.com/en-us/azure/data-factory/copy-activity-overview) when recurring connectors/mappings justify them; they are distinct from mapping flows and do not provide a privacy gate or custom log grammar.
- Evaluate GPT-4.1-nano/mini only if eligible at implementation time. [Batch support](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/batch) and [deployment types](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/deployment-types) provide capability evidence, not an account capacity check or a current usable token-price quote. Use pay-per-token/batch candidates on selected digests rather than hosted GPUs or per-record inference.
- Require layered minimization, conservative egress and reviewed lessons. [PII limitations](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/language-service/transparency-note-personally-identifiable-information) preclude promises of complete detection. Review [Azure model processing/abuse monitoring](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy) before accepting examples or claiming region/retention guarantees.
- Extend the cost guard to independent jobs and pending model batches before activation. Ingress shutdown alone is insufficient for these proposed resources. Allocate inference/worker spend inside the existing monthly target, with atomic pending-cost reservations and fail-closed verification.

All linked sources were accessed on October 10. Deferred: public uploads, persistent private production corpus, hosted model provisioning, ADF resources, automatic promotion of model lessons, vector search, fine-tuning and new recurring automations. Bulk correctness and useful privacy-minimized lessons need local synthetic evidence first.

## Validation and next trigger

Documentation references, JSON state and unchanged pilot constraints were checked. Runtime code and resources were not changed; bulk/model/privacy tests in the new plan are proposed and have not run. The next decision is whether qualified usage or administrator feedback warrants the local synthetic bulk/privacy prototype. Current production privacy, quotas, three URLs and pilot deadline remain unchanged.
