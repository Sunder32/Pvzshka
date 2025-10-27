# Multi-Tenant SaaS Platform - Startup Script
# Launch entire project with one command

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Multi-Tenant SaaS Platform Launcher  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "[OK] Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker not found! Please install Docker Desktop" -ForegroundColor Red
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Host "[OK] Docker Compose installed: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker Compose not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Select launch mode:" -ForegroundColor Cyan
Write-Host "1. Start ALL (infrastructure + all services + frontend)" -ForegroundColor White
Write-Host "2. Infrastructure only (PostgreSQL, Redis, Kafka, etc.)" -ForegroundColor White
Write-Host "3. Infrastructure + working services" -ForegroundColor White
Write-Host "4. Frontend applications only" -ForegroundColor White
Write-Host "5. Stop all" -ForegroundColor White
Write-Host "6. View status" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter number (1-6)"

switch ($choice) {
    "1" {
        Write-Host "`nStarting ALL services..." -ForegroundColor Yellow
        Write-Host "This may take several minutes..." -ForegroundColor Yellow
        docker-compose up -d
        
        Write-Host "`nWaiting for services to start (30 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "  All services started!  " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "`nAvailable URLs:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "FRONTEND:" -ForegroundColor Yellow
        Write-Host "  Web App (PWA):        http://localhost:3003" -ForegroundColor White
        Write-Host "  Tenant Admin Panel:   http://localhost:3004" -ForegroundColor White
        Write-Host "  Global Admin Panel:   http://localhost:3005" -ForegroundColor White
        Write-Host ""
        Write-Host "API:" -ForegroundColor Yellow
        Write-Host "  Catalog Service:      http://localhost:3000/api/v1/products" -ForegroundColor White
        Write-Host "  Config Service:       http://localhost:4000/graphql" -ForegroundColor White
        Write-Host "  Kong API Gateway:     http://localhost:8000" -ForegroundColor White
        Write-Host ""
        Write-Host "MONITORING:" -ForegroundColor Yellow
        Write-Host "  Grafana:              http://localhost:3001 (admin/admin)" -ForegroundColor White
        Write-Host "  Prometheus:           http://localhost:9090" -ForegroundColor White
        Write-Host "  Jaeger:               http://localhost:16686" -ForegroundColor White
        Write-Host "  MinIO Console:        http://localhost:9001 (minioadmin/minioadmin)" -ForegroundColor White
        Write-Host ""
    }
    "2" {
        Write-Host "`nStarting infrastructure..." -ForegroundColor Yellow
        docker-compose up -d postgres redis elasticsearch kafka zookeeper kong jaeger prometheus grafana minio
        
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "  Infrastructure started!  " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "`nAvailable services:" -ForegroundColor Cyan
        Write-Host "  PostgreSQL:    localhost:5432" -ForegroundColor White
        Write-Host "  Redis:         localhost:6379" -ForegroundColor White
        Write-Host "  Elasticsearch: http://localhost:9200" -ForegroundColor White
        Write-Host "  Kafka:         localhost:9092" -ForegroundColor White
        Write-Host "  Kong:          http://localhost:8000" -ForegroundColor White
        Write-Host "  Grafana:       http://localhost:3001" -ForegroundColor White
        Write-Host "  Prometheus:    http://localhost:9090" -ForegroundColor White
        Write-Host "  Jaeger:        http://localhost:16686" -ForegroundColor White
        Write-Host "  MinIO:         http://localhost:9001" -ForegroundColor White
    }
    "3" {
        Write-Host "`nStarting infrastructure + services..." -ForegroundColor Yellow
        docker-compose up -d postgres redis elasticsearch kafka zookeeper kong jaeger prometheus grafana minio catalog-service web-app tenant-admin global-admin
        
        Write-Host "`nWaiting for startup (20 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 20
        
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "  Services started!  " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "`nAvailable URLs:" -ForegroundColor Cyan
        Write-Host "  Web App:         http://localhost:3003" -ForegroundColor White
        Write-Host "  Tenant Admin:    http://localhost:3004" -ForegroundColor White
        Write-Host "  Global Admin:    http://localhost:3005" -ForegroundColor White
        Write-Host "  Catalog API:     http://localhost:3000/api/v1/products" -ForegroundColor White
        Write-Host "  Grafana:         http://localhost:3001" -ForegroundColor White
    }
    "4" {
        Write-Host "`nStarting frontend applications..." -ForegroundColor Yellow
        docker-compose up -d web-app tenant-admin global-admin
        
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "  Frontend started!  " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "`nAvailable URLs:" -ForegroundColor Cyan
        Write-Host "  Web App (PWA):        http://localhost:3003" -ForegroundColor White
        Write-Host "  Tenant Admin Panel:   http://localhost:3004" -ForegroundColor White
        Write-Host "  Global Admin Panel:   http://localhost:3005" -ForegroundColor White
    }
    "5" {
        Write-Host "`nStopping all services..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "`n[OK] All services stopped" -ForegroundColor Green
    }
    "6" {
        Write-Host "`nAll services status:" -ForegroundColor Cyan
        docker-compose ps
    }
    default {
        Write-Host "`nInvalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "To view logs use:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f <service-name>" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
