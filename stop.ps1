# Stop all platform services

Write-Host "Stopping all services..." -ForegroundColor Yellow
Write-Host ""

docker-compose down

Write-Host ""
Write-Host "All services stopped!" -ForegroundColor Green
Write-Host ""
Write-Host "To remove all data (including volumes) use:" -ForegroundColor Cyan
Write-Host "   docker-compose down -v" -ForegroundColor White
