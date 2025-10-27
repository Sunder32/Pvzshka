# Config Service - Сервис динамических конфигураций

Микросервис для управления конфигурациями мультитенантной платформы. Хранит и предоставляет настройки каждого магазина (брендинг, цвета, категории, функции).

## 🚀 Возможности

- **REST API** для CRUD операций с конфигами магазинов
- **GraphQL API** для гибких запросов
- **WebSocket** для real-time уведомлений об изменениях
- **Redis кэширование** для быстрого доступа
- **PostgreSQL** для персистентного хранения
- **Pub/Sub** для уведомления подписчиков
- **Версионирование** конфигураций

## 📦 Архитектура

```
config-service/
├── src/
│   ├── index.js              # Главный сервер (Express + Apollo + WebSocket)
│   ├── routes/
│   │   └── config.js         # REST API эндпоинты
│   ├── repositories/
│   │   └── configRepository.js # Работа с PostgreSQL
│   ├── services/
│   │   └── websocket.js      # WebSocket сервер
│   ├── client/
│   │   ├── configClient.js   # JavaScript клиент
│   │   └── useConfig.js      # React хуки
│   ├── config/
│   │   ├── database.js       # PostgreSQL подключение
│   │   └── redis.js          # Redis подключение
│   ├── schema/
│   │   ├── newTypeDefs.js    # GraphQL схема
│   │   └── newResolvers.js   # GraphQL резолверы
│   └── utils/
│       └── logger.js         # Winston logger
└── package.json
```

## 🔌 API Endpoints

### REST API

#### 1. Получить конфигурацию магазина
```http
GET /api/config/:tenantId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": "electronics",
    "subdomain": "electronics",
    "name": "Электроника Shop",
    "status": "active",
    "tier": "premium",
    "branding": {
      "name": "Электроника",
      "logo": "https://example.com/logo.png",
      "favicon": "https://example.com/favicon.ico",
      "primaryColor": "#3B82F6",
      "secondaryColor": "#10B981",
      "accentColor": "#F59E0B"
    },
    "layout": {
      "headerStyle": "default",
      "footerStyle": "default",
      "productCardStyle": "card"
    },
    "features": {
      "wishlist": true,
      "compare": true,
      "quickView": true,
      "reviews": true,
      "ratings": true,
      "socialShare": true
    },
    "categories": ["Смартфоны", "Ноутбуки", "Аксессуары"],
    "homepage": { ... },
    "seo": { ... },
    "integrations": { ... },
    "locale": {
      "currency": "RUB",
      "language": "ru",
      "timezone": "Europe/Moscow"
    },
    "version": 5,
    "updatedAt": "2025-10-26T10:30:00.000Z"
  },
  "source": "cache"
}
```

#### 2. Создать новый магазин
```http
POST /api/config
Content-Type: application/json

{
  "name": "Книжный магазин",
  "subdomain": "books",
  "adminEmail": "admin@books.com",
  "tier": "basic",
  "config": {
    "branding": {
      "primaryColor": "#8B5CF6",
      "logo": "https://example.com/books-logo.png"
    },
    "categories": ["Художественная литература", "Детективы", "Научная"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": "uuid-here",
    "name": "Книжный магазин",
    "subdomain": "books",
    "adminEmail": "admin@books.com",
    "status": "active",
    "tier": "basic",
    "config": { ... },
    "createdAt": "2025-10-26T11:00:00.000Z"
  },
  "message": "Tenant created successfully"
}
```

#### 3. Обновить конфигурацию (полное обновление)
```http
PUT /api/config/:tenantId
Content-Type: application/json

{
  "branding": {
    "primaryColor": "#EF4444",
    "secondaryColor": "#F59E0B"
  },
  "features": {
    "wishlist": false
  }
}
```

#### 4. Частичное обновление конфигурации
```http
PATCH /api/config/:tenantId
Content-Type: application/json

{
  "branding": {
    "logo": "https://newlogo.com/logo.png"
  }
}
```

#### 5. Получить версию конфигурации
```http
GET /api/config/:tenantId/version
```

