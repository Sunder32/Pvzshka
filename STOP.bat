@echo off
chcp 65001 > nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     PVZZz - Остановка сервисов                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Что остановить?
echo.
echo   1. Development (docker-compose.dev.yml)
echo   2. Production (docker-compose.yml)
echo   3. Все + удалить данные (volumes)
echo   4. Только закрыть PowerShell окна
echo.
set /p choice="Ваш выбор (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🛑 Остановка Development инфраструктуры...
    docker-compose -f docker-compose.dev.yml down
    echo ✅ Готово!
) else if "%choice%"=="2" (
    echo.
    echo 🛑 Остановка Production сервисов...
    docker-compose down
    echo ✅ Готово!
) else if "%choice%"=="3" (
    echo.
    echo ⚠️  ВНИМАНИЕ: Будут удалены все данные (БД, Redis, и т.д.)
    set /p confirm="Продолжить? (yes/no): "
    if "!confirm!"=="yes" (
        echo.
        echo 🗑️  Остановка и удаление всех данных...
        docker-compose -f docker-compose.dev.yml down -v
        docker-compose down -v
        echo ✅ Все данные удалены!
    ) else (
        echo ❌ Отменено
    )
) else if "%choice%"=="4" (
    echo.
    echo 🔪 Закрытие всех PowerShell окон с npm/node процессами...
    taskkill /F /FI "WINDOWTITLE eq Administrator:*npm*" 2>nul
    taskkill /F /FI "WINDOWTITLE eq *npm run dev*" 2>nul
    taskkill /F /FI "WINDOWTITLE eq *npm start*" 2>nul
    echo ✅ Готово!
    echo.
    echo 💡 Совет: Также остановите Docker контейнеры (опция 1 или 2)
) else (
    echo.
    echo ❌ Неверный выбор
)

echo.
pause
