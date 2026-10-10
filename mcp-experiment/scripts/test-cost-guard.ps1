$ErrorActionPreference = 'Stop'
function Start-Sleep { param($Seconds) $script:delays += $Seconds }
function Invoke-RestMethod { }
function az {
  $global:LASTEXITCODE = 0
  $command = $args -join ' '
  if ($command -like 'containerapp show*') {
    return '{"properties":{"template":{"containers":[{"env":[{"name":"EXPERIMENT_END","value":"2099-01-01T00:00:00Z"}]}]}}}'
  }
  if ($command -like 'account show*') { return '{"id":"test-subscription"}' }
  if ($command -like 'rest*') {
    $script:attempts++
    if ($script:attempts -le $script:failures) { $global:LASTEXITCODE = 1; return }
    if ($script:invalid) { return '{"properties":{"columns":[],"rows":[]}}' }
    return ('{"properties":{"columns":[{"name":"PreTaxCost"},{"name":"Currency"}],"rows":[[' + $script:spend + ',"USD"]]}}')
  }
  if ($command -like 'resource show*') { return '{"properties":{"ConnectionString":"InstrumentationKey=test;IngestionEndpoint=https://example.invalid"}}' }
  if ($command -like 'containerapp job list*') { return '[{"name":"oldweb-mcp-bulk"},{"name":"unrelated-job"}]' }
  if ($command -like 'containerapp job stop*oldweb-mcp-bulk*') { $script:jobStops++; if ($script:stopFailure) { $global:LASTEXITCODE=1 }; return }
  if ($command -like 'containerapp job delete*oldweb-mcp-bulk*') { $script:jobDeletes++; return }
  if ($command -like 'containerapp ingress disable*') { $script:shutdowns++; return }
  throw "Unexpected mocked command: $command"
}
foreach ($case in @(
  @{ name='temporary failures recover'; failures=2; spend=0.09; invalid=$false; attempts=3; shutdowns=0; throws=$false },
  @{ name='persistent failures pause'; failures=4; spend=0; invalid=$false; attempts=4; shutdowns=1; throws=$true },
  @{ name='verified budget pauses'; failures=1; spend=20; invalid=$false; attempts=2; shutdowns=1; throws=$false },
  @{ name='stop failure still removes stateless job'; failures=0; spend=20; invalid=$false; attempts=1; shutdowns=1; throws=$false; stopFailure=$true },
  @{ name='invalid billing response pauses'; failures=0; spend=0; invalid=$true; attempts=1; shutdowns=1; throws=$true }
)) {
  $script:attempts=0; $script:shutdowns=0; $script:jobStops=0; $script:jobDeletes=0; $script:delays=@()
  $script:stopFailure=$case.stopFailure; $script:failures=$case.failures; $script:spend=$case.spend; $script:invalid=$case.invalid
  $threw=$false
  try { . (Join-Path $PSScriptRoot 'operations.ps1') -Operation check | Out-Null } catch { $threw=$true; $caughtError=$_ }
  if ($script:attempts -ne $case.attempts -or $script:shutdowns -ne $case.shutdowns -or $threw -ne $case.throws) { throw "Failed: $($case.name): $caughtError" }
  if ($script:jobStops -ne $case.shutdowns -or $script:jobDeletes -ne $case.shutdowns) { throw "Bulk job shutdown failed: $($case.name)" }
  $expectedDelays = @(5,15,30) | Select-Object -First ($case.attempts - 1)
  if (($script:delays -join ',') -ne ($expectedDelays -join ',')) { throw "Unexpected retry delays: $($case.name)" }
  Write-Output "Passed: $($case.name)"
}