**Response:**
```json
{
  "success": true,
  "version": 5,
  "updatedAt": "2025-10-26T10:30:00.000Z"
}
```

#### 6. Получить список всех магазинов
```http
GET /api/config?status=active&tier=premium&limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tenantId": "electronics",
      "name": "Электроника",
      "subdomain": "electronics",
      "adminEmail": "admin@electronics.com",
      "status": "active",
      "tier": "premium",
      "createdAt": "2025-10-01T00:00:00.000Z",
      "updatedAt": "2025-10-26T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

#### 7. Обновить статус магазина
```http
PATCH /api/config/:tenantId/status
Content-Type: application/json

{
  "status": "suspended"
}
```

Допустимые статусы: `active`, `suspended`, `deleted`

#### 8. Обновить тарифный план
```http
PATCH /api/config/:tenantId/tier
Content-Type: application/json

{
  "tier": "enterprise"
}
```

Допустимые тарифы: `free`, `basic`, `premium`, `enterprise`

#### 9. Сбросить конфиг к дефолтному
```http
DELETE /api/config/:tenantId
```

#### 10. Статистика WebSocket подключений
```http
GET /api/stats/websocket
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConnections": 15,
    "tenants": [
      { "tenantId": "electronics", "connections": 3 },
      { "tenantId": "books", "connections": 12 }
    ]
  }
}
```

### GraphQL API

```graphql
# Эндпоинт: http://localhost:4000/graphql

query GetConfig {
  config(tenantId: "electronics") {
    branding {
      name
      logo
      primaryColor
    }
    features {
      wishlist
      compare
    }
  }
}
```

### WebSocket API

**Подключение:**
```javascript
ws://localhost:4000/ws/config
```

**Подписка на обновления:**
```json
{
  "type": "subscribe",
  "tenantId": "electronics"
}
```

**Получение уведомлений:**
```json
{
  "type": "config:updated",
  "tenantId": "electronics",
  "version": 6,
  "updatedAt": "2025-10-26T11:00:00.000Z",
  "message": "Configuration has been updated"
}
```

**Отписка:**
```json
{
  "type": "unsubscribe",
  "tenantId": "electronics"
}
```

**Ping/Pong:**
```json
// Send
{ "type": "ping" }

// Receive
{ "type": "pong", "timestamp": "2025-10-26T11:00:00.000Z" }
```

## 💻 Использование

### JavaScript/TypeScript

```javascript
import ConfigServiceClient from './client/configClient.js';

const client = new ConfigServiceClient('http://localhost:4000');

// Получить конфиг
const config = await client.getConfig('electronics');
console.log(config.branding.name);

// Обновить конфиг
await client.updateConfig('electronics', {
  branding: { primaryColor: '#FF0000' }
});

// Подписаться на изменения
client.subscribeToUpdates('electronics', (message) => {
  console.log('Config updated!', message);
  // Перезагрузить конфиг
});
```

### React (с хуками)

```jsx
import { useConfig, useCreateTenant, useConfigVersion } from './client/useConfig';

function TenantConfigPage({ tenantId }) {
  const { config, loading, error, updateConfig } = useConfig(tenantId, {
    enableWebSocket: true,  // Автообновление через WebSocket
  });

  const handleColorChange = async (color) => {
    await updateConfig({
      branding: { primaryColor: color }
    });
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <div style={{ '--primary-color': config.branding.primaryColor }}>
      <h1>{config.branding.name}</h1>
      <ColorPicker onChange={handleColorChange} />
    </div>
  );
}

