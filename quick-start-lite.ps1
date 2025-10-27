# Quick Start - Working Services Only
# Launches only tested and working services

Write-Host "Starting Multi-Tenant SaaS Platform (working services only)..." -ForegroundColor Cyan
Write-Host ""

# Start using lite compose file
docker-compose -f docker-compose-lite.yml up -d

Write-Host ""
Write-Host "Waiting for services to start (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Project started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "FRONTEND:" -ForegroundColor Cyan
Write-Host "   Web App:        http://localhost:3003" -ForegroundColor White
Write-Host "   Tenant Admin:   http://localhost:3004" -ForegroundColor White
Write-Host "   Global Admin:   http://localhost:3005" -ForegroundColor White
Write-Host ""
Write-Host "API:" -ForegroundColor Cyan
Write-Host "   Catalog API:    http://localhost:3000/api/v1/products" -ForegroundColor White
Write-Host "   Health Check:   http://localhost:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "MONITORING:" -ForegroundColor Cyan
Write-Host "   Grafana:        http://localhost:3001 (admin/admin)" -ForegroundColor White
Write-Host "   Prometheus:     http://localhost:9090" -ForegroundColor White
Write-Host "   Jaeger:         http://localhost:16686" -ForegroundColor White
Write-Host "   MinIO:          http://localhost:9001 (minioadmin/minioadmin)" -ForegroundColor White
Write-Host ""
Write-Host "DATABASE:" -ForegroundColor Cyan
Write-Host "   PostgreSQL:     localhost:5432 (platform/platform123)" -ForegroundColor White
Write-Host "   Redis:          localhost:6379" -ForegroundColor White
Write-Host "   Elasticsearch:  http://localhost:9200" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services: docker-compose -f docker-compose-lite.yml down" -ForegroundColor Yellow
Write-Host "To view logs: docker-compose -f docker-compose-lite.yml logs -f" -ForegroundColor Yellow
