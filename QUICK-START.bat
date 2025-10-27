@echo off
chcp 65001 > nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     PVZZz - Multi-Tenant Marketplace Platform               ║
echo ║     Quick Start                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Выберите режим запуска:
echo.
echo   1. HYBRID (рекомендуется)
echo      - Инфраструктура в Docker
echo      - Сервисы запускаются локально
echo      - Быстрая разработка
echo.
echo   2. PRODUCTION
echo      - Все сервисы в Docker
echo      - Полная изоляция
echo      - Как на продакшене
echo.
echo   3. DEV ONLY
echo      - Только PostgreSQL и Redis
echo      - Ручной запуск сервисов
echo.
set /p choice="Ваш выбор (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Запуск в HYBRID режиме...
    powershell -ExecutionPolicy Bypass -File "%~dp0quick-start.ps1"
) else if "%choice%"=="2" (
    echo.
    echo 📦 Запуск в PRODUCTION режиме...
    powershell -ExecutionPolicy Bypass -File "%~dp0quick-start.ps1" -Production
) else if "%choice%"=="3" (
    echo.
    echo 🔧 Запуск только инфраструктуры...
    powershell -ExecutionPolicy Bypass -File "%~dp0quick-start.ps1" -DevOnly
) else (
    echo.
    echo ❌ Неверный выбор. Запускаю режим по умолчанию (HYBRID)...
    timeout /t 2 > nul
    powershell -ExecutionPolicy Bypass -File "%~dp0quick-start.ps1"
)

echo.
pause
