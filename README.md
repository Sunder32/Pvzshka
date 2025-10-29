# Multi-Tenant SaaS Platform для Маркетплейсов с ПВЗ

Комплексная SaaS-платформа для создания маркетплейсов с веб-интерфейсом, мобильными приложениями и управлением ПВЗ.

## 🏗️ Архитектура

### Микросервисы
- **Auth Service** (Go) - аутентификация, авторизация, multi-tenancy
- **Catalog Service** (Node.js) - управление товарами, поиск, категории
- **Order Service** (Java/Spring Boot) - управление заказами, Saga pattern
- **Payment Service** (Node.js) - интеграция платежных систем, split payments
- **Logistics/PVZ Service** (Go) - интеграция служб доставки, управление ПВЗ
- **Notification Service** (Python) - email/SMS/push уведомления
- **Config Service** (Node.js + GraphQL) - Server-Driven UI, feature flags

### Frontend
- **Web App** (React + Next.js + PWA)
- **Mobile App** (React Native + CodePush)
- **Global Admin** (React + Ant Design)
- **Tenant Admin** (React + Chakra UI)

### Инфраструктура
- **API Gateway**: Kong
- **Database**: PostgreSQL 15+ с Multi-Tenancy (RLS)
- **Search**: Elasticsearch 8.x
- **Cache**: Redis Cluster
- **Message Queue**: Apache Kafka
- **Storage**: S3-compatible object storage

## 🚀 Быстрый старт

### Требования
- Docker Desktop 20+
- Node.js 20+
- PowerShell 5.1+

### ⚡ Быстрый запуск (Production Mode)

```powershell
# Запуск всех сервисов
.\quick-start.ps1

# Остановка
.\stop.ps1
```

**Доступ:**
- Global Admin: http://localhost:3000
- Tenant Admin: http://localhost:3001  
- Web App: http://localhost:3003?site=demo
- Kong Gateway: http://localhost:8000

### 🎨 Новые возможности дизайна (v2.0)

#### Header (Шапка)
- ✅ **11 SVG иконок** для меню (дом, каталог, корзина, профиль и др.)
- ✅ **Scroll-эффекты**: динамическая тень и backdrop-blur
- ✅ **Hover-анимации**: подчеркивание и масштабирование
- ✅ **Мобильное меню**: slide-down с иконками

#### Hero (Главный баннер)  
- ✅ **Badge**: настраиваемый значок (например "✨ НОВАЯ КОЛЛЕКЦИЯ")
- ✅ **Две кнопки**: основная + дополнительная (опционально)
- ✅ **Статистика**: блок с показателями (опционально)
- ✅ **Анимации**: parallax, плавающие градиенты, grid pattern

#### Products (Товары)
- ✅ **Рейтинг**: 5 звезд + количество отзывов
- ✅ **Shimmer-эффект**: анимированный блик на изображении
- ✅ **Favorite button**: кнопка избранного с hover
- ✅ **Градиентная кнопка**: "В корзину" с иконкой

#### Categories (Категории)
- ✅ **Hover-градиенты**: подсветка цветом категории
- ✅ **Анимация иконок**: масштабирование + вращение
- ✅ **Счетчик товаров**: динамический подсчет

📚 **Подробнее**: см. [DESIGN-IMPROVEMENTS.md](./DESIGN-IMPROVEMENTS.md)

### 1. Development Mode (разработка)

Запускает только инфраструктуру (PostgreSQL, Redis):

```powershell
# Запуск
.\start-dev.ps1

# В отдельных терминалах:
cd Backend\config-service
npm install
npm run dev

cd Frontend\global-admin
npm install  
npm start

cd Frontend\tenant-admin
npm install
npm run dev

cd Frontend\web-app
npm install
npm run dev
```

**Доступные URL:**
- Global Admin: http://localhost:3001
- Tenant Admin: http://localhost:3002  
- Web App: http://localhost:3003
- Config Service (GraphQL): http://localhost:4000/graphql
- pgAdmin: http://localhost:5050

### 2. Production Mode (все в Docker)

Запускает все сервисы в контейнерах:

```powershell
# Сборка и запуск
.\start-production.ps1

# Просмотр логов
.\logs.ps1 -Follow

# Логи конкретного сервиса
.\logs.ps1 -Service config-service -Follow

# Остановка
docker-compose down
```

### 3. Интерактивное меню (самый простой способ)

```powershell
.\START.bat
```

Выберите режим запуска из меню.powershell
# Быстрый запуск всего проекта
.\quick-start.ps1

# Интерактивное меню
.\start.ps1

# Остановка
.\stop.ps1
```

### Linux/Mac (Make)

```bash
# Запустить всё
make start

# Только инфраструктура
make infra

# Только фронтенд
make frontend

# Остановить
make stop
```

### Docker Compose (универсальный способ)

```bash
# Запустить всё
docker-compose up -d

# Остановить
docker-compose down
```

📖 **Подробная инструкция**: см. файл [QUICK_START.md](QUICK_START.md)

## 📁 Структура проекта

```
pvZZz/
├── Backend/
│   ├── auth-service/          # Go - Authentication & Authorization
│   ├── catalog-service/       # Node.js - Product Catalog
│   ├── order-service/         # Java - Order Management
│   ├── payment-service/       # Node.js - Payments
│   ├── logistics-service/     # Go - Logistics & PVZ
│   ├── notification-service/  # Python - Notifications
│   ├── config-service/        # Node.js - Config & Server-Driven UI
│   └── shared/                # Shared libraries & schemas
├── Frontend/
│   ├── web-app/              # Next.js PWA
│   ├── global-admin/         # Global admin panel
│   └── tenant-admin/         # Tenant admin panel
├── Phone/                     # React Native mobile app
├── Infrastructure/
│   ├── docker/               # Docker configurations
│   ├── kubernetes/           # K8s manifests & Helm charts
│   ├── terraform/            # IaC for cloud resources
│   └── monitoring/           # Prometheus, Grafana, ELK
└── docs/                      # Documentation

```

## 🔐 Multi-Tenancy

Используется гибридная модель:
- **Shared Database + RLS** - для малых тенантов
- **Schema per Tenant** - для средних тенантов
- **Database per Tenant** - для enterprise клиентов

## 📊 Monitoring & Observability

- **Metrics**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger
- **Errors**: Sentry

## 🔒 Security & Compliance

- ✅ 152-ФЗ (хранение данных РФ в ru-central1)
- ✅ GDPR compliance
- ✅ PCI DSS для платежей
- ✅ Encryption at rest и in transit
- ✅ Row-Level Security (RLS)

## 📈 Roadmap

- [x] Phase 1: Foundation (месяцы 1-3)
- [ ] Phase 2: Core Features (месяцы 4-6)
- [ ] Phase 3: Advanced Features (месяцы 7-9)
- [ ] Phase 4: Scale & Optimization (месяцы 10-12)

## 📄 License

Proprietary - All rights reserved

## 👥 Team

- Backend Team: Go, Java, Node.js developers
- Frontend Team: React, React Native developers
- DevOps Team: Kubernetes, CI/CD specialists
- QA Team: Automated testing & quality assurance
