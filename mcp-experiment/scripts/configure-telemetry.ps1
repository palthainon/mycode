param([string]$Group = 'rg-oldweb-mcp-experiment')
$ErrorActionPreference = 'Stop'
$insightsId = & az resource show -g $Group -n oldwebmcp-insights --resource-type Microsoft.Insights/components --query id -o tsv --only-show-errors
if ($LASTEXITCODE) { throw 'Insights resource unavailable' }
$tempFile = Join-Path ([IO.Path]::GetTempPath()) ('mcp-telemetry-' + [guid]::NewGuid() + '.json')
try {
  @{ CurrentBillingFeatures = @('Basic'); DataVolumeCap = @{ Cap = 0.05; StopSendNotificationWhenHitCap = $false; StopSendNotificationWhenHitThreshold = $false; WarningThreshold = 80 } } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $tempFile
  & az rest --method put --url "https://management.azure.com$insightsId/currentbillingfeatures?api-version=2015-05-01" --body "@$tempFile" --only-show-errors -o none
  if ($LASTEXITCODE) { throw 'Could not set Application Insights ingestion cap' }
  # Application Insights tables default to 90 days even when the workspace uses 60.
  & az monitor log-analytics workspace table update -g $Group --workspace-name oldwebmcp-logs --name AppEvents --retention-time 60 --total-retention-time 60 --only-show-errors -o none
  if ($LASTEXITCODE) { throw 'Could not set event retention to 60 days' }
  $workbookId = & az resource list -g $Group --resource-type Microsoft.Insights/workbooks --query '[0].id' -o tsv --only-show-errors
  $workbook = Get-Content (Join-Path $PSScriptRoot '../infra/workbook.json') -Raw
  @{ location = 'eastus2'; kind = 'shared'; properties = @{ displayName = 'OldWeb MCP experiment'; sourceId = $insightsId; category = 'workbook'; serializedData = $workbook } } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $tempFile
  & az rest --method put --url "https://management.azure.com${workbookId}?api-version=2023-06-01" --body "@$tempFile" --only-show-errors -o none
  if ($LASTEXITCODE) { throw 'Could not update Workbook' }
  Write-Output 'Telemetry cap and Workbook configured.'
} finally { Remove-Item -LiteralPath $tempFile -ErrorAction SilentlyContinue }
