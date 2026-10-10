# OldWeb MCP experiment

Three stateless public MCP endpoints, thirteen read-only tools, one Azure Container App.

Version 1.1 groups deployment readiness and offline email tracing with diagnostics, and CI failures, captured HTTP metadata and bounded JSON configuration validation with logs. Each result has stable programmatic fields and an `admin` explanation; readable text is capped at 1,500 characters. Email authentication claims are not verified. JSON validation supports an explicitly documented subset and rejects remote refs, regex, formats and combinators. Overlap results now cap detailed pairs at 200 with exact `overlapCount` and omission metadata.

See [TEST-PLAN.md](TEST-PLAN.md) for the 100-case-per-server matrix and actual small-model evaluations, and [the evaluation skill](skills/oldweb-mcp-lab/SKILL.md) for reruns. Azure resource sizes, quotas, budget guard and pilot end stay unchanged; Codex evaluations consume the operator's account allowance separately.

## Future bulk processing and learning

The [future bulk and learning plan](FUTURE-BULK-LEARNING-PLAN.md) proposes canonical artifact ingestion, deterministic large-dataset processing, a privacy gate and cheap Azure model drafts of evidence-linked lessons. It compares Container Apps Jobs, Functions and Data Factory, with consistency/privacy benchmarks and combined hosting/inference budget controls. This is deferred proposal work; current inputs remain transient and no inference or bulk resources are enabled.

## Development

Requires Node 24 or newer. From this directory run `npm ci --ignore-scripts`, `npm test`, then `npm start`. In another terminal run `npm run smoke` (the diagnostics smoke test queries public DNS). Local URL: `http://127.0.0.1:8080`. Production secrets/configuration are required at startup; local memory quotas cannot be used in production.

`src/tools.ts` owns tool schemas and descriptions. Run `node scripts/export-schemas.mjs` after building if schemas change. Log fixtures and parser code are reused directly from `../system/`. IPv4 browser helpers and MCP helpers share `../nettools/subnet-core.js`. Counts larger than JavaScript's safe integer range are serialized as decimal strings.

## Deployment

The foundation Bicep template creates the dedicated resource group contents: ACR Basic, managed identity, table storage, Application Insights, 60-day Log Analytics, Consumption environment, Workbook and monthly $25 budget. Deploy the template into `rg-oldweb-mcp-experiment` in `eastus2`. Pass `budgetStart` as the first day of the current month in UTC. The app template is the initial bootstrap; subsequent releases use `scripts/deploy.ps1`.

Build context is the repository root. `.dockerignore` allows only the server, lockfile, shared parser and shared subnet module. The static workflow separately stages an allowlist of website directories and root assets, excluding backend code, git metadata, plans and credentials.

GitHub `mcp-production` uses a federated Azure identity restricted to this repository/environment and this experiment resource group. Repository variables: `MCP_AZURE_CLIENT_ID`, `MCP_AZURE_TENANT_ID`, `MCP_AZURE_SUBSCRIPTION_ID`. The identity requires Contributor on the experiment resource group; bootstrap role assignments are performed by the operator. Never use a subscription-wide deployment credential.

Manual **Deploy MCP experiment** builds an immutable image, freezes production traffic on the existing revision, creates a candidate, assigns the `candidate` label, tests its label URL, and moves traffic only after the smoke passes. `ALLOWED_HOSTS` must contain `mcp.oldweb.tech`, the generated app hostname, and `<app-name>---candidate.<environment-domain>`. The former serving revision is retained inactive and its name recorded in the `previousRevision` resource tag. For recovery after a completed build, `-UseExistingImage` reuses the same revision tag and still resolves its immutable digest and runs candidate checks. Failed candidates never receive production traffic. Each revision is limited to one replica; candidate validation briefly permits two revisions. Only the serving revision remains active after promotion or rollback.

