function Invoke-CostQueryWithRetry {
  param([Parameter(Mandatory)][scriptblock]$Request)
  $delays = @(5, 15, 30)
  for ($attempt = 0; $attempt -le $delays.Count; $attempt++) {
    try { return (& $Request) } catch {
      if ($attempt -eq $delays.Count) { throw 'Cost query failed after four attempts' }
      Write-Warning "Cost query unavailable; retrying in $($delays[$attempt]) seconds (attempt $($attempt + 2)/4)."
      Start-Sleep -Seconds $delays[$attempt]
    }
  }
}
