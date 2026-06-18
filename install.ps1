# EMERP OpenCLI Plugin 一鍵安裝
# 執行方式：irm https://raw.githubusercontent.com/dac-tech-team-tw/emerp-opencli-plugin/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

function Write-Step($n, $msg) { Write-Host "`n[$n/4] $msg" -ForegroundColor Yellow }
function Write-OK($msg)       { Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Info($msg)     { Write-Host "      $msg" -ForegroundColor Gray }

Write-Host ""
Write-Host "  EMERP OpenCLI Plugin 安裝程式" -ForegroundColor Cyan
Write-Host "  ==============================" -ForegroundColor Cyan

# ── 1. Node.js ──────────────────────────────────────────────────────────────
Write-Step 1 "確認 Node.js"
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-OK "Node.js $(node -v) 已安裝"
} else {
    Write-Info "未偵測到 Node.js，正在用 winget 安裝 LTS 版本..."
    winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    # 重新載入 PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("PATH","User")
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "`n  Node.js 安裝後需要重新開啟終端機，請關閉後再執行一次此腳本。" -ForegroundColor Red
        exit 1
    }
    Write-OK "Node.js $(node -v) 安裝完成"
}

# ── 2. OpenCLI ──────────────────────────────────────────────────────────────
Write-Step 2 "確認 OpenCLI"
if (Get-Command opencli -ErrorAction SilentlyContinue) {
    Write-OK "OpenCLI 已安裝"
} else {
    Write-Info "正在安裝 OpenCLI..."
    npm install -g @jackwener/opencli
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("PATH","User")
    Write-OK "OpenCLI 安裝完成"
}

# ── 3. Plugin ───────────────────────────────────────────────────────────────
Write-Step 3 "安裝 EMERP plugin"

if (Get-Command git -ErrorAction SilentlyContinue) {
    # 有 git：直接從 GitHub 安裝
    Write-Info "使用 git clone 安裝..."
    opencli plugin install github:dac-tech-team-tw/emerp-opencli-plugin
} else {
    # 沒有 git：下載 zip 後用本地路徑安裝
    Write-Info "未偵測到 git，改用 zip 下載方式..."
    $tmpZip = "$env:TEMP\emerp-plugin.zip"
    $tmpDir = "$env:TEMP\emerp-plugin-extract"

    if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir }

    Write-Info "下載中..."
    Invoke-WebRequest `
        -Uri "https://github.com/dac-tech-team-tw/emerp-opencli-plugin/archive/refs/heads/main.zip" `
        -OutFile $tmpZip

    Write-Info "解壓縮..."
    Expand-Archive -Path $tmpZip -DestinationPath $tmpDir -Force

    opencli plugin install "file://$tmpDir\emerp-opencli-plugin-main"
}

Write-OK "Plugin 安裝完成"

# ── 4. 驗證 ─────────────────────────────────────────────────────────────────
Write-Step 4 "驗證安裝"
opencli emerp --help

Write-Host ""
Write-Host "  ✅ 安裝完成！" -ForegroundColor Green
Write-Host ""
Write-Host "  下一步：" -ForegroundColor Cyan
Write-Host "  1. 開啟 Chrome，登入 EMERP：http://10.0.250.60/eFormFlow/" -ForegroundColor White
Write-Host "  2. 確認右上角 OpenCLI 擴充功能圖示顯示「已連線」" -ForegroundColor White
Write-Host "  3. 執行 opencli emerp create-petition '主旨' '說明'" -ForegroundColor White
Write-Host ""