Manual **MCP cost guard and lifecycle** supports `check`, `shutdown`, and `rollback`. Shutdown disables ingress. Rollback routes traffic to the retained revision and does not unpause a stopped pilot. Cost query failures fail closed by disabling ingress. Cost data can lag; $25 is a target, not a hard spending ceiling. Baseline registry/storage charges remain after ingress is disabled.

The billing query makes at most four attempts, waiting 5, 15, and 30 seconds between failures. Public access remains enabled during these bounded retries; exhausted retries or an invalid billing response still pause ingress. Successful verification at $20 or more still pauses immediately. Run `./scripts/test-cost-guard.ps1` to verify recovery, exhausted retries, budget shutdown, and invalid-response shutdown without contacting Azure.

## Runtime configuration

| Setting | Purpose |
|---|---|
| `HMAC_SECRET` | Random experiment-specific caller fingerprint secret, stored as a Container App secret |
| `TEST_SECRET` | Separate random secret for the `x-oldweb-test` header; internal metrics exclusion only, never a quota bypass |
| `TABLE_ENDPOINT`, `AZURE_CLIENT_ID` | Managed-identity access to persistent quota table |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Dedicated experiment telemetry sink |
| `ALLOWED_HOSTS`, `ALLOWED_ORIGINS` | Exact comma-separated request host/origin allowlists |
| `EXPERIMENT_START`, `EXPERIMENT_END` | UTC launch and shutdown times; tool requests stop automatically at the end |
| `LISTED_AT` | Actual directory phase start, set only after publication |
| `DISABLED` | Emergency application-level pause |

ACA must be the sole ingress proxy. Source rate limits trust its appended rightmost `X-Forwarded-For` IP, never caller-supplied leftmost entries. If ingress topology changes, revalidate this rule before deployment. Unknown source addresses share a conservative quota. Caller grouping additionally includes normalized user-agent; limits do not, so changing user-agent cannot evade source quotas.

At most four diagnostics are admitted simultaneously. DNS uses Google DoH with EDNS client subnet disabled. HTTPS resolves A/AAAA first, rejects any non-public result, and pins the socket to a validated address while retaining hostname TLS verification. Each redirect is revalidated; there is no request-body download, cookies, arbitrary port or credentials support.

## Telemetry and privacy

Application telemetry is explicitly constructed, not automatic HTTP instrumentation. Do not add request/dependency/exception collectors that capture arguments, URLs or stack traces. Each accepted MCP request records allowlisted method/tool/outcome fields and byte counts. Initialization alone records sanitized self-reported client metadata. No exact session identity is inferred.

Caller fingerprints use HMAC(IP + normalized user-agent). They estimate groups, not distinct people or verified agents. Generic probes are aggregated. Internal smoke calls are marked with a constant-time checked secret and excluded by Workbook queries. Telemetry overflow/send failures are represented as gap counts on recovery. Workspace cap events also indicate missing data; silence alone does not prove zero usage.

Logs are parsed transiently, never persisted. Auto mode identifies formats per line except Windows CSV logical records. Unsupported cases in the existing parser, including priority-prefixed RFC3164 lines, remain explicitly unparsed. Timestamps without complete year and timezone are excluded from ranges. Unparsed raw lines are not returned or logged.

Retention is 60 days. Destroy the fingerprint secret when retiring the experiment. Export aggregate findings before removing the isolated resource group; remove DNS and deprecate registry listings first to avoid dangling endpoints.

## Discovery and reviews

On October 10 the user advanced official Registry publication. All three version 1.1.0 entries are active; the first listing was **2026-10-10 17:32:51 UTC**. The site-linked baseline lasted about 24 hours 14 minutes instead of seven days. Preserve the November 15 end date and use actual phase timestamps for reviews. See [publication evidence](reports/registry-publication-2026-10-10.json) and [publication report](reports/REGISTRY-PUBLICATION-2026-10-10.md). The October 16 follow-up now covers remaining free directories without duplicate Registry publication.

