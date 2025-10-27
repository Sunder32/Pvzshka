# 📋 Шпаргалка по командам

## Запуск проекта

### Windows (самый простой способ)
```
Дважды кликните: QUICK-START.bat
```

### PowerShell
```powershell
.\quick-start.ps1              # Быстрый запуск всего
.\start.ps1                    # Интерактивное меню
```

### Docker Compose
```bash
docker-compose up -d           # Запустить всё
```

---

## Остановка проекта

```bash
docker-compose down            # Остановить всё
docker-compose down -v         # Остановить + удалить данные
```

```powershell
.\stop.ps1                     # PowerShell
```

---

## Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f catalog-service
docker-compose logs -f web-app
docker-compose logs -f postgres

# Последние 50 строк
docker-compose logs --tail=50 catalog-service
```

---

## Проверка статуса

```bash
docker-compose ps              # Список всех контейнеров
docker ps                      # Активные контейнеры
docker stats                   # Использование ресурсов
```

---

## Перезапуск сервисов

```bash
# Все сервисы
docker-compose restart

# Конкретный сервис
docker-compose restart catalog-service
docker-compose restart web-app
```

---

## Пересборка образов

```bash
# Все образы
docker-compose build

# Конкретный сервис
docker-compose build catalog-service
docker-compose build web-app

# Запуск с пересборкой
docker-compose up -d --build
```

---

## Доступ к контейнерам

```bash
# Войти в контейнер
docker-compose exec catalog-service sh
docker-compose exec postgres psql -U platform

# Выполнить команду
docker-compose exec postgres psql -U platform -c "SELECT version();"
```

---

## Очистка

```bash
# Остановить и удалить контейнеры
docker-compose down

# + удалить volumes (все данные!)
docker-compose down -v

# Удалить неиспользуемые образы
docker image prune

# Удалить всё неиспользуемое
docker system prune -a
```

---

## URL сервисов

### Фронтенд
- Web App: http://localhost:3003
- Tenant Admin: http://localhost:3004
- Global Admin: http://localhost:3005

### API
- Catalog: http://localhost:3000/api/v1/products
- Config: http://localhost:4000/graphql
- Kong Gateway: http://localhost:8000

### Мониторинг
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Jaeger: http://localhost:16686
- MinIO: http://localhost:9001 (minioadmin/minioadmin)

### Базы данных
- PostgreSQL: localhost:5432 (platform/platform123)
- Redis: localhost:6379
- Elasticsearch: http://localhost:9200

---

## Полезные команды

```bash
# Показать все контейнеры (включая остановленные)
docker ps -a

# Показать использование дисков
docker system df

# Посмотреть сети
docker network ls

# Посмотреть volumes
docker volume ls

# Экспорт логов в файл
docker-compose logs > logs.txt

# Следить за конкретным сервисом
docker-compose logs -f --tail=100 catalog-service
```
