# Pilot extension — October 10, 2026

The user explicitly approved three calendar months beyond the original November 15, 2026 cutoff. The new application and manual synthetic worker deadline is **February 15, 2027, 17:19:14 UTC / 12:19:14 Eastern**. This changes the approved operating period; original launch, listing timestamps and historical evidence remain intact.

## Deployment and validation

- Public serving revision: `oldweb-mcp--extended20261010`, healthy, 100% traffic.
- Immutable app image unchanged: `sha256:8134b9aa2b591d3fe184cb3bd0af0ef2602b8c23e329123edb192bfa01e3ff9e`.
- Inactive rollback standby: `oldweb-mcp--rollbackextended20261010`, copied from the previous rollback revision with the approved deadline and current listing timestamp. Rolling back will preserve the extension.
- Manual job `oldweb-mcp-bulk` also has the new deadline; immutable worker image unchanged. No new job execution or model invocation was needed for this configuration change.
- Official SDK candidate tests passed **13/13 tools** across all three endpoints; see [measurements](extension-smoke-2026-10-10.json). Production custom-domain initialization, discovery and a successful tool call passed for each service after promotion. Calls were marked internal and excluded from adoption.
- Verified app: 0.25 vCPU, 0.5 GiB, minimum zero / maximum one replica. Verified worker: manual trigger, 0.25 vCPU, 0.5 GiB.

## Budget and shutdown

The pre-change billing guard verified **$0.14** reported month-to-date spend, subject to reporting delay. The $25 **monthly** target, $20 monthly pause threshold, retry-then-fail-closed spend verification, six-hour checks and manual shutdown remain unchanged. This is not a $25 total ceiling for the extended experiment. The application deadline rejects new activity at expiry; the six-hour guard then disables public ingress and stops/removes the exact synthetic worker. Registry/storage charges may continue after shutdown.

## Reviews and retention

The existing final review was rescheduled to **February 15, 2027 at 15:00 America/New_York**. Friday 09:00 usage reviews continue. The October 16 remaining-directory follow-up now preserves the new deadline, with no change to first publication or listing scope.

Raw telemetry retention stays **60 days**. Weekly reviews are instructed to export privacy-safe, non-overlapping aggregate intervals under `reports/weekly/` with query definitions, test exclusions and completeness flags. Older periods must use these archives; missing intervals are gaps, not zero usage. Caller estimates remain window-scoped: weekly distinct groups cannot be summed into unique lifetime groups. Missing historical caller evidence must be classified inconclusive. Synthetic worker activity is reported separately from public adoption.

The final review uses the original service decision thresholds with actual extended exposure and monthly plus complete-pilot costs. Operation beyond February 15 requires another explicit user decision.