See the [October 10 popularity research snapshot](research/popularity-2026-10-10.md) for public popularity estimates and their limitations.

Start the clock only when the custom domain, site documentation, telemetry and cost guard are verified. Days 1–7 have OldWeb links and sitemap discovery only. The original plan was to publish after seven full days; immediate publication was authorized on October 10 as recorded above. For any remaining submissions use the three manifests in `registry/` to the official MCP Registry using GitHub namespace verification, submit to Smithery, and submit to PulseMCP only if submissions are open. Record publication URLs and actual timestamps in `experiment-status.json`; update `LISTED_AT` without changing tool behavior. A directory listing is not an agent connection.

Review at days 7, 14 and 37. The Workbook shows discovery, calls, outcomes, client claims, repeat groups and telemetry gaps. Expand a service only with >=100 successful external calls, >=5 approximate groups, >=2 groups active on three days, and >=95% success among valid admitted calls. Exclude validation errors/throttles/internal tests from that denominator; report tool errors separately. Listing delays, outages and gaps make results inconclusive. End at day 37 unless the operator explicitly chooses continued operation.

Future publication/review work is scheduled in the associated Codex task after launch. GitHub's six-hour guard handles cost checks and automatic end-of-pilot ingress shutdown independently.

## Live deployment (2026-10-09)

The implementation is published on `main`. The OldWeb landing page and privacy disclosure are live. GitHub MCP tests, static-site deployment, and the OIDC cost-guard run passed. The six-hour guard is scheduled on main; a separate Codex review reports usage every Friday at 09:00 America/New_York.

Hostinger DNS is verified (TTL 300):

| Type | Host | Value |
|---|---|---|
| CNAME | `mcp` | `oldweb-mcp.greencoast-980eedf2.eastus2.azurecontainerapps.io` |
| TXT | `asuid.mcp` | `94B9870ED8C129786DAEB4D8C61BE643F1CF0CBBD321D7DB9343E368FC34F78E` |

Azure's managed certificate is bound with SNI enabled. All three endpoints passed initialization, discovery and real tool calls through `https://mcp.oldweb.tech`. Actual baseline dates and the latest validated revision are recorded in `experiment-status.json`; the three official Registry listings were published on October 10 after the user advanced the schedule.

Validation: all 10 MCP tests and 116 existing parser assertions passed, along with Bicep compilation and static-artifact staging. Inspector and an independent SDK client exercised the endpoints. Live calls verified managed-identity quota access. AppEvents retention is 60 days. Application telemetry and Container App console logs contained neither the distinctive test log string nor queried diagnostic domain. Internal cleanup probes are marked internal. Candidate failure preserved the previous serving revision; rollback and public-ingress shutdown were tested successfully before launch.

The cost guard's first posted month-to-date amount was $0.00, subject to reporting delay. Registry/storage charges continue after ingress shutdown. Public traffic must not be resumed after a budget or end-date shutdown without an explicit operating decision.

Baseline started **2026-10-09 17:19:14 UTC**. The application deadline is **2026-11-15 17:19:14 UTC**; the six-hour guard also disables ingress after the deadline. Official Registry publication completed October 10 at the user's request; remaining free-directory submissions are scheduled for October 16 at 15:00 America/New_York, with actual listing dates recorded separately. Weekly usage reviews remain Fridays at 09:00 America/New_York. The final pilot review is scheduled for November 15 at 15:00 America/New_York.

Production workflow evidence: https://github.com/palthainon/mycode/actions/runs/37964839710 ; first cost-guard run: https://github.com/palthainon/mycode/actions/runs/37963952062 . The baseline configuration passed candidate and custom-domain smoke tests before launch was recorded.

Record budgets: parse_logs defaults to 20 returned records; clients can request recordLimit 0–200. Counts always cover all submitted lines. The direct parser helper keeps its legacy default of 200 for browser/fixture compatibility.
