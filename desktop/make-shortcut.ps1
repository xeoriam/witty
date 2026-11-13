<#
.SYNOPSIS
    (Re)create the "Witty" desktop shortcut for the portable build.

.DESCRIPTION
    The shortcut points straight at `win-unpacked\Witty.exe` and passes
    `--data-dir <path>`, so the app keeps its data next to the program without a
    `.cmd` wrapper (the wrapper used to flash a console window) while still
    showing the kitten icon embedded in the executable.

    An existing shortcut with the same name is deleted first on purpose: the
    old file was created before `Witty.exe` existed, so Explorer had cached the
    generic "white page" icon for it. A brand-new file forces a fresh icon
    lookup, and the icon cache is refreshed at the end as well.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File desktop\make-shortcut.ps1
#>
[CmdletBinding()]
param(
    [string]$Exe,
    [string]$DataDir,
    [string]$Name = 'Witty',
    [string]$Desktop = [Environment]::GetFolderPath('Desktop'),
    [switch]$SkipIconCacheRefresh
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir

if ([string]::IsNullOrWhiteSpace($Exe)) {
    $Exe = Join-Path $repoRoot 'release\win-unpacked\Witty.exe'
}
if ([string]::IsNullOrWhiteSpace($DataDir)) {
    $DataDir = Join-Path $repoRoot 'release\data'
}

$Exe = [System.IO.Path]::GetFullPath($Exe)
$DataDir = [System.IO.Path]::GetFullPath($DataDir)

if (-not (Test-Path -LiteralPath $Exe -PathType Leaf)) {
    throw "找不到 Witty.exe：$Exe（请先完成打包）"
}
if (-not (Test-Path -LiteralPath $Desktop -PathType Container)) {
    throw "找不到桌面目录：$Desktop"
}

# The data folder is created by the app itself, but creating it here keeps the
# shortcut honest: the path it stores already exists.
if (-not (Test-Path -LiteralPath $DataDir -PathType Container)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

$lnkPath = Join-Path $Desktop ($Name + '.lnk')
if (Test-Path -LiteralPath $lnkPath) {
    Remove-Item -LiteralPath $lnkPath -Force
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($lnkPath)
$shortcut.TargetPath = $Exe
$shortcut.Arguments = '--no-sandbox --data-dir "' + $DataDir + '"'
$shortcut.WorkingDirectory = Split-Path -Parent $Exe
$shortcut.IconLocation = $Exe + ',0'
$shortcut.Description = 'Witty desktop app'
$shortcut.WindowStyle = 1
$shortcut.Save()

Write-Host "已创建快捷方式：$lnkPath"
Write-Host "  目标：$Exe"
Write-Host "  参数：--data-dir `"$DataDir`""
Write-Host "  图标：$Exe,0"

if (-not $SkipIconCacheRefresh) {
    # Rebuild the per-user icon cache so Explorer drops the cached "white page"
    # entry instead of showing it until the next reboot.
    $ie4uinit = Join-Path $env:SystemRoot 'System32\ie4uinit.exe'
    if (Test-Path -LiteralPath $ie4uinit) {
        try {
            Start-Process -FilePath $ie4uinit -ArgumentList '-show' -WindowStyle Hidden -Wait
            Write-Host '  已刷新图标缓存（ie4uinit -show）'
        } catch {
            Write-Warning "刷新图标缓存失败：$($_.Exception.Message)"
        }
    }

    # Tell Explorer that shell associations changed, so the desktop repaints.
    Add-Type -Namespace Dsh -Name ShellNotify -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("shell32.dll")]
public static extern void SHChangeNotify(int eventId, uint flags, System.IntPtr item1, System.IntPtr item2);
'@ -ErrorAction SilentlyContinue
    try {
        [Dsh.ShellNotify]::SHChangeNotify(0x08000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero)
    } catch {
        Write-Warning "通知资源管理器刷新失败：$($_.Exception.Message)"
    }
}

Write-Host '完成。若桌面仍显示旧图标，请按 F5 或重启资源管理器。'
