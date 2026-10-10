param([Parameter(Mandatory)][string]$Revision, [string]$Group='rg-oldweb-mcp-experiment', [string]$App='oldweb-mcp')
$ErrorActionPreference='Stop'
function AzJson { $result=& az @args --only-show-errors -o json; if($LASTEXITCODE) { throw 'Azure bulk command failed' }; if($result) { ($result -join "`n") | ConvertFrom-Json -Depth 100 } }
if($Revision -notmatch '^bulk[a-f0-9]{12}$') { throw 'Invalid bulk image revision' }
& (Join-Path $PSScriptRoot 'operations.ps1') -Operation check -Group $Group -App $App
if($LASTEXITCODE) { throw 'Budget guard failed' }
$current=AzJson containerapp show -g $Group -n $App
if(-not $current.properties.configuration.ingress.external) { throw 'Pilot paused; bulk deployment refused' }
$end=($current.properties.template.containers[0].env | Where-Object name -eq 'EXPERIMENT_END').value
if(-not $end -or [datetimeoffset]::UtcNow -ge [datetimeoffset]::Parse($end)) { throw 'Pilot ended' }
$registry=(AzJson acr list -g $Group)[0]
$identity=AzJson identity show -g $Group -n oldwebmcp-runtime
$table=($current.properties.template.containers[0].env | Where-Object name -eq 'TABLE_ENDPOINT').value
$root=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Push-Location $root
try {
  $context=node mcp-experiment/scripts/stage-container.mjs
  if($LASTEXITCODE) { throw 'Container staging failed' }
  AzJson acr build --registry $registry.name --image "oldweb-bulk:$Revision" --file mcp-experiment/Dockerfile $context --no-logs | Out-Null
  $digest=& az acr repository show -n $registry.name --image "oldweb-bulk:$Revision" --query digest -o tsv --only-show-errors
  if($LASTEXITCODE) { throw 'Bulk image lookup failed' }
  $image="$($registry.loginServer)/oldweb-bulk@$digest"
  AzJson deployment group create -g $Group --name "bulk-$Revision" --template-file mcp-experiment/infra/bulk-job.bicep --parameters "environmentId=$($current.properties.managedEnvironmentId)" "identityId=$($identity.id)" "identityClientId=$($identity.clientId)" "registryServer=$($registry.loginServer)" "image=$image" "tableEndpoint=$table" "experimentEnd=$end" | Out-Null
  & (Join-Path $PSScriptRoot 'operations.ps1') -Operation check -Group $Group -App $App
  $current=AzJson containerapp show -g $Group -n $App
  if(-not $current.properties.configuration.ingress.external) { throw 'Pilot paused; execution refused' }
  $execution=AzJson containerapp job start -g $Group -n oldweb-mcp-bulk
  Write-Output "Synthetic bulk execution started: $($execution.name)"
} finally { Pop-Location }
