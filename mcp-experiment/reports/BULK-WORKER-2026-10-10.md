# Deterministic bulk worker implementation — October 10, 2026

Implemented and deployed the first Container Apps Jobs prototype authorized by the user. It processes bulk data with deterministic parsers and exact network calculations, gives administrators concise results and prepares metadata-only evidence for future learning. It adds no public MCP tools, uploaded private corpus, model inference or Data Factory resource. The three public servers retain their 13 tools, input quotas and serving image.

## What changed

- Streaming log aggregation reuses all seven built-in parsers and the shared explicit timestamp interpretation. Fixed-size UTF-8 chunks and quoted CSV framing preserve records across chunk boundaries. Full input counts reconcile; detail is capped at 20 fixed-category record references.
- Global CIDR overlap uses BigInt boundaries, coordinate sorting and an end-address heap. Counts remain exact across the entire inventory without emitting all pairs. Results include 20 input-index pairs and exact decimal omissions; raw addresses are excluded. Bulk allocation and normalized-record export remain deferred.
- A metadata-only learning digest excludes arbitrary field names/values, messages, addresses, paths and date values. Advisory privacy-category scans are capped at 4,096 characters per record and are explicitly incomplete. All free text is excluded regardless of detector results. Two deterministic draft-lesson rules reference aggregate counts; no draft becomes trusted context automatically.
- Local CLI supports synthetic generation or an operator-owned log file, with fixed failure codes. Real log-file mode returns no generated network results; arbitrary CIDR iterables use the exported local overlap helper. A CIDR-file/import workflow is deferred. Cloud execution accepts only synthetic generation with smaller hard limits. No private file is uploaded.
- Added separate immutable-image Bicep/managed-identity/OIDC manual deployment. Persistent ETag-protected admission permits four runs/day, 120/month and one active lease. Failed admitted runs consume quota; unavailable/corrupt state fails closed. Trusted direct Azure starts can still incur startup/denied-run charges.
- Extended the existing shutdown guard to stop/remove the exact stateless synthetic job as well as disable public ingress. A failed stop request still attempts removal. Added bounded workflow completion verification rather than relying on start acknowledgement.
- Updated the existing Friday weekly usage automation to report job results separately from public adoption. No new periodic worker or model schedule was created.

## Tests and benchmarks

The deployment workflow on GitHub Linux/Node 24 ran **34 test blocks and 116 legacy parser assertions successfully**. A subsequent local file-mode regression brings the current suite to 35 blocks. The independent SDK matrix retained **300/300 successful cases**. Four synthetic benchmarks checked exact totals at 1k, 10k, 100k and 1m log records; larger cases used 100,000 CIDRs. Fixture parity includes every built-in format, explicit/auto detection and byte-sized chunks; other tests cover multiline/doubled CSV quotes, Unicode, mixed malformed records, constant errors, oversized/deadline limits, private-field exclusion, 100 randomized brute-force overlap comparisons and a 100,000-duplicate IPv6 case with exactly 4,999,950,000 pairs. Admission tests cover limits, active lease, invalid state and UTC resets.

Five cost-guard scenarios cover transient recovery, persistent failure, verified $20 shutdown, invalid billing and failed stop with successful removal. Completion-monitor tests cover eventual success, terminal failures, sanitized query failure and timeout; it also verified the completed real Azure execution. These tests do not establish artifact checkpoint/replay, complete private-data detection or model usability, which are deferred.

| Environment | Largest tested workload | Processing time | Sampled RSS |
| --- | --- | --- | --- |
| Local Windows / Node 25.8.2 | 1,000,000 logs + 100,000 CIDRs | 10.041 seconds | 136.8 MiB |
| GitHub Linux / Node 24.21.0 | 1,000,000 logs + 100,000 CIDRs | 4.461 seconds | 157.8 MiB |
| Azure Consumption job | 100,000 logs + 10,000 CIDRs | 0.662 seconds reported by worker | 89.3 MiB |

Memory is sampled process RSS, not a guaranteed absolute peak. Timings describe one synthetic run on different hosts/workloads; do not infer comparative cloud throughput or production demand. Azure's execution start/end span was 32 seconds, including platform work beyond the worker's measured processing. Local/CI Node heap was capped at 256 MiB. The local 1m result parsed 990,000 records, counted 10,000 unparsed and a final skipped blank, and found 2,499,950,000 overlapping pairs. It read 72,715,000 bytes while returning about 6.5 KiB of aggregate results.

Evidence: [local benchmarks](bulk-2026-10-10/summary.json), [Linux CI benchmarks](bulk-ci-2026-10-10.json), [Azure aggregate metrics](bulk-azure-metrics-2026-10-10.json), [Azure privacy query](bulk-azure-privacy-2026-10-10.json) and [SDK matrix](deterministic-2026-10-10T17-50-55-381Z.json).

## Azure release and privacy verification

[Manual OIDC workflow](https://github.com/palthainon/mycode/actions/runs/38073640936) completed successfully. Source/image build commit: `c1a8c726d5176c226baac06732ba7e7f04843d62`; job image: `oldweb-bulk@sha256:d3ab3d753ac276b70da60ae113e26922197c0d261e778a8368188770b8d5b590`. Initial workflow acknowledged start; Azure execution `oldweb-mcp-bulk-hz8ubqv` was then independently verified **Succeeded**, from 17:57:08 to 17:57:40 UTC. Subsequent workflow code waits explicitly for completion.

The cloud run reported 99,000 parsed/1,000 unparsed logs, 100,001 logical records including the final blank, 10,000 CIDRs and exactly 24,995,000 overlaps. It reported `privateFieldsExcluded=true` and `modelUsed=false`. Searching 288 rows across console/system/application telemetry in the checked 30-minute window found zero occurrences of the three seeded sensitive strings. This is a seeded leakage check, not a general anonymization guarantee or proof against every encoding/category.

Actual job configuration: manual trigger, one replica, 0.25 CPU/0.5 GiB, 180-second replica timeout, zero automatic retries. Application-enforced processing deadline is 160 seconds. Maximum cloud workload remains 100k logs/10k CIDRs. No scheduled/event triggers or ingress exist. Managed identity admission succeeded against the existing table, and the successful exit includes lease release.

Public MCP traffic remains 100% on `oldweb-mcp--listed20261010`, original `oldweb-mcp` image digest `8134b9aa2b591d3fe184cb3bd0af0ef2602b8c23e329123edb192bfa01e3ff9e`. No production tool release/promotion was performed.

## Cost and next decision

Workflow checks at 17:55:12 and 17:57:04 UTC verified reported month-to-date spend of **$0.12**. Billing is delayed, so this excludes any charges not yet posted. With the prior documented $0.027/hour compute rate, 120 admitted full-timeout runs imply six hours/about $0.162 worker compute before grants; denied starts, registry builds/storage, logs, tables and egress add charges. Preserve the $2 incremental worker allowance, combined $25 target and $20/failure guard; this is not a billing ceiling. Reused existing resources rather than provisioning another registry/storage/environment or model.

The original November 15 end remains. The worker checks it at admission, and the six-hour guard removes the stateless job on shutdown. Manual runs only; the idle job does not initiate work. Keep the prototype and collect qualified admin bulk-workflow demand. Next-stage decisions are authenticated artifacts/consent and retention, restart checkpoints, larger network operations, then held-out cheap Azure model drafts on reviewed digests. Public MCP bulk interfaces and automatic lesson promotion remain deferred.

See [BULK-WORKER.md](../BULK-WORKER.md) for operation and limits and [the future plan](../FUTURE-BULK-LEARNING-PLAN.md) for remaining gates.
