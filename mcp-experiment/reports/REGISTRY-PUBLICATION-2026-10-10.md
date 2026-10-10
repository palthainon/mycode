# Official MCP Registry publication — October 10, 2026

All three OldWeb servers were published successfully to the official MCP Registry under `io.github.palthainon`, version 1.1.0. No paid plan, new hosting or repository permissions were added. Public API retrieval independently confirmed each entry active and latest, with its intended Streamable HTTP URL.

| Service | Registry entry | Registry publication time (UTC) |
| --- | --- | --- |
| Diagnostics | [oldweb-diagnostics](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.palthainon%2Foldweb-diagnostics/versions/1.1.0) | 2026-10-10T17:32:51.537144Z |
| Logs | [oldweb-logs](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.palthainon%2Foldweb-logs/versions/1.1.0) | 2026-10-10T17:32:51.834208Z |
| Network | [oldweb-network](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.palthainon%2Foldweb-network/versions/1.1.0) | 2026-10-10T17:32:52.215343Z |

Evidence: [retrieved Registry entries](registry-publication-2026-10-10.json), [candidate 13-tool smoke](listed-phase-smoke-2026-10-10.json), [production initialization/discovery](registry-public-host-check-2026-10-10.json) and [listed telemetry aggregates](registry-listed-telemetry-2026-10-10.json).

## Experiment timing and deployment

The user authorized immediate publication, advancing the planned October 16 listing date. The site-linked baseline ran from 2026-10-09T17:19:14Z to the first publication, about 24 hours 14 minutes. It was not seven days or a controlled study of spontaneous discovery. The first actual listing timestamp is recorded as LISTED_AT. The original pilot end remains 2026-11-15T17:19:14Z (12:19:14 p.m. America/New_York). Reviews should use actual exposure windows; the listed phase is consequently longer than the originally planned 30 days unless the operator later changes the lifecycle.

A configuration-only candidate reused the immutable image `sha256:8134b9aa2b591d3fe184cb3bd0af0ef2602b8c23e329123edb192bfa01e3ff9e`, changing LISTED_AT while preserving tool behavior and quotas. All 13 candidate tool calls passed. Production now serves `oldweb-mcp--listed20261010`; rollback retains `oldweb-mcp--rcb647b3a4524`. All three production endpoints passed SDK initialization/discovery with the expected 5/5/3 tools. Resources remain 0.25 CPU/0.5 GiB, min zero/max one replica. Internal tests used the private test header and do not count as independent adoption.

Azure confirmed listed-phase internal initialization, discovery and calls. During the short interval between Registry publication and promotion, previous-revision events can still carry a baseline phase tag. Classify that interval using the actual listing timestamp in reviews and report this transition rather than implying perfect tag synchronization.

The established retrying cost guard verified reported month-to-date spend of $0.12 immediately before the phase change. Billing can lag; $25 remains a target, and the $20/failure/end-date shutdown controls remain in place. No new image build, model inference or paid catalogue service was used.

## Publication method and follow-up

Downloaded official `mcp-publisher` v1.8.1 from the [project release](https://github.com/modelcontextprotocol/registry/releases/tag/v1.8.1), verified the Windows archive against its release checksum and validated all three existing manifests. Used documented GitHub authentication with the existing owner account; credentials/authentication files stayed outside the repository. Submitted each manifest and independently retrieved each version through the public API. A Registry listing is discoverability metadata, not a verified agent call or guaranteed placement in downstream directories.

The existing October 16 automation was updated to handle remaining free Smithery/PulseMCP submissions, verify current state and avoid duplicate official Registry publication. It must retain the first listing time and original pilot end. This task published only the official Registry; no Smithery/PulseMCP submission is claimed. The weekly usage and final-review schedules remain active.
