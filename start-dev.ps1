# Quick Start Script для Development
# Запускает только необходимую инфраструктуру

Write-Host "=== PVZZz Platform - Quick Start (Development) ===" -ForegroundColor Cyan
Write-Host ""

# Проверка Docker
Write-Host "Проверка Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker не запущен. Запустите Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker запущен" -ForegroundColor Green

# Запуск инфраструктуры
Write-Host ""
Write-Host "Запуск инфраструктуры (PostgreSQL, Redis)..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Ожидание готовности PostgreSQL
Write-Host ""
Write-Host "Ожидание готовности PostgreSQL..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    $attempt++
    Start-Sleep -Seconds 2
    
    $result = docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres -d marketplace 2>&1
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
    } else {
        Write-Host "  Попытка $attempt/$maxAttempts..." -ForegroundColor Gray
    }
}

if ($ready) {
    Write-Host "✓ PostgreSQL готов" -ForegroundColor Green
} else {
    Write-Host "ERROR: PostgreSQL не запустился за отведенное время" -ForegroundColor Red
    exit 1
}

# Проверка Redis
Write-Host ""
Write-Host "Проверка Redis..." -ForegroundColor Yellow
$redisCheck = docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Redis готов" -ForegroundColor Green
} else {
    Write-Host "WARNING: Redis не отвечает" -ForegroundColor Yellow
}

# Информация о подключении
Write-Host ""
Write-Host "=== Сервисы запущены ===" -ForegroundColor Green
Write-Host ""
Write-Host "PostgreSQL:" -ForegroundColor Cyan
Write-Host "  Host: localhost:5432"
Write-Host "  Database: marketplace"
Write-Host "  User: postgres"
Write-Host "  Password: postgres"
Write-Host ""
Write-Host "Redis:" -ForegroundColor Cyan
Write-Host "  Host: localhost:6379"
Write-Host ""
Write-Host "pgAdmin: http://localhost:5050" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com"
Write-Host "  Password: admin"
Write-Host ""

# Предложение запустить сервисы
Write-Host "=== Следующие шаги ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Запустить Config Service:"
Write-Host "   cd Backend\config-service"
Write-Host "   npm install"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "2. Запустить Frontend (в отдельных терминалах):"
Write-Host "   cd Frontend\global-admin && npm install && npm start"
Write-Host "   cd Frontend\tenant-admin && npm install && npm run dev"
Write-Host "   cd Frontend\web-app && npm install && npm run dev"
Write-Host ""
Write-Host "Для остановки: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray
