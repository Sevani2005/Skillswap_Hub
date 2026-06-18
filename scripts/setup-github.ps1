# Connect SkillSwap to GitHub and push
# Usage: .\scripts\setup-github.ps1 -GitHubUsername "yourusername"

param(
    [Parameter(Mandatory = $true)]
    [string]$GitHubUsername,

    [string]$RepoName = "skillswap"
)

$remoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"

Write-Host "Setting up GitHub remote: $remoteUrl" -ForegroundColor Cyan

# Create repo via gh CLI if available
if (Get-Command gh -ErrorAction SilentlyContinue) {
    gh repo create $RepoName --public --source=. --remote=origin --push 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Repository created and pushed via GitHub CLI!" -ForegroundColor Green
        exit 0
    }
}

git remote remove origin 2>$null
git remote add origin $remoteUrl

Write-Host @"

Next steps:
1. Create repo at https://github.com/new named '$RepoName'
2. Run: git push -u origin main

Or install GitHub CLI: winget install GitHub.cli
Then re-run this script.

"@ -ForegroundColor Yellow
