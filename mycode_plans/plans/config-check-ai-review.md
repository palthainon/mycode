# Config Check — AI-assisted Cisco and Ansible review

**Date:** 2026-09-10
**Ticket:** `tickets/2026-09-10-config-check-ai-review.md` (MCP2, local)
**Goal:** Ship a page where a network engineer pastes a Cisco IOS, NX-OS, or
Ansible playbook, and gets a line-numbered findings table in under 20 seconds.
Free with a usage limit. Built in one weekend.

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Where the model runs | External API. **Claude Opus 5** by default. | A local 7B–8B model on a Hostinger VPS runs 3–15 tokens/s with no GPU and knows less Cisco than the frontier models. The whole product is model plus grounding docs. Switch to Sonnet 5 only if a measured month says the bill matters. |
| Where the proxy runs | Cloudflare Worker on a `workers.dev` subdomain | oldweb.tech is on Hostinger shared LiteSpeed. It cannot run a daemon. The Worker free plan is 100k requests/day, 10 ms CPU per request, no server to patch. DNS stays on Hostinger. |
| Bot control | Cloudflare Turnstile, free plan | Unlimited verifications, 20 widgets, 10 hostnames per widget. Token is single-use and valid 5 minutes. |
| Rate limit store | Workers KV, free plan | 100k reads/day, **1,000 writes to different keys/day**. One write per review. That write cap is the built-in hard ceiling: about 1,000 reviews/day maximum, no matter what. |
| Grounding docs | Curated excerpts, 25k–35k tokens per vendor, sent as a cached system prompt | The full `jayveeye/reference/cisco` set is 66 M characters, about 16 M tokens. It cannot go in a prompt. Curate. |
| Deterministic pass | Vanilla JS in the page, runs offline, runs first | Matches the repo philosophy. Catches the cheap findings before any tokens are spent. Strips secrets. |
| Output shape | Structured JSON `{findings: [{line, severity, rule, message, fix}]}` | The page renders a table. No prose parsing. Use `output_config.format` on the Messages API. |
| AI disclosure | The page says "AI-assisted review" above the results, on every run | Anthropic usage policy requires it for consumer-facing use. |

## Existing tools checked (validate before building)

| Tool | Status | Verdict |
|---|---|---|
| ciscoconfparse2 0.9.18 (2026-05-17, GPLv3, Python 3.10+) | Maintained | Parses and queries IOS hierarchy. Does not validate syntax. Python, so not in a browser or Worker. |
| netlint (GPLv3, alpha) | Active, "subject to major changes" | IOS hygiene rules: plaintext passwords, HTTP server on, unauthenticated console. Its own docs say it does not check syntax. Its rule list seeds our deterministic pass. |
| Batfish (Apache-2.0) | Maintained | Semantic network model. 32 GB RAM Docker service. Wrong size. |
| ansible-lint, yamllint | Maintained | Python. Candidates for a server-side Ansible pass later. Not this weekend. |

No drop-in "is this IOS syntax valid" checker exists. That gap is the product.

## Architecture

```
browser (config-check.html)
  1. paste config, pick vendor
  2. deterministic pass (JS, offline)  -> findings A
  3. strip secrets
  4. Turnstile token
  5. POST /review {vendor, config, token}   -->  Worker (workers.dev)
                                                   a. siteverify the token (1 subrequest)
                                                   b. KV: per-IP daily count, global daily count
                                                   c. cap: 20,000 chars, 5 reviews/IP/day
                                                   d. Messages API, cached system prompt
                                                   e. return findings B
  6. merge A + B, render table, Copy button
```

### Worker

- TypeScript, `@anthropic-ai/sdk` (Cloudflare Workers is a supported runtime).
  Read the TypeScript README in the `claude-api` skill before writing the call.
  Do not write SDK calls from memory.
- Secrets in Worker env: `ANTHROPIC_API_KEY`, `TURNSTILE_SECRET`.
- Request: `{vendor: "ios"|"nxos"|"ansible", config: string, token: string}`.
- Order of checks, cheapest first: body size, vendor enum, Turnstile, KV
  counters, then the model call.
- Model call: `claude-opus-5`, adaptive thinking (the default), `effort: "low"`
  for this task, `max_tokens` about 4,000, structured output. The system prompt
  is the vendor's reference excerpt plus the rules, with `cache_control` on the
  reference block. Use the 1-hour cache write.
- Response: `{findings: [...], model, cached: boolean}`. Log `usage` to the
  Worker console so cache hit rate is visible.
- Errors: 429 from the API returns a friendly "busy, try again in a minute".
  Spend-cap 429 (`enforced_spend_limit_reached`) returns "free tier is used up
  for this month".

### KV keys

| Key | Value | TTL |
|---|---|---|
| `ip:<sha256(ip)>:<YYYY-MM-DD>` | count | 26 h |
| `global:<YYYY-MM-DD>` | count | 26 h |

Hash the IP. Do not store raw addresses.

### Page `nettools/config-check.html`

- Same head, scripts and navigation as every other tool. Add to the Network
  dropdown in `navigationv2.js`. Add to `sitemap.xml`.
- Textarea (20,000 char cap, live counter), vendor select, Check button,
  Clear Saved Data button. `StorageUtils` persists the vendor only. Never
  persist the pasted config.
- Results: one table, columns Line, Severity, Rule, Message, Fix, with a Copy
  button per row and one for the whole table as Markdown.
- The deterministic pass runs on every Check, and shows its findings even when
  the Worker call fails or the limit is hit.
- Disclosure line above results: "AI-assisted review. Verify before you push."
- Keyboard, ARIA, focus, and skip-link per the repo CLAUDE.md.

