# OldWeb MCP experiment

Three stateless public MCP endpoints, eight read-only tools, one Azure Container App.

## Development

Requires Node 24 or newer. From this directory run `npm ci --ignore-scripts`, `npm test`, then `npm start`. In another terminal run `npm run smoke` (the diagnostics smoke test queries public DNS). Local URL: `http://127.0.0.1:8080`. Production secrets/configuration are required at startup; local memory quotas cannot be used in production.

`src/tools.ts` owns tool schemas and descriptions. Run `node scripts/export-schemas.mjs` after building if schemas change. Log fixtures and parser code are reused directly from `../system/`. IPv4 browser helpers and MCP helpers share `../nettools/subnet-core.js`. Counts larger than JavaScript's safe integer range are serialized as decimal strings.

## Deployment

The foundation Bicep template creates the dedicated resource group contents: ACR Basic, managed identity, table storage, Application Insights, 60-day Log Analytics, Consumption environment, Workbook and monthly $25 budget. Deploy the template into `rg-oldweb-mcp-experiment` in `eastus2`. Pass `budgetStart` as the first day of the current month in UTC. The app template is the initial bootstrap; subsequent releases use `scripts/deploy.ps1`.

Build context is the repository root. `.dockerignore` allows only the server, lockfile, shared parser and shared subnet module. The static workflow separately stages an allowlist of website directories and root assets, excluding backend code, git metadata, plans and credentials.

GitHub `mcp-production` uses a federated Azure identity restricted to this repository/environment and this experiment resource group. Repository variables: `MCP_AZURE_CLIENT_ID`, `MCP_AZURE_TENANT_ID`, `MCP_AZURE_SUBSCRIPTION_ID`. The identity requires Contributor on the experiment resource group; bootstrap role assignments are performed by the operator. Never use a subscription-wide deployment credential.

Manual **Deploy MCP experiment** builds an immutable image, freezes production traffic on the existing revision, creates a candidate, assigns the `candidate` label, tests its label URL, and moves traffic only after the smoke passes. `ALLOWED_HOSTS` must contain `mcp.oldweb.tech`, the generated app hostname, and `<app-name>---candidate.<environment-domain>`. The former serving revision is retained inactive and its name recorded in the `previousRevision` resource tag. For recovery after a completed build, `-UseExistingImage` reuses the same revision tag and still resolves its immutable digest and runs candidate checks. Failed candidates never receive production traffic. Each revision is limited to one replica; candidate validation briefly permits two revisions. Only the serving revision remains active after promotion or rollback.

Manual **MCP cost guard and lifecycle** supports `check`, `shutdown`, and `rollback`. Shutdown disables ingress. Rollback routes traffic to the retained revision and does not unpause a stopped pilot. Cost query failures fail closed by disabling ingress. Cost data can lag; $25 is a target, not a hard spending ceiling. Baseline registry/storage charges remain after ingress is disabled.

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

Start the clock only when the custom domain, site documentation, telemetry and cost guard are verified. Days 1–7 have OldWeb links and sitemap discovery only. After seven full days publish the three manifests in `registry/` to the official MCP Registry using GitHub namespace verification, submit to Smithery, and submit to PulseMCP only if submissions are open. Record publication URLs and actual timestamps in `experiment-status.json`; update `LISTED_AT` without changing tool behavior. A directory listing is not an agent connection.

Review at days 7, 14 and 37. The Workbook shows discovery, calls, outcomes, client claims, repeat groups and telemetry gaps. Expand a service only with >=100 successful external calls, >=5 approximate groups, >=2 groups active on three days, and >=95% success among valid admitted calls. Exclude validation errors/throttles/internal tests from that denominator; report tool errors separately. Listing delays, outages and gaps make results inconclusive. End at day 37 unless the operator explicitly chooses continued operation.

Future publication/review work is scheduled in the associated Codex task after launch. GitHub's six-hour guard handles cost checks and automatic end-of-pilot ingress shutdown independently.

## Launch handoff (2026-10-09)

The isolated Azure foundation and initial app are deployed. GitHub OIDC and the `mcp-production` environment exist, but workflows remain local pending permission to push the public repository branch. No directory submissions or experiment dates have been activated. The landing/privacy pages are staged locally, not published.

Hostinger DNS needs these records before Azure-managed certificate binding:

| Type | Host | Value |
|---|---|---|
| CNAME | `mcp` | `oldweb-mcp.greencoast-980eedf2.eastus2.azurecontainerapps.io` |
| TXT | `asuid.mcp` | `94B9870ED8C129786DAEB4D8C61BE643F1CF0CBBD321D7DB9343E368FC34F78E` |

After DNS resolves, add and bind `mcp.oldweb.tech` using `az containerapp hostname add` and `az containerapp hostname bind` with the managed environment. Verify TLS and all three endpoints, publish the site/privacy updates, and activate the GitHub cost guard before setting launch dates. Record the actual launch in `experiment-status.json` and set `EXPERIMENT_START` and `EXPERIMENT_END` (37 days later) in the app. Schedule directory publication and reviews only then.

Validation so far: all 10 MCP tests and 116 existing parser assertions pass; Inspector and an independent SDK client exercised all endpoints; live Azure calls verified managed-identity quota access. AppEvents retention was explicitly verified as 60 days. Searches across application telemetry and Container App console logs found zero occurrences of the distinctive smoke-test log string or queried diagnostic domain. The cost guard queried posted spend successfully. A failed candidate smoke test preserved the original serving revision.
