# Deterministic bulk worker — first implementation

Status: authorized synthetic prototype. The three public MCP endpoints and their limits are unchanged. The worker has no public ingress, uploaded customer artifacts, model endpoint or automated schedule. Hosted model lessons and private upload/consent workflows remain deferred in [the future plan](FUTURE-BULK-LEARNING-PLAN.md).

## Run locally

From `mcp-experiment`, run `npm run build` and `npm run bulk -- --synthetic --records 100000 --cidrs 10000 --output reports/my-bulk-run.json`. For a local operator-owned log file, use `npm run bulk -- --input <local-file> --format auto --output <local-report>`; do not commit private inputs or owner reports. No arbitrary URL input or mailbox access is provided. Only fixed record indices/categories and aggregate counts are retained; raw messages, field names, addresses, paths and credentials are omitted.

`npm run evaluate:bulk` runs four isolated synthetic sizes through one million logs and up to 100,000 CIDRs. Set `BULK_EVAL_RUN` to a fresh output directory for another run; previous evidence is preserved. `npm test` includes fixture parity and privacy/bounds/global-overlap/admission tests. The cloud workflow uses a fresh `reports/bulk-ci` directory rather than overwriting checked-in local evidence.

## Contracts and consistency

Logs reuse the browser/MCP parsers. Streaming detection looks at the same first ten physical lines; per-line mixed-format selection and Windows CSV logical framing preserve existing behavior. UTF-8 is decoded incrementally; quoted/doubled CSV quotes and CRLF survive chunk boundaries. Explicit timestamps use the shared MCP interpretation. Summary totals cover the full admitted stream; up to 20 metadata-only record references are returned. A trailing blank ordinary-log record is counted as skipped, matching the existing helper.

Network overlap uses exact BigInt subnet boundaries, a global sort and an end-address min-heap. It counts all active intervals at each start, then returns only 20 stable input-index pairs. Counts/omissions are decimal strings. Mixed address families are separate. Invalid CIDRs fail the whole operation with a constant code. Bulk allocations and full normalized-record exports are not implemented in this first version.

Local bounds: 128 MiB input, 1,000,000 logical records plus an optional final blank, 256 KiB per record, 64 KiB chunks and 100,000 CIDRs. Deadline: 160 seconds. The command sets content-free failure codes, never argument paths or arbitrary exception text. Local results expose exact accepted timestamp ranges; the learning projection excludes date values. Sensitive-category counters scan only the first 4,096 characters per record to bound work. They are heuristic observations, not proof of complete PII/credential detection or anonymization.

The allowlisted learning digest contains fixed format/severity categories, counts and privacy flags. All arbitrary free text is excluded. Two deterministic rules can draft reviewed-next-step candidates for unparsed records and timestamp uncertainty, with aggregate evidence IDs and explicit unknown causes. They are marked draft, require review and do not edit agent context or tools. No model is called.

## Manual Azure job

Use **Run synthetic MCP bulk prototype** in GitHub Actions on main. It runs tests/benchmarks, authenticates through the existing OIDC environment, checks spend, builds a separate immutable `oldweb-bulk` image, deploys [bulk-job.bicep](infra/bulk-job.bicep), checks spend again and starts a manual job. This does not change the serving MCP image or traffic. The workflow start acknowledgement is not proof of job success: check `az containerapp job execution list -g rg-oldweb-mcp-experiment -n oldweb-mcp-bulk` and inspect the completed execution's content-free aggregate log.

Cloud bounds: fixed synthetic data only; at most 100,000 logs/10,000 CIDRs; 0.25 CPU/0.5 GiB; 256-MiB Node heap; 180-second replica timeout; zero automatic retries; one replica per execution. There are no time/event triggers. Managed identity pulls from the existing private registry and accesses the existing quota table. A persistent ETag-protected admission row allows at most four admitted runs/day and 120/month, with one 180-second global lease. Failed admitted runs count against limits; corrupt/unavailable state fails closed. A container restart can resume only by a fresh admitted synthetic run; there is no artifact checkpoint/replay contract yet.

Parallelism one limits replicas within an execution; it does not prevent multiple manual executions. The shared lease serializes admitted work. Trusted operators could still incur startup/denied-run charges by repeatedly bypassing the workflow, so these controls are not an Azure billing ceiling.

The cost guard still retries transient errors and pauses at $20, unverifiable spend or pilot end. Shutdown now stops all executions of the exact synthetic job and removes that job resource after pausing ingress. It leaves unrelated jobs alone. This stateless synthetic job can be recreated from Bicep after an authorized operating decision; no input artifacts are destroyed. End date remains November 15, 2026. Do not recreate it after a shutdown without reviewing the operating decision and spend.

Using the prior retail rate of $0.027/hour at this resource size, 120 admitted 180-second runs imply up to six worker-compute hours, about $0.162/month before grants. This is a historical-rate estimate of admitted compute only; cold starts, denied executions, registry builds/storage, table transactions, logging and egress add charges. Reuse existing registry/storage/environment, assume no shared grants, retain the $2 incremental worker allowance and $25 combined target. No new paid model or Data Factory resource is provisioned.

See [local benchmark evidence](reports/bulk-2026-10-10/summary.json). Results are synthetic and machine-specific, not a promise of cloud throughput or real demand. Next: verify one bounded cloud execution and sentinel exclusion in platform logs, then decide whether authenticated artifact ingestion, restart checkpoints or model-assisted review are warranted.
