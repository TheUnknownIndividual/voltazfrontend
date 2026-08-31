param(
    [Parameter(Mandatory = $true)]
    [string]$PackagePath,

    [Parameter(Mandatory = $true)]
    [string]$TargetPath
)

$ErrorActionPreference = "Stop"

$AllowedTargets = @(
    "C:\inetpub\wwwroot\testvoltaz",
    "C:\inetpub\wwwroot\voltaz"
)

$ResolvedTarget = [System.IO.Path]::GetFullPath($TargetPath).TrimEnd('\')
if ($AllowedTargets -notcontains $ResolvedTarget) {
    throw "Refusing to deploy to an unexpected target: $ResolvedTarget"
}

if (-not (Test-Path -LiteralPath $PackagePath -PathType Leaf)) {
    throw "Frontend package was not found: $PackagePath"
}

if (-not (Test-Path -LiteralPath $ResolvedTarget -PathType Container)) {
    throw "Frontend target was not found: $ResolvedTarget"
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$TargetName = Split-Path -Leaf $ResolvedTarget
$WorkRoot = Join-Path $env:USERPROFILE "frontend-deployments"
$StagePath = Join-Path $WorkRoot "$TargetName-stage-$Timestamp"
$BackupPath = Join-Path $WorkRoot "$TargetName-backup-$Timestamp"

New-Item -ItemType Directory -Path $WorkRoot -Force | Out-Null
New-Item -ItemType Directory -Path $StagePath -Force | Out-Null

try {
    Write-Host "Extracting package..." -ForegroundColor Cyan
    Expand-Archive -LiteralPath $PackagePath -DestinationPath $StagePath -Force

    $RequiredPaths = @(
        (Join-Path $StagePath "index.html"),
        (Join-Path $StagePath "web.config"),
        (Join-Path $StagePath "assets")
    )

    foreach ($RequiredPath in $RequiredPaths) {
        if (-not (Test-Path -LiteralPath $RequiredPath)) {
            throw "Package validation failed; missing: $RequiredPath"
        }
    }

    if (Select-String -LiteralPath (Join-Path $StagePath "web.config") -Pattern "__PRERENDER_DIR__" -Quiet) {
        throw "Package contains an unresolved prerender placeholder."
    }

    Write-Host "Creating rollback copy..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    & robocopy.exe $ResolvedTarget $BackupPath /E /COPY:DAT /DCOPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS
    $BackupResult = $LASTEXITCODE
    if ($BackupResult -ge 8) {
        throw "Rollback copy failed with robocopy exit code $BackupResult."
    }

    Write-Host "Copying frontend files..." -ForegroundColor Cyan
    & robocopy.exe $StagePath $ResolvedTarget /E /COPY:DAT /DCOPY:DAT /R:2 /W:1 /XF index.html /NFL /NDL /NJH /NJS
    $DeployResult = $LASTEXITCODE
    if ($DeployResult -ge 8) {
        throw "Frontend copy failed with robocopy exit code $DeployResult."
    }

    # Replace the entry document last so it never references assets that have
    # not reached the server yet.
    Copy-Item -LiteralPath (Join-Path $StagePath "index.html") -Destination (Join-Path $ResolvedTarget "index.html") -Force

    Write-Host "Frontend deployment completed." -ForegroundColor Green
    Write-Host "Target:   $ResolvedTarget"
    Write-Host "Rollback: $BackupPath"

    Remove-Item -LiteralPath $StagePath -Recurse -Force
    Remove-Item -LiteralPath $PackagePath -Force
}
catch {
    Write-Host "Deployment failed. The existing site was not intentionally removed." -ForegroundColor Red
    Write-Host "Package retained at: $PackagePath" -ForegroundColor Yellow
    Write-Host "Stage retained at:   $StagePath" -ForegroundColor Yellow
    if (Test-Path -LiteralPath $BackupPath) {
        Write-Host "Rollback retained at: $BackupPath" -ForegroundColor Yellow
    }
    throw
}
