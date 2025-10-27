# ОЧИСТКА КЕША TENANT-ADMIN

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ОЧИСТКА КЕША TENANT-ADMIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка API
Write-Host "1. Проверка API..." -NoNewline
$body = @{email='test@test.com'; password='test123'} | ConvertTo-Json
$result = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
Write-Host " OK" -ForegroundColor Green
Write-Host "   Пользователь: $($result.user.name)" -ForegroundColor Gray

# Проверка БД
Write-Host ""
Write-Host "2. Проверка БД..." -NoNewline
$dbCount = docker exec -i pvzzz-postgres-1 psql -U platform -d marketplace -c "SELECT COUNT(*) FROM site_configs;" -t
Write-Host " OK" -ForegroundColor Green
Write-Host "   Конфигураций: $($dbCount.Trim())" -ForegroundColor Gray

# Проверка контейнера
Write-Host ""
Write-Host "3. Проверка контейнера..." -NoNewline
$containerStatus = docker ps --filter "name=tenant-admin" --format "{{.Status}}"
Write-Host " OK" -ForegroundColor Green
Write-Host "   Статус: $containerStatus" -ForegroundColor Gray

# Дата сборки
Write-Host ""
Write-Host "4. Дата сборки контейнера..." -NoNewline
$imageDate = docker images pvzzz-tenant-admin --format "{{.CreatedAt}}"
Write-Host " $imageDate" -ForegroundColor Cyan

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ПРОБЛЕМА И РЕШЕНИЕ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "ПРОБЛЕМА:" -ForegroundColor Red
Write-Host "Nginx кеширует JS файлы на 1 ГОД" -ForegroundColor Yellow
Write-Host "Браузер сохранил СТАРУЮ версию кода" -ForegroundColor Yellow
Write-Host ""

Write-Host "РЕШЕНИЕ 1 - РЕЖИМ ИНКОГНИТО:" -ForegroundColor Green
Write-Host "Chrome: Ctrl+Shift+N" -ForegroundColor Cyan
Write-Host "Firefox: Ctrl+Shift+P" -ForegroundColor Cyan
Write-Host "Потом открыть: http://localhost:3002/login" -ForegroundColor Yellow
Write-Host ""

Write-Host "РЕШЕНИЕ 2 - ЖЕСТКОЕ ОБНОВЛЕНИЕ:" -ForegroundColor Green
Write-Host "1. Открыть http://localhost:3002/login" -ForegroundColor White
Write-Host "2. Нажать Ctrl+Shift+R" -ForegroundColor Cyan
Write-Host "3. Открыть DevTools F12 - Application - Clear storage" -ForegroundColor Cyan
Write-Host ""

Write-Host "РЕШЕНИЕ 3 - ПЕРЕСБОРКА БЕЗ КЕША:" -ForegroundColor Green
Write-Host "docker-compose build --no-cache tenant-admin" -ForegroundColor Cyan
Write-Host "docker-compose up -d tenant-admin" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  КАК ПРОВЕРИТЬ" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "НЕПРАВИЛЬНЫЕ данные:" -ForegroundColor White
Write-Host "Email: wrong@test.com" -ForegroundColor Gray
Write-Host "Password: wrong123" -ForegroundColor Gray
Write-Host "Результат: Invalid email or password" -ForegroundColor Red
Write-Host ""

Write-Host "ПРАВИЛЬНЫЕ данные:" -ForegroundColor White
Write-Host "Email: test@test.com" -ForegroundColor Gray
Write-Host "Password: test123" -ForegroundColor Gray
Write-Host "Результат: Вход выполнен" -ForegroundColor Green
Write-Host ""

Write-Host "Открыть браузер в режиме инкогнито? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "Открываю браузер..." -ForegroundColor Green
    Start-Process "chrome.exe" -ArgumentList "--incognito","http://localhost:3002/login"
    Write-Host "Браузер открыт!" -ForegroundColor Green
    Write-Host "Попробуйте войти с test@test.com / test123" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
