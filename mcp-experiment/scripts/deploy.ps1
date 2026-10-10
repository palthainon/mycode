param([Parameter(Mandatory)][string]$Revision, [string]$Group = 'rg-oldweb-mcp-experiment', [string]$App = 'oldweb-mcp', [switch]$UseExistingImage)
$ErrorActionPreference = 'Stop'
function AzJson { $result = & az @args --only-show-errors -o json; if ($LASTEXITCODE) { throw 'Azure command failed' }; if ($result) { ($result -join "`n") | ConvertFrom-Json -Depth 100 } }
if ($Revision -notmatch '^r[a-z0-9-]{1,40}$') { throw 'Invalid immutable revision tag' }
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Push-Location $root
try {
  $current = AzJson containerapp show -g $Group -n $App
  & (Join-Path $PSScriptRoot 'configure-telemetry.ps1') -Group $Group
  if (-not $current.properties.configuration.ingress) { throw 'Ingress is disabled. Review costs and experiment status before explicitly resuming.' }
  $previous = @($current.properties.configuration.ingress.traffic | Where-Object { $_.weight -gt 0 })
  if ($previous.Count -ne 1) { throw 'Expected one serving revision' }
  $previousRevision = $previous[0].revisionName
  if (-not $previousRevision) { $previousRevision = $current.properties.latestReadyRevisionName }
  $registry = (AzJson acr list -g $Group)[0]
  $imageTag = "oldweb-mcp:$Revision"
  if (-not $UseExistingImage) {
    $context = node mcp-experiment/scripts/stage-container.mjs
    if ($LASTEXITCODE) { throw 'Container context staging failed' }
    AzJson acr build --registry $registry.name --image $imageTag --file mcp-experiment/Dockerfile $context --no-logs | Out-Null
  }
  $digest = & az acr repository show -n $registry.name --image $imageTag --query digest -o tsv --only-show-errors
  if ($LASTEXITCODE) { throw 'Image digest lookup failed' }
  $image = "$($registry.loginServer)/oldweb-mcp@$digest"
  $fqdn = $current.properties.configuration.ingress.fqdn
  $candidateHost = $fqdn.Replace("$App.", "$App---candidate.")
  AzJson containerapp ingress traffic set -g $Group -n $App --revision-weight "$previousRevision=100" | Out-Null
  AzJson containerapp update -g $Group -n $App --image $image --revision-suffix $Revision --set-env-vars "ALLOWED_HOSTS=mcp.oldweb.tech,$fqdn,$candidateHost" | Out-Null
  $candidate = "$App--$Revision"
  AzJson containerapp revision label add -g $Group -n $App --revision $candidate --label candidate --yes | Out-Null
  $secrets = AzJson containerapp secret list -g $Group -n $App --show-values
  $env:TEST_SECRET = ($secrets | Where-Object name -eq 'test').value
  $env:MCP_BASE_URL = "https://$candidateHost"
  Push-Location mcp-experiment
  try {
    node scripts/wait-ready.mjs
    if ($LASTEXITCODE) { throw 'Candidate readiness failed; previous revision still serves production' }
    node scripts/smoke-all.mjs
    if ($LASTEXITCODE) { throw 'Candidate smoke test failed; previous revision still serves production' }
  } finally { Pop-Location; Remove-Item Env:TEST_SECRET -ErrorAction SilentlyContinue }
  AzJson containerapp ingress traffic set -g $Group -n $App --revision-weight "$candidate=100" | Out-Null
  AzJson tag update --resource-id $current.id --operation Merge --tags "previousRevision=$previousRevision" "currentRevision=$candidate" | Out-Null
  $revisions = AzJson containerapp revision list -g $Group -n $App
  foreach ($entry in $revisions) { if ($entry.properties.active -and $entry.name -ne $candidate) { AzJson containerapp revision deactivate -g $Group -n $App --revision $entry.name | Out-Null } }
  Write-Output "Serving $candidate; rollback target $previousRevision"
} finally { Pop-Location }