### Deterministic pass (JS)

IOS and NX-OS:

- Block hygiene: indentation that does not match the parent, orphan `!`, a
  child line with no parent.
- Undefined references: `ip access-group X` with no `ip access-list … X`;
  `route-map X` never defined; `prefix-list X` never defined; `class-map`,
  `policy-map`, `service-policy` chain gaps; `switchport trunk allowed vlan`
  naming a VLAN never created (NX-OS `vlan N`, IOS `vlan N`).
- Duplicate IPv4 address across interfaces.
- Interface with an IP address and no `no shutdown` (IOS default is shutdown on
  routers; flag as a warning, not an error).
- The netlint seed rules: `enable password` instead of `enable secret`, plain
  `password` on `username`, `ip http server` on, `line con 0` with no `login`.

Ansible:

- YAML sanity without a library: tab characters, mixed indentation, a `- name:`
  block with no module key, `hosts:` missing at play level, `become: yes`
  spelled as a string.
- Anything deeper waits for a server-side ansible-lint pass later.

Secret stripping, before any network call: `enable secret`, `enable password`,
`username … secret`, `username … password`, `snmp-server community`,
`key-string`, `tacacs-server … key`, `radius-server … key`, `crypto isakmp key`,
`ansible_password`, `vault` blobs. Replace the value with `<redacted>`. Show
the user a count of redactions.

## Grounding docs

Three files under `worker/reference/`: `ios.md`, `nxos.md`, `ansible.md`.
Target 25k–35k tokens each. Source them from `jayveeye/reference/cisco` and
`jayveeye/reference/ansible` by hand. Measure with `count_tokens` before the
first call. Content per file: the command reference for the 40 most common
configuration stanzas, the syntax differences the model gets wrong (IOS vs
NX-OS `interface` naming, `ip access-list extended` vs NX-OS `ip access-list`,
`switchport` on L3 platforms, `feature` gating on NX-OS), and 10 known-bad
snippets with the correct finding for each. The known-bad snippets double as
the eval set.

## Cost model (Opus 5, list price, 2026-09-10)

Per review, with a 30k-token cached reference, a 3k-token config, 800 output
tokens including thinking:

| Item | Tokens | Rate | Cost |
|---|---|---|---|
| Cache read | 30,000 | $0.50 / MTok | $0.015 |
| Config input | 3,000 | $5 / MTok | $0.015 |
| Output | 800 | $25 / MTok | $0.020 |
| **Warm total** | | | **$0.05** |
| Cache write (1 h) | 30,000 | $10 / MTok | $0.30, once per idle hour |

- 1,000 reviews/month, steady traffic: about $50.
- 100 reviews/month, sparse traffic: about $35, because cold cache writes
  dominate. That is the floor. Below it the 1-hour cache is the right choice.
- Sonnet 5 is 0.4x of every line. Haiku 4.5 is 0.2x.
- The Anthropic Start tier caps spend at $500/month and returns a clean 429
  after that. The KV write cap holds reviews under about 1,000/day. Together
  those two are the worst-case bill.
- Rate limits are not a constraint: Start tier allows 1,000 requests/minute
  and 2 M uncached input tokens/minute on Opus 5. Cached tokens do not count.

## Weekend schedule

**Saturday — the Worker**

1. Cloudflare account: Worker, KV namespace, Turnstile widget for
   `www.oldweb.tech`. Record the site key and secret.
2. Anthropic Console: API key in its own workspace with a $60/month spend
   limit set on the Billing page.
3. Curate `ios.md` first. Measure tokens. Write the system prompt and the
   structured-output schema.
4. Worker: request validation, Turnstile, KV, model call, error mapping.
   Deploy with `wrangler`. Test with `curl` from the laptop. Check
   `cache_read_input_tokens` is non-zero on the second call.
5. `nxos.md` and `ansible.md` if time allows. Otherwise ship IOS only and say
   so on the page.

**Sunday — the page**

1. `nettools/config-check.html` from the data-rate-calculator skeleton.
2. Deterministic pass and secret stripping as one JS block in the page.
3. Worker call, merge, table, copy.
4. Navigation entry, sitemap entry, robots unchanged.
5. Browser test in Chrome and Firefox: paste each of the 10 known-bad
   snippets, confirm the finding appears. Tab through every control. Screen
   reader announcement on results.
6. Ticket update. PR.

## Verification (what proves it is done)

- The 10 known-bad IOS snippets each produce the expected finding, from the
  live page, in a browser.
- A second review within an hour shows `cache_read_input_tokens > 0` in the
  Worker log.
- The 6th review from one IP in a day returns the limit message and still
  shows the deterministic findings.
- A config with `enable secret 5 $1$…` reaches the Worker with `<redacted>`
  in that position. Confirm in the Worker log.
- Page works offline for the deterministic pass after first load.

## Out of scope this weekend

- Paid tier, API keys, Stripe, per-user quotas. The KV design does not block it.
- Server-side ansible-lint.
- Streaming output.
- Juniper, Arista, Palo Alto. The vendor select is built to add them.

## Watch out

- The Worker free plan is 10 ms **CPU** per request. Waiting on Turnstile and
  the model is I/O and does not count. JSON parsing a 20k-char body is well
  under 1 ms. If a paid Workers plan is ever needed it is $5/month.
- New Anthropic orgs may start in an Evaluation tier below Start. Check the
  Console limits page before launch day.
- Hostinger renewal prices from Hostinger's own page: KVM 1 $6.49 then
  $11.99, KVM 8 $25.99 then $49.99 on a 2-year term. Recorded for the record;
  the plan does not use a VPS.
- The deterministic pass is heuristics, not a parser. The page must say so.
