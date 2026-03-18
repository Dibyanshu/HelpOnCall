[CmdletBinding()]
param(
    [switch]$NoInstall
)

$ErrorActionPreference = 'Stop'

function Get-BashPath {
    $bash = Get-Command bash -ErrorAction SilentlyContinue
    if ($bash) {
        return $bash.Source
    }

    $gitBash = Join-Path ${env:ProgramFiles} 'Git\bin\bash.exe'
    if (Test-Path $gitBash) {
        return $gitBash
    }

    throw 'Bash executable not found. Install Git Bash or add bash to PATH.'
}

$repoRoot = Split-Path -Parent $PSCommandPath
$apiPath = Join-Path $repoRoot 'Apps/api'
$webPath = Join-Path $repoRoot 'Apps/web'

if (-not (Test-Path $apiPath)) {
    throw "API path not found: $apiPath"
}

if (-not (Test-Path $webPath)) {
    throw "Web path not found: $webPath"
}

$bashExe = Get-BashPath

$apiCmd = "cd '$($apiPath -replace '\\','/')' && "
$webCmd = "cd '$($webPath -replace '\\','/')' && "

if (-not $NoInstall) {
    $apiCmd += 'npm install && '
    $webCmd += 'npm install && '
}

$apiCmd += 'npm run dev'
$webCmd += 'npm run dev'

Write-Host "Using bash: $bashExe"
Write-Host 'Starting API dev server in Bash...'
Start-Process -FilePath $bashExe -ArgumentList '-lc', $apiCmd | Out-Null

Write-Host 'Starting web dev server in Bash...'
Start-Process -FilePath $bashExe -ArgumentList '-lc', $webCmd | Out-Null

Write-Host ''
Write-Host 'Both dev servers were launched in separate Bash terminals.'
Write-Host 'Use -NoInstall to skip npm install on startup.'
