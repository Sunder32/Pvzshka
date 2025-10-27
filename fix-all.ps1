# СКРИПТ АВТОМАТИЧЕСКОГО ИСПРАВЛЕНИЯ ВСЕХ ПРОБЛЕМ

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ ПРОЕКТА" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Docker
Write-Host "ШАГ 1: Проверка Docker..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker запущен" -ForegroundColor Green
        $dockerRunning = $true
    }
} catch {
    Write-Host "❌ Docker не запущен!" -ForegroundColor Red
    Write-Host "Пожалуйста, запустите Docker Desktop вручную" -ForegroundColor Yellow
    Write-Host "После запуска нажмите Enter для продолжения..." -ForegroundColor Cyan
    Read-Host
}

if (-not $dockerRunning) {
    Write-Host "Проверяю Docker снова..." -ForegroundColor Yellow
    try {
        docker ps 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker запущен" -ForegroundColor Green
            $dockerRunning = $true
        } else {
            Write-Host "❌ Docker все еще не работает" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Docker все еще не работает" -ForegroundColor Red
        exit 1
    }
}

# Проверка контейнеров
Write-Host ""
Write-Host "ШАГ 2: Проверка запущенных контейнеров..." -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String -Pattern "pvzzz"

# Пересборка tenant-admin
Write-Host ""
Write-Host "ШАГ 3: Пересборка tenant-admin БЕЗ КЕША..." -ForegroundColor Yellow
Write-Host "Это займет ~30 секунд..." -ForegroundColor Gray

docker-compose build --no-cache tenant-admin

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Контейнер собран" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка сборки контейнера" -ForegroundColor Red
    exit 1
}

# Перезапуск контейнера
Write-Host ""
Write-Host "ШАГ 4: Перезапуск tenant-admin..." -ForegroundColor Yellow
docker-compose up -d tenant-admin

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Контейнер перезапущен" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка запуска контейнера" -ForegroundColor Red
    exit 1
}

# Ожидание запуска
Write-Host ""
Write-Host "ШАГ 5: Ожидание запуска (3 секунды)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Проверка содержимого контейнера
Write-Host ""
Write-Host "ШАГ 6: Проверка файлов в контейнере..." -ForegroundColor Yellow
$files = docker exec pvzzz-tenant-admin-1 ls -la /usr/share/nginx/html/ 2>&1

if ($files -match "index.html") {
    Write-Host "✅ index.html найден" -ForegroundColor Green
} else {
    Write-Host "❌ index.html НЕ найден!" -ForegroundColor Red
    Write-Host $files
}

# Проверка размера JS файла
$jsFile = docker exec pvzzz-tenant-admin-1 find /usr/share/nginx/html/assets -name "index-*.js" 2>&1 | Select-Object -First 1
if ($jsFile) {
    $jsSize = docker exec pvzzz-tenant-admin-1 ls -lh $jsFile 2>&1
    Write-Host "✅ JavaScript: $jsFile" -ForegroundColor Green
    Write-Host "   Размер: $($jsSize -split '\s+' | Select-Object -Index 4)" -ForegroundColor Gray
}

# Проверка API
Write-Host ""
Write-Host "ШАГ 7: Проверка API..." -ForegroundColor Yellow

# Неправильный логин
Write-Host "  7.1. Тест неправильного логина..." -NoNewline
try {
    $body = @{email='wrong@test.com'; password='wrong123'} | ConvertTo-Json
    Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method POST -Body $body -ContentType 'application/json' -ErrorAction Stop | Out-Null
    Write-Host " ❌ FAIL (должен отклонить)" -ForegroundColor Red
} catch {
    Write-Host " ✅ OK (отклонен)" -ForegroundColor Green
}

# Правильный логин
Write-Host "  7.2. Тест правильного логина..." -NoNewline
try {
    $body = @{email='test@test.com'; password='test123'} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
    Write-Host " ✅ OK" -ForegroundColor Green
    Write-Host "       User: $($result.user.name)" -ForegroundColor Gray
    Write-Host "       Token: $($result.token.Substring(0,20))..." -ForegroundColor Gray
    $token = $result.token
} catch {
    Write-Host " ❌ FAIL" -ForegroundColor Red
    $token = $null
}

# Проверка тикетов
if ($token) {
    Write-Host "  7.3. Тест получения тикетов..." -NoNewline
    try {
        $headers = @{Authorization="Bearer $token"}
        $tickets = Invoke-RestMethod -Uri 'http://localhost:8080/api/support/tickets' -Headers $headers
        if ($tickets -is [array]) {
            Write-Host " ✅ OK (массив)" -ForegroundColor Green
            Write-Host "       Тикетов: $($tickets.Count)" -ForegroundColor Gray
        } else {
            Write-Host " ⚠️ Не массив" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ❌ FAIL" -ForegroundColor Red
    }
}

# Проверка БД
Write-Host ""
Write-Host "ШАГ 8: Проверка базы данных..." -ForegroundColor Yellow

$configs = docker exec -i pvzzz-postgres-1 psql -U platform -d marketplace -c "SELECT COUNT(*) FROM site_configs;" -t 2>&1
Write-Host "  Конфигураций сайтов: $($configs.Trim())" -ForegroundColor Gray

$supportTickets = docker exec -i pvzzz-postgres-1 psql -U platform -d marketplace -c "SELECT COUNT(*) FROM support_tickets;" -t 2>&1
Write-Host "  Заявок поддержки: $($supportTickets.Trim())" -ForegroundColor Gray

$carts = docker exec -i pvzzz-postgres-1 psql -U platform -d marketplace -c "SELECT COUNT(*) FROM cart;" -t 2>&1
Write-Host "  Корзин: $($carts.Trim())" -ForegroundColor Gray

# Финал
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Откройте браузер:" -ForegroundColor Cyan
Write-Host "  http://localhost:3002/login" -ForegroundColor White
Write-Host ""
Write-Host "Тестовые данные:" -ForegroundColor Cyan
Write-Host "  Email: test@test.com" -ForegroundColor White
Write-Host "  Password: test123" -ForegroundColor White
Write-Host ""
Write-Host "Проверьте:" -ForegroundColor Yellow
Write-Host "  1. Site Settings - должна загрузиться" -ForegroundColor White
Write-Host "  2. Site Builder - должен сохранять данные" -ForegroundColor White
Write-Host "  3. Support - должен создавать заявки" -ForegroundColor White
Write-Host ""

# Открыть браузер
Write-Host "Открыть браузер? (Y/N): " -ForegroundColor Cyan -NoNewline
$openBrowser = Read-Host

if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y') {
    Write-Host "Открываю браузер..." -ForegroundColor Green
    Start-Process "chrome.exe" -ArgumentList "http://localhost:3002/login"
}

Write-Host ""
Write-Host "Готово!" -ForegroundColor Green
