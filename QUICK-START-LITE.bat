@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   Quick Start - Working Services Only
echo ========================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0quick-start-lite.ps1"
pause
