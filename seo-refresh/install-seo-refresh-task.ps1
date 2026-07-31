[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $ServiceRoot,
  [Parameter(Mandatory = $true)] [string] $ProductionWebRoot,
  [string] $NodePath = "C:\Program Files\nodejs\node.exe",
  [string] $ApiBaseUrl = "https://api.volt.az/api/",
  [int] $ExpectedProductCount = 346,
  [string] $TaskName = "VoltDailySeoRefresh"
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path $NodePath)) { throw "Node.js was not found at $NodePath" }
if (-not (Test-Path (Join-Path $ServiceRoot "refresh.mjs"))) { throw "refresh.mjs was not found in $ServiceRoot" }
if (-not (Test-Path $ProductionWebRoot)) { throw "The supplied production web root does not exist: $ProductionWebRoot" }

# The task account must have Modify only on these three files in the production
# IIS web root. No FTP credential is needed or accepted by this task.
$argument = "-NoProfile -ExecutionPolicy Bypass -Command `"`$env:SEO_API_BASE_URL='$ApiBaseUrl'; `$env:SEO_OUTPUT_DIR='$ProductionWebRoot'; `$env:SEO_EXPECTED_PRODUCT_COUNT='$ExpectedProductCount'; & '$NodePath' '$ServiceRoot\refresh.mjs'`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $argument -WorkingDirectory $ServiceRoot
$trigger = New-ScheduledTaskTrigger -Daily -At 2:15AM
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 5) -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Refresh Volt.az public sitemap.xml, llms.txt, and robots.txt from the production public API." -Force | Out-Null
Write-Host "Installed $TaskName. First run a dry run manually with SEO_DRY_RUN=true before enabling production writes."
