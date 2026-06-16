# Start SkillSwap on localhost (run from project root)
# With USE_MEMORY_DB=true in server/.env, you do NOT need MongoDB installed.

Write-Host "SkillSwap local dev" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173"
Write-Host "  API:      http://localhost:5001"
Write-Host ""
Write-Host "Open TWO terminals:"
Write-Host "  cd server; npm run dev"
Write-Host "  cd client; npm run dev"
Write-Host ""
Write-Host "First time (after server shows MongoDB connected):"
Write-Host "  npm run seed"
Write-Host ""
Write-Host "Demo login: alex@skillswap.demo / demo1234"
