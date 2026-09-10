<#
.SYNOPSIS
    Allocate the next work-stream ticket code for this repo on this machine.

.DESCRIPTION
    A ticket code is <CODE><M><N>: the repo's fixed 2-letter code, the machine
    letter, and an unpadded sequence starting at 1. Example: IDP5.

    The machine letter is what makes the code safe to allocate offline. Each
    machine allocates only inside its own letter, so two machines can open a
    ticket in the same repo at the same moment and never collide. No shared
    counter file and no network call is required.

    The script reads the repo code from tickets/TEMPLATE.md, scans every ticket
    under tickets/ for the highest sequence on this machine's letter, and prints
    the next code. It writes nothing.

.PARAMETER RepoPath
    A path inside the repo. Defaults to the current directory. The script walks
    up until it finds a tickets/ directory.

.PARAMETER Machine
    Override the machine letter. Use this only to repair a code by hand.

.EXAMPLE
    ./tickets/New-TicketId.ps1
    JVP19

.EXAMPLE
    ./tickets/New-TicketId.ps1 -RepoPath C:\Users\deric\repos\InfraDeploy
    IDP9

.NOTES
    Machine letters come from the computer name. Add a machine by writing its
    letter into ~/.ticket-machine, which overrides the name map. An unknown
    machine with no override file defaults to P.
#>
[CmdletBinding()]
param(
    [string] $RepoPath = (Get-Location).Path,
    [ValidatePattern('^[A-Z]$')]
    [string] $Machine
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Find-TicketsDir {
    param([string] $Start)

    $dir = Resolve-Path -LiteralPath $Start -ErrorAction Stop
    $dir = Get-Item -LiteralPath $dir
    if (-not $dir.PSIsContainer) { $dir = $dir.Parent }

    while ($null -ne $dir) {
        $candidate = Join-Path $dir.FullName 'tickets'
        if (Test-Path -LiteralPath $candidate -PathType Container) { return $candidate }
        $dir = $dir.Parent
    }
    throw "No tickets/ directory found at or above '$Start'."
}

function Get-RepoCode {
    param([string] $TicketsDir)

    $template = Join-Path $TicketsDir 'TEMPLATE.md'
    if (-not (Test-Path -LiteralPath $template -PathType Leaf)) {
        throw "No TEMPLATE.md in '$TicketsDir'. The repo code lives in its short_id comment."
    }

    $text = Get-Content -LiteralPath $template -Raw
    $match = [regex]::Match($text, 'repo code ([A-Z]{2})')
    if (-not $match.Success) {
        throw "TEMPLATE.md names no repo code. Add a short_id comment reading 'repo code XX' to '$template'."
    }
    return $match.Groups[1].Value
}

function Get-MachineLetter {
    param([string] $Override)

    if ($Override) { return $Override }

    $file = Join-Path $HOME '.ticket-machine'
    if (Test-Path -LiteralPath $file -PathType Leaf) {
        $letter = (Get-Content -LiteralPath $file -Raw).Trim().ToUpper()
        if ($letter -match '^[A-Z]$') { return $letter }
        throw "'$file' must hold exactly one letter A-Z. It holds '$letter'."
    }

    switch ($env:COMPUTERNAME) {
        'DESKTOP-PHKKTH2'  { return 'P' }
        'OBOAVSPDDDSH22'   { return 'V' }
        default            { return 'P' }
    }
}

$ticketsDir = Find-TicketsDir -Start $RepoPath
$code       = Get-RepoCode -TicketsDir $ticketsDir
$letter     = Get-MachineLetter -Override $Machine

$pattern = "^short_id:\s*$code$letter(\d+)\s*$"
$highest = 0

Get-ChildItem -LiteralPath $ticketsDir -Filter '*.md' -Recurse -File |
    Select-String -Pattern $pattern -CaseSensitive |
    ForEach-Object {
        $n = [int] $_.Matches[0].Groups[1].Value
        if ($n -gt $highest) { $highest = $n }
    }

Write-Output "$code$letter$($highest + 1)"
