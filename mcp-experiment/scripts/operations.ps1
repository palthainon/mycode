param([ValidateSet('check','shutdown','rollback')][string]$Operation = 'check', [string]$Group = 'rg-oldweb-mcp-experiment', [string]$App = 'oldweb-mcp')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'cost-query.ps1')
function AzJson { $result = & az @args --only-show-errors -o json; if ($LASTEXITCODE) { throw 'Azure command failed' }; if ($result) { ($result -join "`n") | ConvertFrom-Json -Depth 100 } }
$appState = AzJson containerapp show -g $Group -n $App
function Stop-Pilot {
  AzJson containerapp ingress disable -g $Group -n $App | Out-Null
  # The prototype job has no input storage and can be recreated from Bicep. Delete it
  # after stopping executions so independent compute cannot survive ingress shutdown.
  $bulkJobs = @(AzJson containerapp job list -g $Group | Where-Object name -eq 'oldweb-mcp-bulk')
  foreach ($bulkJob in $bulkJobs) {
    AzJson containerapp job stop -g $Group -n $bulkJob.name | Out-Null
    AzJson containerapp job delete -g $Group -n $bulkJob.name --yes | Out-Null
  }
  Write-Output 'Public ingress disabled; synthetic bulk job stopped and removed if present. Registry/storage retention charges may continue.'
}
if ($Operation -eq 'shutdown') { Stop-Pilot; exit }
if ($Operation -eq 'rollback') {
  $previous = $appState.tags.previousRevision
  if (-not $previous -or -not $appState.properties.configuration.ingress) { throw 'No rollback target or experiment is paused' }
  AzJson containerapp revision activate -g $Group -n $App --revision $previous | Out-Null
  AzJson containerapp ingress traffic set -g $Group -n $App --revision-weight "$previous=100" | Out-Null
  foreach ($revision in (AzJson containerapp revision list -g $Group -n $App)) {
    if ($revision.properties.active -and $revision.name -ne $previous) { AzJson containerapp revision deactivate -g $Group -n $App --revision $revision.name | Out-Null }
  }
  Write-Output "Rolled back to $previous"; exit
}
$end = ($appState.properties.template.containers[0].env | Where-Object name -eq 'EXPERIMENT_END').value
if (-not $end -or [datetimeoffset]::UtcNow -ge [datetimeoffset]::Parse($end)) { Stop-Pilot; Write-Output 'Experiment ended or end date missing'; exit }
$subscription = (AzJson account show).id
$query = @{ type = 'ActualCost'; timeframe = 'MonthToDate'; dataset = @{ granularity = 'None'; aggregation = @{ totalCost = @{ name = 'PreTaxCost'; function = 'Sum' } } } } | ConvertTo-Json -Depth 8 -Compress
$tempFile = Join-Path ([IO.Path]::GetTempPath()) ('mcp-cost-' + [guid]::NewGuid() + '.json')
try {
  [IO.File]::WriteAllText($tempFile, $query)
  $cost = Invoke-CostQueryWithRetry {
    AzJson rest --method post --url "https://management.azure.com/subscriptions/$subscription/resourceGroups/$Group/providers/Microsoft.CostManagement/query?api-version=2023-11-01" --body "@$tempFile"
  }
  $columns = @($cost.properties.columns.name)
  $costIndex = [array]::IndexOf($columns, 'PreTaxCost'); $currencyIndex = [array]::IndexOf($columns, 'Currency')
  if ($costIndex -lt 0 -or $currencyIndex -lt 0) { throw 'Unexpected cost schema' }
  $total = 0.0
  foreach ($row in $cost.properties.rows) {
    if ($row[$currencyIndex] -ne 'USD') { throw 'Budget guard expects USD' }
    $total += [double]$row[$costIndex]
  }
  Write-Output ('Reported month-to-date cost: ${0:N2}' -f $total)
  $insights = AzJson resource show -g $Group -n oldwebmcp-insights --resource-type Microsoft.Insights/components --api-version 2020-02-02
  $connection = @{}
  foreach ($part in $insights.properties.ConnectionString.Split(';')) { $pair = $part.Split('=', 2); if ($pair.Count -eq 2) { $connection[$pair[0]] = $pair[1] } }
  $costEvent = @{
    name = 'Microsoft.ApplicationInsights.Event'; time = [datetimeoffset]::UtcNow.ToString('o'); iKey = $connection.InstrumentationKey
    tags = @{ 'ai.cloud.role' = 'oldweb-mcp-operations'; 'ai.location.ip' = '0.0.0.0' }
    data = @{ baseType = 'EventData'; baseData = @{ ver = 2; name = 'mcp_cost'; properties = @{ currency = 'USD'; period = [datetimeoffset]::UtcNow.ToString('yyyy-MM'); resourceGroup = $Group }; measurements = @{ reportedCostUsd = $total } } }
  } | ConvertTo-Json -Depth 10 -Compress
  try { Invoke-RestMethod -Method Post -Uri ($connection.IngestionEndpoint.TrimEnd('/') + '/v2/track') -ContentType 'application/json' -Body $costEvent -TimeoutSec 10 | Out-Null } catch { Write-Warning 'Cost telemetry failed; billing result remains authoritative.' }
  if ($env:GITHUB_STEP_SUMMARY) { Add-Content $env:GITHUB_STEP_SUMMARY ('MCP reported month-to-date cost: ${0:N2} USD. Billing data may lag.' -f $total) }
  if ($total -ge 20) { Stop-Pilot }
} catch {
  # A failed cost query must not silently leave an unbounded experiment running.
  Stop-Pilot
  throw 'Cost guard could not verify spend; ingress paused for investigation.'
} finally { Remove-Item -LiteralPath $tempFile -ErrorAction SilentlyContinue }
