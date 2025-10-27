# View Logs Script

param(
    [string]$Service = "",
    [switch]$Follow,
    [int]$Tail = 100,
    [switch]$Dev
)

$composeFile = if ($Dev) { "docker-compose.dev.yml" } else { "docker-compose.yml" }

Write-Host "=== PVZZz Platform - Logs ===" -ForegroundColor Cyan
Write-Host ""

if ($Service) {
    Write-Host "Сервис: $Service" -ForegroundColor Yellow
    if ($Follow) {
        docker-compose -f $composeFile logs -f --tail=$Tail $Service
    } else {
        docker-compose -f $composeFile logs --tail=$Tail $Service
    }
} else {
    Write-Host "Все сервисы" -ForegroundColor Yellow
    if ($Follow) {
        docker-compose -f $composeFile logs -f --tail=$Tail
    } else {
        docker-compose -f $composeFile logs --tail=$Tail
    }
}

# Usage examples:
# .\logs.ps1                          # Все логи (последние 100 строк)
# .\logs.ps1 -Follow                  # Все логи (follow mode)
# .\logs.ps1 -Service config-service  # Логи config-service
# .\logs.ps1 -Service postgres -Follow -Tail 500  # Логи postgres (500 строк, follow)
# .\logs.ps1 -Dev -Service redis      # Логи redis (dev mode)
