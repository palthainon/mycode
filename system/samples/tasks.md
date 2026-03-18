# Log Parser — Format Fix Tasks

## RFC 5424 Syslog
- [ ] **All-nil fields**: `<10>1 - - - - - -` — minimal message with all nil values. Verify parse returns empty strings not literal dashes for nil fields
- [ ] **Multiple structured-data elements**: `[sd1 k="v"][sd2 k="v"]` — current regex captures these correctly via `((?:\[[^\]]*\])+|-)` but verify field display
- [ ] **Escaped quotes in SD values**: RFC allows `\"` inside SD param values — current regex `[^\]]*` won't handle `]` inside escaped SD values like `[sdid key="val with \" quote"]`
- [ ] **High priority values**: Priority up to 191 (facility 23 × 8 + severity 7) — verify 3-digit priority parsing
- [ ] **Microsecond timestamps**: `2017-03-02T13:21:15.733598-08:00` — verify display doesn't truncate

## RFC 3164 / journald Syslog
- [ ] **No PID, no colon after process**: Lines like `<13>Feb  5 17:32:18 10.0.0.99 Use the BFG!` — no process name or colon, just hostname + message. Current regex requires process field
- [ ] **Priority prefix stripping**: Lines start with `<NNN>` but detect regex expects `^[A-Z][a-z]{2}` (month). Need to strip `<NNN>` before matching or add optional priority prefix to regex
- [ ] **No priority prefix**: Some syslog lines have no `<NNN>` at all (e.g., `Jan  7 15:30:00 web01 nginx[1234]:`) — these should still detect/parse
- [ ] **IP address as hostname**: `10.0.0.99` as hostname — verify parse extracts correctly (current regex `\S+` should handle)
- [ ] **Kernel messages**: `kernel:` without PID — verify parse handles process name with no brackets

## Apache/Nginx Combined
- [ ] **Failed connection "-" requests**: `"-"` as request — verify fallback regex fires and fields are empty strings not "-"
- [ ] **URL-encoded paths**: `%20target=` in path — verify path field preserves encoding (no decode needed)
- [ ] **Empty user-agent**: `""` at end — verify parse extracts empty string
- [ ] **Authenticated user**: `frank` instead of `-` — verify user field populated
- [ ] **Bytes field as dash**: Some lines report `-` for bytes — verify normalization to `0`

## Apache/Nginx Common
- [ ] **Same authenticated user handling** as Combined
- [ ] **HTTP/2 protocol**: `HTTP/2` instead of `HTTP/1.1` — verify regex `\S+` for protocol handles this
- [ ] **"-" request in Common**: Verify the fallback regex for malformed requests fires
- [ ] **Bytes as dash**: `-` for bytes — same normalization check

## JSON Logs
- [ ] **Numeric level fields**: Bunyan uses `level: 30` (integer) not `"INFO"` string — parser captures but display isn't human-friendly
- [ ] **Varied field names**: `msg` vs `message` vs `M` vs `event` for message; `time` vs `timestamp` vs `T` vs `datetime` for time; `level` vs `L` vs `severity` vs `level_name` — parser captures all as-is (dynamic schema), which is correct behavior
- [ ] **Nested objects**: `{"req":{"method":"HEAD","url":"/path"}}` — verify stringify produces readable output
- [ ] **Empty/null values**: `"context":{}`, `null` values — verify display
- [ ] **Numeric timestamps**: Epoch integers like `1672531200` — parser captures as string, consider noting this in column

## Windows Event Log CSV
- [ ] **Multi-line quoted messages**: Already fixed with `splitCSVRecords()` — verify with windowsapp.csv WER entries
- [ ] **Quoted source names with commas**: `"Service Control Manager"` — verify `splitRespectingQuotes` handles this
- [ ] **All level types**: Verify `Information`, `Warning`, `Error`, `Critical`, `Verbose` all pass level validation
- [ ] **Empty task category**: Trailing empty field — verify parse doesn't drop it
- [ ] **Embedded quotes in messages**: `"Provider ""Variable"" is Started."` — doubled-quote escaping

## Common Log with PID
- [ ] **Bracket syntax `[worker-1]`**: Verify detect+parse match
- [ ] **Paren syntax `(http-handler)`**: Verify detect+parse match
- [ ] **PID: syntax**: `PID:1234` — verify detect+parse match
- [ ] **Timezone-aware timestamps**: `+00:00` suffix — verify `\S*` after time captures it
- [ ] **Microsecond precision**: `.123456Z` — verify display
- [ ] **WARN vs WARNING**: Both should be accepted — verify level normalization to uppercase
- [ ] **Spring Boot format (known gap)**: `INFO 45469 --- [main]` — bare PID + `---` separator NOT matched by current regex. This is a known limitation; would require a separate parser or extended detect regex. **Track as future enhancement.**
- [ ] **Gunicorn format (known gap)**: `[timestamp] [PID] [LEVEL]` — timestamp wrapped in brackets NOT matched. **Track as future enhancement.**
- [ ] **log4net thread-before-level (known gap)**: `[main] INFO` — reversed order NOT matched. **Track as future enhancement.**
