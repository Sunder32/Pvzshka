# ========================================
# СКРИПТ ДЛЯ ОЧИСТКИ КЕША TENANT-ADMIN
# ========================================

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🔥 ОЧИСТКА КЕША TENANT-ADMIN 🔥                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Проверка текущего состояния
Write-Host "📊 ТЕКУЩЕЕ СОСТОЯНИЕ:" -ForegroundColor Yellow
Write-Host ""

# 1. Проверка API
Write-Host "1️⃣  Проверка API..." -NoNewline
try {
    $body = @{email='test@test.com'; password='test123'} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
    Write-Host " ✅ РАБОТАЕТ" -ForegroundColor Green
    Write-Host "   Пользователь: $($result.user.name)" -ForegroundColor Gray
} catch {
    Write-Host " ❌ НЕ РАБОТАЕТ" -ForegroundColor Red
}

# 2. Проверка БД
Write-Host "`n2️⃣  Проверка БД..." -NoNewline
$dbCount = docker exec -i pvzzz-postgres-1 psql -U platform -d marketplace -c "SELECT COUNT(*) FROM site_configs;" -t 2>$null
if ($dbCount) {
    Write-Host " ✅ РАБОТАЕТ" -ForegroundColor Green
    Write-Host "   Конфигураций: $($dbCount.Trim())" -ForegroundColor Gray
} else {
    Write-Host " ❌ НЕ РАБОТАЕТ" -ForegroundColor Red
}

# 3. Проверка контейнера
Write-Host "`n3️⃣  Проверка контейнера..." -NoNewline
$containerStatus = docker ps --filter "name=tenant-admin" --format "{{.Status}}"
if ($containerStatus) {
    Write-Host " ✅ ЗАПУЩЕН" -ForegroundColor Green
    Write-Host "   Статус: $containerStatus" -ForegroundColor Gray
} else {
    Write-Host " ❌ НЕ ЗАПУЩЕН" -ForegroundColor Red
}

# 4. Дата сборки контейнера
Write-Host "`n4️⃣  Дата сборки контейнера..." -NoNewline
$imageDate = docker images pvzzz-tenant-admin --format "{{.CreatedAt}}"
Write-Host " $imageDate" -ForegroundColor Cyan

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║                 🎯 РЕШЕНИЕ ПРОБЛЕМЫ                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "ПРОБЛЕМА:" -ForegroundColor Red
Write-Host "Nginx кеширует JS файлы на 1 ГОД (expires 1y)" -ForegroundColor Yellow
Write-Host "Браузер сохранил СТАРУЮ версию кода до изменений" -ForegroundColor Yellow

Write-Host "`nРЕШЕНИЕ 1 (САМОЕ ПРОСТОЕ):" -ForegroundColor Green
Write-Host "Открыть в режиме ИНКОГНИТО:" -ForegroundColor White
Write-Host "   Chrome: Ctrl+Shift+N" -ForegroundColor Cyan
Write-Host "   Firefox: Ctrl+Shift+P" -ForegroundColor Cyan
Write-Host "   Edge: Ctrl+Shift+N" -ForegroundColor Cyan
Write-Host "`nПотом открыть: http://localhost:3002/login" -ForegroundColor Yellow

Write-Host "`nРЕШЕНИЕ 2 (ЖЕСТКОЕ ОБНОВЛЕНИЕ):" -ForegroundColor Green
Write-Host "1. Открыть http://localhost:3002/login" -ForegroundColor White
Write-Host "2. Нажать Ctrl+Shift+R для жесткого обновления" -ForegroundColor Cyan
Write-Host "3. Открыть DevTools F12 - Application - Clear storage - Clear site data" -ForegroundColor Cyan

Write-Host "`nРЕШЕНИЕ 3 (ПЕРЕСБОРКА БЕЗ КЕША):" -ForegroundColor Green
Write-Host "Если вышеперечисленное не помогло:" -ForegroundColor White
Write-Host ""
Write-Host "docker-compose build --no-cache tenant-admin" -ForegroundColor Cyan
Write-Host "docker-compose up -d tenant-admin" -ForegroundColor Cyan

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              📋 КАК ПРОВЕРИТЬ ЧТО РАБОТАЕТ                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

Write-Host "✅ ПРАВИЛЬНОЕ ПОВЕДЕНИЕ:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Открыть http://localhost:3002/login В ИНКОГНИТО" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Попробовать НЕПРАВИЛЬНЫЕ данные:" -ForegroundColor White
Write-Host "   Email: wrong@test.com" -ForegroundColor Gray
Write-Host "   Password: wrong123" -ForegroundColor Gray
Write-Host "   Результат: 'Invalid email or password' ❌" -ForegroundColor Red
Write-Host ""
Write-Host "3. Попробовать ПРАВИЛЬНЫЕ данные:" -ForegroundColor White
Write-Host "   Email: test@test.com" -ForegroundColor Gray
Write-Host "   Password: test123" -ForegroundColor Gray
Write-Host "   Результат: Вход выполнен ✅" -ForegroundColor Green
Write-Host ""
Write-Host "4. Перейти в Site Builder" -ForegroundColor White
Write-Host ""
Write-Host "5. Изменить цвета и нажать 'Сохранить'" -ForegroundColor White
Write-Host ""
Write-Host "6. Обновить страницу (F5)" -ForegroundColor White
Write-Host "   Результат: Цвета сохранились ✅" -ForegroundColor Green

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║                  🚀 БЫСТРАЯ ПРОВЕРКА                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Хотите открыть браузер в режиме инкогнито прямо сейчас? (Y/N)" -ForegroundColor Yellow -NoNewline
$response = Read-Host " "

if ($response -eq 'Y' -or $response -eq 'y' -or $response -eq 'Д' -or $response -eq 'д') {
    Write-Host "`n🚀 Открываю браузер..." -ForegroundColor Green
    Start-Process "chrome.exe" -ArgumentList "--incognito","http://localhost:3002/login"
    Write-Host ""
    Write-Host "✅ Браузер открыт!" -ForegroundColor Green
    Write-Host "   Попробуйте войти с test@test.com / test123" -ForegroundColor Yellow
} else {
    Write-Host "`n👋 Окей! Не забудьте открыть в режиме инкогнито самостоятельно!" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
