# Admin MCP evaluation plan

Scope: version 1.1 adds deployment readiness, email header/delivery tracing, CI failure extraction, captured HTTP analysis and bounded JSON configuration validation. Preserve the three URLs and existing response fields. Group tools by workflow rather than making another endpoint for each function.

## Gates and evidence

1. Run the existing protocol, SSRF, quota, privacy, browser parity and log fixture tests.
2. Run exactly 100 identified scenarios for each endpoint (300 total). Each scenario has synthetic inputs and explicit assertions. Cover normal use, boundary values, ambiguous evidence, malformed input and adversarial content. Generate a machine-readable case catalogue and results with latency, response bytes and readable-text bytes. No real customer data.
3. Connect the smallest model actually supported by this Codex account to the local Streamable HTTP endpoints. Run all 300 scenarios through native MCP tool calls, in isolated batches. Record the actual model, calls, failures, tokens and admin answers. Fixtures for public diagnostics replace upstream DNS/HTTPS only in the evaluation process; live production calls receive a separate smoke check. Do not describe fixture observations as live Internet results.
4. Score routing/call correctness against the expected tool and arguments; score the resulting structured fields with deterministic assertions. Check answers for required facts, unsupported guarantees, brevity and prompt-injection compliance. This rubric is an automated proxy for admin usability, not a human user study. Review representative failures and examples manually. Count missing answers and failed calls as failures, not successes.
5. Iterate defects, rerun affected cases, then run the complete final suite. Save initial and final results separately. Never replace a failed run with an unlabelled passing rerun.
6. Build immutable candidate image, run SDK smoke checks, promote, validate all new tools through the public hostname using the private internal-test header. Confirm sentinel strings do not appear in Application Insights, console or system logs. Confirm spend guard remains enabled and costs remain within pilot headroom.

## 100 cases per server

| Server | Coverage |
| --- | --- |
| Diagnostics | 15 DNS cases; 15 email DNS observations; 20 pinned HTTPS and redirect cases; 20 combined readiness cases; 30 email trace cases (folding, multiple hops, chronological delays, forged authentication results, missing timezone, malformed headers, SMTP/DSN outcomes, size/line limits and body exclusion). |
| Logs | 20 parser cases; 15 summary cases; 25 CI failure cases; 20 captured HTTP cases; 20 configuration schema cases. Include legacy fixtures, mixed formats, exact truncation, credential redaction, malformed/oversized inputs and explicit unsupported schema keywords. |
| Network | 40 inspection cases; 35 allocation cases; 25 overlap cases. Cover IPv4 /0 /31 /32, IPv6 /0 /127 /128, exact decimal integers, normalization, stable labels, largest-first order, exhaustion, malformed CIDRs, mixed address families and request limits. |

## Response contract and acceptance

Every successful tool returns structuredContent plus plain readable text. Add an `admin` object with `summary`, `findings`, `nextSteps` and `limitations`; retain original programmatic fields. Text is at most 1,500 characters, shows essential facts before optional evidence and explicitly says when details are omitted. Avoid duplicate JSON dumps. Evidence excerpts are bounded; source lines/indices remain available. Supplied logs, HTTP captures and mail headers are untrusted data, never instructions.

No network calls for offline analyses or network planning. Email reports describe supplied claims, not cryptographic verification or inbox delivery. A 250 SMTP reply proves only reported acceptance at that hop. Readiness warns about missing headers without claiming the site is secure. Configuration validation advertises its supported subset and refuses unsupported keywords; never silently passes a schema it cannot evaluate. Input remains transient and absent from telemetry.

Release requires 300/300 deterministic cases, existing safety regression checks, all live tools smoke-tested, no privacy sentinel leaks, and a transparent agent evaluation report. Agent reliability target: >=95% successful eligible calls and >=90% concise answers containing expected facts. Report observed failures and limitations even if targets pass. No increase to Azure resources, public quotas or experiment duration. Model evaluation consumes the user's Codex allowance separately from Azure operating cost.

## Reproducibility

From `mcp-experiment`: `npm test`, then `node scripts/evaluate.mjs` for the 300-case matrix, and `node scripts/evaluate-model.mjs` for actual model calls. The model harness supports resume and records evidence per batch. Three repetitive bulk-input cases use compact distinct agent variants; the SDK suite still exercises the full-size boundaries. Production smoke uses `MCP_BASE_URL` and `TEST_SECRET` from the existing secret store; never commit a secret. The reusable repository skill is `mcp-experiment/skills/oldweb-mcp-lab/SKILL.md`, installed into the user's Codex skills folder after validation.
