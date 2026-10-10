$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'wait-bulk.ps1')
function Start-Sleep { param($Seconds) $script:sleeps++ }
$script:checks=0;$script:sleeps=0
Wait-BulkExecution { $script:checks++; if($script:checks -eq 1) { 'Running' } else { 'Succeeded' } } | Out-Null
if($script:checks -ne 2 -or $script:sleeps -ne 1) { throw 'Completion poll failed' }
foreach($terminal in @('Failed','Stopped','Canceled')) {
  $failed=$false;try { Wait-BulkExecution { $terminal } | Out-Null } catch { $failed=$true }
  if(-not $failed) { throw 'Terminal state incorrectly passed' }
}
$failed=$false;try { Wait-BulkExecution { throw 'PRIVATE_ERROR' } | Out-Null } catch { $failed=$true; if($_.Exception.Message -match 'PRIVATE_ERROR') { throw 'Query error leaked' } }
if(-not $failed) { throw 'Unverifiable state incorrectly passed' }
$failed=$false;try { Wait-BulkExecution { 'Running' } -TimeoutSeconds 0 | Out-Null } catch { $failed=$true }
if(-not $failed) { throw 'Timeout incorrectly passed' }
Write-Output 'Passed: completion, terminal failures, sanitized query errors and timeout.'
