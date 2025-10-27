# Quick Start - Multi-Tenant SaaS Platform
# Автоматически запускает инфраструктуру и все сервисы

param(
    [switch]$Production,
    [switch]$DevOnly
)

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     PVZZz - Multi-Tenant Marketplace Platform               ║" -ForegroundColor Cyan
Write-Host "║     Quick Start Script                                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Функция для проверки наличия команды
function Test-Command {
    param($CommandName)
    $null -ne (Get-Command $CommandName -ErrorAction SilentlyContinue)
}

# Проверка Docker
Write-Host "🔍 Проверка требований..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Command docker)) {
    Write-Host "❌ ERROR: Docker не найден!" -ForegroundColor Red
    Write-Host "   Установите Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Docker не запущен!" -ForegroundColor Red
    Write-Host "   Запустите Docker Desktop и попробуйте снова" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Docker установлен и запущен" -ForegroundColor Green

# Проверка Node.js для dev режима
if (-not $Production) {
    if (Test-Command node) {
        $nodeVersion = node -v
        Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARNING: Node.js не найден (нужен для dev режима)" -ForegroundColor Yellow
        Write-Host "   Скачать: https://nodejs.org/" -ForegroundColor Gray
    }
}

Write-Host ""

# Определение режима запуска
if ($Production) {
    Write-Host "📦 Режим: PRODUCTION (все в Docker)" -ForegroundColor Magenta
    Write-Host ""
    
    # Остановка существующих контейнеров
    Write-Host "🛑 Остановка существующих контейнеров..." -ForegroundColor Yellow
    docker-compose down 2>&1 | Out-Null
    
    # Сборка образов
    Write-Host "🔨 Сборка Docker образов (может занять 5-10 минут)..." -ForegroundColor Yellow
    docker-compose build --parallel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Ошибка при сборке образов" -ForegroundColor Red
        exit 1
    }
    
    # Запуск всех сервисов
    Write-Host "🚀 Запуск всех сервисов..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host ""
    Write-Host "⏳ Ожидание готовности сервисов (30 секунд)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
} elseif ($DevOnly) {
    Write-Host "🔧 Режим: DEVELOPMENT ONLY (только инфраструктура)" -ForegroundColor Magenta
    Write-Host ""
    
    # Запуск только инфраструктуры
    Write-Host "🚀 Запуск PostgreSQL и Redis..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d postgres redis
    
    Write-Host ""
    Write-Host "⏳ Ожидание готовности PostgreSQL..." -ForegroundColor Yellow
    
    $maxAttempts = 30
    $attempt = 0
    $ready = $false
    
    while (-not $ready -and $attempt -lt $maxAttempts) {
        $attempt++
        Start-Sleep -Seconds 2
        
        docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres -d marketplace 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
        } else {
            Write-Host "  Попытка $attempt/$maxAttempts..." -ForegroundColor Gray
        }
    }
    
    if (-not $ready) {
        Write-Host "❌ ERROR: PostgreSQL не запустился" -ForegroundColor Red
        exit 1
    }
    
} else {
    Write-Host "🔧 Режим: HYBRID (инфраструктура в Docker, сервисы локально)" -ForegroundColor Magenta
    Write-Host ""
    
    # Запуск инфраструктуры
    Write-Host "🚀 Запуск инфраструктуры..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d postgres redis
    
    Write-Host ""
    Write-Host "⏳ Ожидание готовности PostgreSQL..." -ForegroundColor Yellow
    
    $maxAttempts = 30
    $attempt = 0
    $ready = $false
    
    while (-not $ready -and $attempt -lt $maxAttempts) {
        $attempt++
        Start-Sleep -Seconds 2
        
        docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres -d marketplace 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
        }
    }
    
    if (-not $ready) {
        Write-Host "❌ ERROR: PostgreSQL не запустился" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ PostgreSQL готов" -ForegroundColor Green
    
    # Проверка и установка зависимостей
    Write-Host ""
    Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
    
    # Config Service
    Write-Host "  - Config Service..." -ForegroundColor Gray
    if (Test-Path "Backend\config-service\package.json") {
        Push-Location "Backend\config-service"
        if (-not (Test-Path "node_modules")) {
            npm install --silent 2>&1 | Out-Null
        }
        Pop-Location
        Write-Host "    ✓ Config Service готов" -ForegroundColor Green
    }
    
    # Global Admin
    Write-Host "  - Global Admin..." -ForegroundColor Gray
    if (Test-Path "Frontend\global-admin\package.json") {
        Push-Location "Frontend\global-admin"
        if (-not (Test-Path "node_modules")) {
            npm install --silent 2>&1 | Out-Null
        }
        Pop-Location
        Write-Host "    ✓ Global Admin готов" -ForegroundColor Green
    }
    
    # Tenant Admin
    Write-Host "  - Tenant Admin..." -ForegroundColor Gray
    if (Test-Path "Frontend\tenant-admin\package.json") {
        Push-Location "Frontend\tenant-admin"
        if (-not (Test-Path "node_modules")) {
            npm install --silent 2>&1 | Out-Null
        }
        Pop-Location
        Write-Host "    ✓ Tenant Admin готов" -ForegroundColor Green
    }
    
    # Web App
    Write-Host "  - Web App..." -ForegroundColor Gray
    if (Test-Path "Frontend\web-app\package.json") {
        Push-Location "Frontend\web-app"
        if (-not (Test-Path "node_modules")) {
            npm install --silent 2>&1 | Out-Null
        }
        Pop-Location
        Write-Host "    ✓ Web App готов" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🚀 Запуск сервисов..." -ForegroundColor Yellow
    
    # Запуск Config Service
    Write-Host "  - Запуск Config Service на порту 4000..." -ForegroundColor Gray
    Push-Location "Backend\config-service"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized
    Pop-Location
    Start-Sleep -Seconds 3
    
    # Запуск Global Admin
    Write-Host "  - Запуск Global Admin на порту 3001..." -ForegroundColor Gray
    Push-Location "Frontend\global-admin"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Minimized
    Pop-Location
    Start-Sleep -Seconds 2
    
    # Запуск Tenant Admin
    Write-Host "  - Запуск Tenant Admin на порту 3002..." -ForegroundColor Gray
    Push-Location "Frontend\tenant-admin"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized
    Pop-Location
    Start-Sleep -Seconds 2
    
    # Запуск Web App
    Write-Host "  - Запуск Web App на порту 3003..." -ForegroundColor Gray
    Push-Location "Frontend\web-app"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized
    Pop-Location
    
    Write-Host ""
    Write-Host "⏳ Ожидание запуска сервисов (20 секунд)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
}

# Финальный вывод
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ!                   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if ($Production) {
    Write-Host "📊 FRONTEND (Production):" -ForegroundColor Cyan
    Write-Host "   🌐 Global Admin:  http://localhost:3001" -ForegroundColor White
    Write-Host "      (Главный администратор платформы)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   🏪 Tenant Admin:  http://localhost:3002" -ForegroundColor White
    Write-Host "      (Администратор магазина)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   🛒 Web App:       http://localhost:3003" -ForegroundColor White
    Write-Host "      (Витрина магазина)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 BACKEND:" -ForegroundColor Cyan
    Write-Host "   GraphQL:          http://localhost:4000/graphql" -ForegroundColor White
    Write-Host "   API Gateway:      http://localhost:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 МОНИТОРИНГ:" -ForegroundColor Cyan
    Write-Host "   Grafana:          http://localhost:3001 (admin/admin)" -ForegroundColor White
    Write-Host "   Jaeger:           http://localhost:16686" -ForegroundColor White
    Write-Host "   Prometheus:       http://localhost:9090" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 Для остановки: docker-compose down" -ForegroundColor Yellow
    
} else {
    Write-Host "📊 FRONTEND:" -ForegroundColor Cyan
    Write-Host "   🌐 Global Admin:  http://localhost:3001" -ForegroundColor White
    Write-Host "      Login: admin@example.com / admin123" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   🏪 Tenant Admin:  http://localhost:3002" -ForegroundColor White
    Write-Host "      Login: tenant@demo.com / demo123" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   🛒 Web App:       http://localhost:3003" -ForegroundColor White
    Write-Host "      (Витрина магазина для покупателей)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 BACKEND:" -ForegroundColor Cyan
    Write-Host "   Config Service:   http://localhost:4000/graphql" -ForegroundColor White
    Write-Host ""
    Write-Host "💾 БАЗА ДАННЫХ:" -ForegroundColor Cyan
    Write-Host "   PostgreSQL:       localhost:5432" -ForegroundColor White
    Write-Host "      Database: marketplace" -ForegroundColor Gray
    Write-Host "      User: postgres / Password: postgres" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   pgAdmin:          http://localhost:5050" -ForegroundColor White
    Write-Host "      Email: admin@example.com / Password: admin" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Redis:            localhost:6379" -ForegroundColor White
    Write-Host "   RedisInsight:     http://localhost:8001" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 Для остановки:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray
    Write-Host "   (закройте окна PowerShell с запущенными сервисами)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 Документация:" -ForegroundColor Cyan
Write-Host "   ACCESS-HIERARCHY.md   - Иерархия доступов и роли" -ForegroundColor Gray
Write-Host "   SITE-BUILDER-GUIDE.md - Руководство по Site Builder" -ForegroundColor Gray
Write-Host "   DOCKER-GUIDE.md       - Работа с Docker" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Совет: Откройте браузер и перейдите на http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
