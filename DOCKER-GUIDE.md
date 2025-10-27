# Docker Management Scripts

## Development (только инфраструктура)

Запуск только БД, Redis, Kafka и других сервисов инфраструктуры:

```powershell
# Запустить инфраструктуру
docker-compose -f docker-compose.dev.yml up -d

# Остановить
docker-compose -f docker-compose.dev.yml down

# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f

# Очистить все данные
docker-compose -f docker-compose.dev.yml down -v
```

### Доступные сервисы (Development):

- **PostgreSQL**: localhost:5432
  - Database: marketplace
  - User: postgres
  - Password: postgres

- **pgAdmin**: http://localhost:5050
  - Email: admin@example.com
  - Password: admin

- **Redis**: localhost:6379

- **RedisInsight**: http://localhost:8001

- **Elasticsearch**: http://localhost:9200

- **Kafka**: localhost:9093

- **MinIO**: http://localhost:9001
  - User: minioadmin
  - Password: minioadmin

---

## Production (полный стек)

Запуск всех сервисов включая микросервисы и фронтенд:

```powershell
# Сборка всех образов
docker-compose build

# Запустить все сервисы
docker-compose up -d

# Остановить все
docker-compose down

# Просмотр статуса
docker-compose ps

# Логи конкретного сервиса
docker-compose logs -f config-service
docker-compose logs -f web-app

# Перезапуск сервиса
docker-compose restart config-service

# Обновление и перезапуск
docker-compose up -d --build config-service
```

### Доступные сервисы (Production):

**Frontend:**
- Global Admin: http://localhost:3001
- Tenant Admin: http://localhost:3002
- Web App: http://localhost:3003

**Backend:**
- Kong API Gateway: http://localhost:8000
- Kong Admin: http://localhost:8001
- Config Service (GraphQL): http://localhost:4000
- Catalog Service: http://localhost:3000
- Auth Service: http://localhost:8080
- Order Service: http://localhost:8081
- Payment Service: http://localhost:3002
- Logistics Service: http://localhost:8082
- Notification Service: http://localhost:5000

**Infrastructure:**
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Elasticsearch: http://localhost:9200
- Kafka: localhost:9092
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- Jaeger UI: http://localhost:16686
- MinIO: http://localhost:9001

---

## Рекомендуемый workflow для разработки

### 1. Запустить инфраструктуру

```powershell
docker-compose -f docker-compose.dev.yml up -d postgres redis
```

### 2. Применить миграции

```powershell
# Автоматически применятся при первом запуске postgres
# Или вручную:
psql -h localhost -U postgres -d marketplace -f Backend/scripts/site-builder-schema.sql
psql -h localhost -U postgres -d marketplace -f Backend/scripts/support-tickets-schema.sql
```

### 3. Запустить Config Service локально

```powershell
cd Backend/config-service
npm install
npm run dev
```

### 4. Запустить Frontend приложения локально

```powershell
# Terminal 1 - Global Admin
cd Frontend/global-admin
npm install
npm start

# Terminal 2 - Tenant Admin
cd Frontend/tenant-admin
npm install
npm run dev

# Terminal 3 - Web App
cd Frontend/web-app
npm install
npm run dev
```

### 5. Тестирование через GraphQL Playground

Открыть: http://localhost:4000/graphql

**Пример запроса:**
```graphql
query {
  siteConfig(tenantId: "1") {
    theme {
      primaryColor
      secondaryColor
    }
    layout {
      sections {
        type
        config
      }
    }
  }
}
```

---

## Мониторинг и отладка

### Проверка здоровья сервисов

```powershell
# Проверка всех контейнеров
docker-compose ps

# Health check PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Health check Redis
docker-compose exec redis redis-cli ping

# Health check Config Service
curl http://localhost:4000/health
```

### Просмотр логов

```powershell
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f postgres
docker-compose logs -f config-service
docker-compose logs -f web-app

# Последние 100 строк
docker-compose logs --tail=100 config-service
```

### Подключение к контейнерам

```powershell
# PostgreSQL
docker-compose exec postgres psql -U postgres -d marketplace

# Redis
docker-compose exec redis redis-cli

# Bash в контейнере
docker-compose exec config-service sh
```

---

## Очистка и сброс

### Удалить все контейнеры и volumes

```powershell
# Остановить и удалить контейнеры
docker-compose down

# Удалить volumes (ВНИМАНИЕ: удалит все данные!)
docker-compose down -v

# Удалить images
docker-compose down --rmi all

# Полная очистка
docker system prune -a --volumes
```

### Пересобрать конкретный сервис

```powershell
# Пересборка и перезапуск
docker-compose up -d --build config-service

# Или через отдельные команды
docker-compose build config-service
docker-compose up -d config-service
```

---

## Переменные окружения

Создайте `.env` файл в корне проекта:

```env
# Database
POSTGRES_USER=platform
POSTGRES_PASSWORD=platform123
POSTGRES_DB=marketplace

# External APIs
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
CDEK_CLIENT_ID=your_client_id
CDEK_CLIENT_SECRET=your_client_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## Production Deployment

### Build production images

```powershell
docker-compose build --no-cache
```

### Push to registry

```powershell
# Tag images
docker tag pvzzz_config-service registry.example.com/pvzzz/config-service:latest
docker tag pvzzz_web-app registry.example.com/pvzzz/web-app:latest

# Push
docker push registry.example.com/pvzzz/config-service:latest
docker push registry.example.com/pvzzz/web-app:latest
```

### Deploy with docker-compose

```powershell
docker-compose -f docker-compose.yml up -d
```

### Or with Kubernetes

```powershell
# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services
```

---

## Troubleshooting

### Config Service не запускается

```powershell
# Проверить логи
docker-compose logs config-service

# Проверить переменные окружения
docker-compose exec config-service env

# Проверить подключение к БД
docker-compose exec config-service node -e "const pg = require('pg'); const client = new pg.Client('postgresql://postgres:postgres@postgres:5432/marketplace'); client.connect().then(() => console.log('OK')).catch(e => console.error(e))"
```

### PostgreSQL миграции не применились

```powershell
# Пересоздать БД
docker-compose down -v
docker-compose up -d postgres

# Подождать пока запустится
docker-compose logs -f postgres

# Проверить таблицы
docker-compose exec postgres psql -U postgres -d marketplace -c "\dt"
```

### Frontend не собирается

```powershell
# Очистить кеш
docker-compose build --no-cache global-admin

# Проверить логи сборки
docker-compose up global-admin
```

### Недостаточно памяти для Elasticsearch

```powershell
# Увеличить память в docker-compose.yml
environment:
  - "ES_JAVA_OPTS=-Xms1g -Xmx1g"

# Или отключить Elasticsearch для локальной разработки
docker-compose -f docker-compose.dev.yml up -d postgres redis
```
