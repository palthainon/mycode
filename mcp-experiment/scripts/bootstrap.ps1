param([string]$Group = 'rg-oldweb-mcp-experiment', [string]$ImageTag = 'bootstrap-20261009')
$ErrorActionPreference = 'Stop'
function AzJson { $result = & az @args --only-show-errors -o json; if ($LASTEXITCODE) { throw 'Azure command failed' }; if ($result) { ($result -join "`n") | ConvertFrom-Json -Depth 100 } }
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Push-Location $root
try {
  $existing = & az containerapp list -g $Group --query "[?name=='oldweb-mcp'].name" -o tsv --only-show-errors
  if ($existing) { throw 'App already exists; use deploy.ps1 to preserve secrets and experiment dates' }
  $outputs = (AzJson deployment group show -g $Group -n mcp-foundation).properties.outputs
  $registry = $outputs.registryName.value
  $digest = & az acr repository show -n $registry --image "oldweb-mcp:$ImageTag" --query digest -o tsv --only-show-errors
  if ($LASTEXITCODE) { throw 'Image is not available' }
  $environment = AzJson containerapp env show --ids $outputs.environmentId.value
  $fqdn = "oldweb-mcp.$($environment.properties.defaultDomain)"
  $insights = AzJson resource show --ids $outputs.insightsId.value --api-version 2020-02-02
  $parameters = @{
    environmentId = @{ value = $outputs.environmentId.value }
    identityId = @{ value = $outputs.identityId.value }
    identityClientId = @{ value = $outputs.identityClientId.value }
    registryServer = @{ value = $outputs.registryServer.value }
    image = @{ value = "$($outputs.registryServer.value)/oldweb-mcp@$digest" }
    tableEndpoint = @{ value = $outputs.tableEndpoint.value }
    insightsConnection = @{ value = $insights.properties.ConnectionString }
    hmacSecret = @{ value = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)) }
    testSecret = @{ value = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)) }
    experimentStart = @{ value = '' }
    experimentEnd = @{ value = [datetimeoffset]::UtcNow.AddDays(37).ToString('o') }
    allowedHosts = @{ value = "mcp.oldweb.tech,$fqdn,$($fqdn.Replace("oldweb-mcp.", "oldweb-mcp---candidate."))" }
    revisionSuffix = @{ value = 'bootstrap' }
  }
  $folder = Join-Path $root 'mcp-experiment/.deploy'
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
  $file = Join-Path $folder 'app.parameters.local.json'
  try {
    @{ '$schema' = 'https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#'; contentVersion = '1.0.0.0'; parameters = $parameters } | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $file
    $result = AzJson deployment group create -g $Group -n mcp-app --template-file mcp-experiment/infra/app.bicep --parameters "@$file"
    $result.properties.outputs | ConvertTo-Json -Depth 8
    & (Join-Path $PSScriptRoot 'configure-telemetry.ps1') -Group $Group
  } finally { Remove-Item -LiteralPath $file -ErrorAction SilentlyContinue }
} finally { Pop-Location }
