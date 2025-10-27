# Stop all platform services (lite version)

Write-Host "Stopping all services..." -ForegroundColor Yellow
Write-Host ""

docker-compose -f docker-compose-lite.yml down

Write-Host ""
Write-Host "All services stopped!" -ForegroundColor Green
Write-Host ""
Write-Host "To remove all data use:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose-lite.yml down -v" -ForegroundColor White
