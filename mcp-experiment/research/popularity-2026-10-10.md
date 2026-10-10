# MCP popularity snapshot — October 10, 2026

## What can be measured publicly

The official MCP Registry's public API does not expose tool-call counts, active-client counts, or a usage leaderboard. Its catalogue metadata cannot establish which servers are most used. Checked the live [OpenAPI specification](https://registry.modelcontextprotocol.io/openapi.json) and [API documentation](https://registry.modelcontextprotocol.io/docs).

PulseMCP publishes an estimated popularity list. Its metric combines visitor/package-download estimates with public data and social signals; it is not direct MCP request telemetry. See its [metric explanation](https://www.pulsemcp.com/servers/microsoft-playwright) and [registry enrichment documentation](https://www.pulsemcp.com/api).

## Top ten displayed in the weekly popularity list

Source: [PulseMCP — Most Popular (This Week)](https://www.pulsemcp.com/servers?sort=popular-desc), retrieved October 10, 2026. Values preserve the rounded labels shown on the directory page. Position means displayed list order, not a verified global usage rank.

| Position | Server | Estimated visitors/downloads this week |
|---|---|---:|
| 1 | [Playwright Browser Automation](https://www.pulsemcp.com/servers/microsoft-playwright) | 5.5m |
| 2 | [Storybook](https://www.pulsemcp.com/servers/storybook-addon-mcp) | 2.9m |
| 3 | [Chrome DevTools](https://www.pulsemcp.com/servers/chrome-devtools) | 1.8m |
| 4 | [Browser Use](https://www.pulsemcp.com/servers/browser-use) | 1.1m |
| 5 | [Filesystem](https://www.pulsemcp.com/servers/modelcontextprotocol-filesystem) | 523k |
| 6 | [Telnyx](https://www.pulsemcp.com/servers/telnyx-typescript) | 490k |
| 7 | [Context7](https://www.pulsemcp.com/servers/upstash-context7) | 483k |
| 8 | [Desktop Commander](https://www.pulsemcp.com/servers/desktop-commander) | 337k |
| 9 | [Demo (Everything)](https://www.pulsemcp.com/servers/modelcontextprotocol-demo-everything) | 268k |
| 10 | [Agent Device](https://www.pulsemcp.com/servers/agent-device) | 267k |

Directory and individual pages were inconsistent during retrieval: Filesystem's detail page showed 647k, Telnyx's 390k, and Chrome DevTools' weekly rank was #4 despite appearing third in the directory. Treat this as a dated directory snapshot, not reconciled measurements. No confidence intervals or raw measurement data were available in the inspected pages. The list also mixes local and remote servers and includes protocol demos.

## Interpretation for OldWeb

Our assessment: this sample favors browser/device automation and developer workflow integrations. That supports studying concrete agent tasks and clear onboarding, but it does not forecast demand for our public diagnostics, log parsing, or subnet planning endpoints. Local file/device tools also operate in a different context from anonymous remote services.

Keep the current pilot stable. Measure admitted external calls and approximate returning callers using our own Azure telemetry; do not compare those counts directly with PulseMCP's visitor/download estimates. Popularity does not establish quality, safety, or permission to copy or rehost another service.

## Submission status observed

PulseMCP's directory displayed a notice that new submissions and listing changes remain paused. Recheck on the scheduled October 16 listing date; do not assume the form has reopened.

## Refresh procedure

1. Recheck official Registry API fields for any newly available usage metrics.
2. Open PulseMCP's weekly popularity view and record the retrieval date.
3. Preserve its displayed metric name, rounded values, and ordering; note inconsistencies.
4. Save a new dated snapshot rather than overwriting this historical observation.

Research only: no servers were installed, copied, or submitted to directories for this snapshot.
