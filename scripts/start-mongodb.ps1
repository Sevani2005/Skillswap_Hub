# Start MongoDB locally (run in a separate PowerShell window — keep it open)
$dataDir = "C:\data\db"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

$mongod = Get-ChildItem "C:\Program Files\MongoDB\Server" -Recurse -Filter "mongod.exe" -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName

if (-not $mongod) {
    Write-Host "MongoDB is not installed yet." -ForegroundColor Red
    Write-Host "Install it first: winget install MongoDB.Server"
    Write-Host "Or download: https://www.mongodb.com/try/download/community"
    exit 1
}

Write-Host "Starting MongoDB at $dataDir ..." -ForegroundColor Cyan
Write-Host "Keep this window open while you use SkillSwap." -ForegroundColor Yellow
& $mongod --dbpath $dataDir
