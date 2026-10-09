# Predeployment estimate — 2026-10-09

Region: East US 2. Prices read from the Azure retail prices API, USD, excluding tax and contractual discounts.

| Component | Observed retail rate / assumption |
|---|---|
| ACR Basic | $0.167/day (about $5.01 for 30 days); included storage first, $0.10/GB-month additional storage |
| Container Apps active CPU | $0.000024/vCPU-second × 0.25 vCPU |
| Container Apps active memory | $0.000003/GiB-second × 0.5 GiB |
| Active compute combined | $0.027/hour before shared free grants; $19.44 for 720 continuously active hours |
| HTTP requests | $0.40/million before shared free grants |
| Logs and table storage | Allow $1–5/month for this bounded pilot; verify actual usage, not a quoted fixed charge |

A lightly used scale-to-zero pilot should fit approximately $6–12/month; continuous activity plus registry and telemetry can exceed $25. The other Container App in this subscription uses 0.5 vCPU/1 GiB with minimum zero replicas, so shared free grants are not assumed to be available. The estimate conservatively excludes those grants. ACR builds and network egress add usage-dependent charges.

Controls: one maximum replica, zero minimum, 5,000 admitted tool calls/day, four concurrent diagnostics, per-source rates, 50 MB/day workspace ingestion ceiling, alerts at $10/$20/$25, and a six-hour cost guard disabling ingress at $20. Billing latency and uncapped generic ingress mean these controls are not a guaranteed hard $25 ceiling. The guard also pauses on cost-query failure. A 37-day experiment crosses billing periods; evaluate total experiment cost separately from the monthly budget.

References: https://prices.azure.com/api/retail/prices ; https://learn.microsoft.com/en-us/azure/container-apps/billing ; https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets
