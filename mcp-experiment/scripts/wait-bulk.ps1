function Wait-BulkExecution {
  param([Parameter(Mandatory)][scriptblock]$Query, [ValidateRange(0,600)][int]$TimeoutSeconds=300)
  $deadline=[datetimeoffset]::UtcNow.AddSeconds($TimeoutSeconds)
  while([datetimeoffset]::UtcNow -lt $deadline) {
    try { $state=& $Query } catch { throw 'Bulk execution state could not be verified' }
    if($state -eq 'Succeeded') { Write-Output 'Synthetic bulk execution succeeded'; return }
    if($state -in @('Failed','Stopped','Canceled')) { throw 'Synthetic bulk execution did not succeed' }
    Start-Sleep -Seconds 10
  }
  throw 'Bulk execution verification timed out; inspect the existing execution, do not retry blindly'
}