// Создание нового магазина
function CreateTenantForm() {
  const { createTenant, creating, error } = useCreateTenant();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tenant = await createTenant({
      name: 'New Shop',
      subdomain: 'newshop',
      adminEmail: 'admin@newshop.com',
    });
    console.log('Created:', tenant);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// Проверка обновлений
function ConfigVersionChecker({ tenantId }) {
  const { currentVersion, hasUpdate, resetUpdateFlag } = useConfigVersion(
    tenantId,
    30000 // Проверять каждые 30 секунд
  );

  if (hasUpdate) {
    return (
      <div className="update-banner">
        Доступно обновление конфигурации (v{currentVersion})
        <button onClick={resetUpdateFlag}>Обновить</button>
      </div>
    );
  }

  return null;
}
```

## 🗄️ Структура конфига

```typescript
interface TenantConfig {
  tenantId: string;
  subdomain: string;
  name: string;
  status: 'active' | 'suspended' | 'deleted';
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  
  branding: {
    name: string;
    logo: string;
    favicon: string;
    primaryColor: string;    // HEX цвет
    secondaryColor: string;
    accentColor: string;
  };
  
  layout: {
    headerStyle: 'default' | 'minimal' | 'centered';
    footerStyle: 'default' | 'minimal';
    productCardStyle: 'card' | 'list' | 'grid';
  };
  
  features: {
    wishlist: boolean;
    compare: boolean;
    quickView: boolean;
    reviews: boolean;
    ratings: boolean;
    socialShare: boolean;
  };
  
  categories: string[];
  
  homepage: {
    hero: {
      enabled: boolean;
      title: string;
      subtitle: string;
      image: string;
      cta: { text: string; link: string };
    };
    featuredProducts: {
      enabled: boolean;
      title: string;
      limit: number;
    };
    categories: {
      enabled: boolean;
      title: string;
    };
  };
  
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  
  integrations: {
    analytics: {
      googleAnalytics: string;
      yandexMetrika: string;
    };
    payment: {
      stripe: boolean;
      paypal: boolean;
      yookassa: boolean;
    };
    shipping: {
      cdek: boolean;
      russianPost: boolean;
      pickup: boolean;
    };
  };
  
  locale: {
    currency: string;   // ISO код (RUB, USD, EUR)
    language: string;   // ISO код (ru, en)
    timezone: string;   // IANA timezone
  };
  
  version: number;
  createdAt: string;   // ISO 8601
  updatedAt: string;
}
```

## 🔐 Переменные окружения

```env
# HTTP сервер
PORT=4000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketplace
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL=redis://localhost:6379

# Логирование
LOG_LEVEL=info
NODE_ENV=development
```

## 🚦 Запуск

```bash
# Установка зависимостей
npm install

# Разработка (с hot-reload)
npm run dev

# Продакшн
npm start
```

## 📊 Мониторинг

- **Health check**: `GET /health`
- **WebSocket stats**: `GET /api/stats/websocket`
- **Логи**: Winston logger с уровнями (error, warn, info, debug)

## 🔄 Кэширование

- **Redis TTL**: 1 час (3600 секунд)
- **Автоинвалидация** при обновлении конфига
- **Fallback** на PostgreSQL при отсутствии кэша

## 📡 Pub/Sub события

```javascript
// Redis channel: config:updated
{
  "tenantId": "electronics",
  "version": 6,
  "updatedAt": "2025-10-26T11:00:00.000Z",
  "event": "config.updated"
}
```

## 🛡️ Безопасность

- **CORS** включен для всех origins
- **Helmet** для HTTP заголовков безопасности
- **Валидация** входных данных
- **Обработка ошибок** с логированием

## 📝 Логи

```javascript
// Примеры логов
✅ Config Service running on port 4000
📊 GraphQL endpoint: http://localhost:4000/graphql
🔌 WebSocket endpoint: ws://localhost:4000/ws/config
🌐 REST API: http://localhost:4000/api/config
✅ Database connected successfully
✅ Redis client connected
Config updated for tenant: electronics, version: 6
Config cache hit for tenant: electronics
```

## 🔧 Troubleshooting

### Проблема: Config не обновляется в реальном времени
**Решение**: Проверьте WebSocket подключение и Redis Pub/Sub

### Проблема: 404 Not Found для нового магазина
**Решение**: Убедитесь что магазин создан в БД (проверьте таблицу `tenants`)

### Проблема: Дубликат subdomain
**Решение**: Subdomain должен быть уникальным, используйте другое значение

## 📚 Дополнительные ресурсы

- [GraphQL Playground](http://localhost:4000/graphql) - интерактивная документация
- [WebSocket тестер](https://www.websocket.org/echo.html) - для отладки WS
