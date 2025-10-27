# Production Build and Start Script

Write-Host "=== PVZZz Platform - Production Build ===" -ForegroundColor Cyan
Write-Host ""

# Проверка Docker
Write-Host "Проверка Docker..." -ForegroundColor Yellow
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker не запущен" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker запущен" -ForegroundColor Green

# Остановка существующих контейнеров
Write-Host ""
Write-Host "Остановка существующих контейнеров..." -ForegroundColor Yellow
docker-compose down

# Сборка образов
Write-Host ""
Write-Host "Сборка Docker образов (это может занять несколько минут)..." -ForegroundColor Yellow
docker-compose build --parallel

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Ошибка при сборке образов" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Образы собраны" -ForegroundColor Green

# Запуск сервисов
Write-Host ""
Write-Host "Запуск всех сервисов..." -ForegroundColor Yellow
docker-compose up -d

# Ожидание готовности
Write-Host ""
Write-Host "Ожидание готовности сервисов..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Проверка статуса
Write-Host ""
Write-Host "=== Статус сервисов ===" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "=== Сервисы доступны ===" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Cyan
Write-Host "  Global Admin:  http://localhost:3001"
Write-Host "  Tenant Admin:  http://localhost:3002"
Write-Host "  Web App:       http://localhost:3003"
Write-Host ""
Write-Host "Backend:" -ForegroundColor Cyan
Write-Host "  Config Service (GraphQL): http://localhost:4000/graphql"
Write-Host "  API Gateway:              http://localhost:8000"
Write-Host ""
Write-Host "Мониторинг:" -ForegroundColor Cyan
Write-Host "  Grafana:    http://localhost:3001"
Write-Host "  Prometheus: http://localhost:9090"
Write-Host "  Jaeger:     http://localhost:16686"
Write-Host ""
Write-Host "Для просмотра логов: docker-compose logs -f" -ForegroundColor Gray
Write-Host "Для остановки: docker-compose down" -ForegroundColor Gray
