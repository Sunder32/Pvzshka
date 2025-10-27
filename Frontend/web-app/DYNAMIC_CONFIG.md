# Web App - Динамическая загрузка конфигурации

## 📋 Описание

Web App теперь поддерживает динамическую загрузку конфигурации для каждого магазина через Config Service. Каждый магазин (tenant) имеет свой уникальный брендинг, цвета, категории и настройки.

## 🚀 Возможности

### ✅ Реализовано

1. **ConfigServiceClient** - TypeScript клиент для работы с Config Service API
   - GET /api/config/:tenantId - загрузка конфигурации
   - GET /api/config/:tenantId/version - проверка версии
   - Кэширование конфигов (5 минут)
   - Next.js ISR поддержка

2. **ConfigProvider** - React Context для глобального доступа к конфигу
   - Автоматическое применение CSS переменных
   - Обновление favicon и title
   - Проверка обновлений (configurable interval)
   - SSR поддержка с initial config

3. **Tenant Utilities** - Утилиты для извлечения tenant ID из URL
   - Поддержка path-based routing (/market/[tenant])
   - Поддержка subdomain routing (electronics.shop.com)
   - Поддержка query parameters (?tenant=electronics)
   - Валидация tenant ID

4. **Динамические компоненты**:
   - `DynamicHeader` - шапка с брендингом магазина
   - `DynamicFooter` - футер с контактами и навигацией
   - `HeroSection` - главный баннер с настраиваемым контентом
   - `CategoriesSection` - категории товаров
   - `FeaturedProducts` - рекомендуемые товары
   - `ConfigUpdateNotifier` - уведомление об обновлениях конфига

5. **Dynamic Routing** - маршрутизация для разных магазинов
   - `/market/[tenant]/` - главная страница магазина
   - Динамические метаданные (SEO, OG tags)
   - Layout с авто-обновлением конфига

## 🔧 Конфигурация

### Переменные окружения (.env.local)

```env
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CONFIG_SERVICE_URL=http://localhost:4000
NEXT_PUBLIC_BASE_URL=http://localhost:3003

# Multi-tenancy
NEXT_PUBLIC_USE_SUBDOMAIN=false
NEXT_PUBLIC_DEFAULT_TENANT=default
```

### Структура конфигурации магазина

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
    primaryColor: string;    // Основной цвет
    secondaryColor: string;  // Дополнительный цвет
    accentColor: string;     // Акцентный цвет
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
  
  homepage: {
    hero: {
      enabled: boolean;
      title: string;
      subtitle: string;
      image: string;
      cta: { text: string; link: string; };
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
    currency: 'RUB' | 'USD' | 'EUR';
    language: 'ru' | 'en';
    timezone: string;
  };
  
  version: number;
  updatedAt: string;
}
```

## 📖 Использование

### 1. Базовое использование ConfigProvider

```tsx
// app/market/[tenant]/layout.tsx
import { ConfigProvider } from '@/lib/ConfigProvider';

export default function MarketLayout({ children, params }) {
  return (
    <ConfigProvider
      tenantId={params.tenant}
      autoRefresh={true}
      refreshInterval={60000}
    >
      {children}
    </ConfigProvider>
  );
}
```

### 2. Использование хуков в компонентах

```tsx
'use client';

import { useConfig, useBranding } from '@/lib/ConfigProvider';

function MyComponent() {
  const { config, loading, error, refetch } = useConfig();
  const branding = useBranding();
  
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;
  
  return (
    <div style={{ color: branding.primaryColor }}>
      <h1>{branding.name}</h1>
    </div>
  );
}
```

### 3. Server-side загрузка конфига

```tsx
// app/market/[tenant]/page.tsx
import { getConfigClient } from '@/lib/configClient';

export default async function MarketPage({ params }) {
  const configClient = getConfigClient();
  const config = await configClient.getConfig(params.tenant);
  
  return (
    <div>
      <h1>{config.branding.name}</h1>
    </div>
  );
}
```

### 4. Динамические метаданные

```tsx
export async function generateMetadata({ params }) {
  const config = await getConfigClient().getConfig(params.tenant);
  
  return {
    title: config.seo.title,
    description: config.seo.description,
    keywords: config.seo.keywords,
    openGraph: {
      title: config.seo.title,
      description: config.seo.description,
      images: [config.seo.ogImage],
    },
  };
}
```

## 🎨 CSS переменные

ConfigProvider автоматически применяет CSS переменные:

```css
:root {
  --primary-color: #3B82F6;
  --secondary-color: #10B981;
  --accent-color: #F59E0B;
}

/* Использование в компонентах */
.button {
  background-color: var(--primary-color);
}
```

## 🔄 Обновление конфига

### Автоматическая проверка обновлений

```tsx
<ConfigProvider
  tenantId="electronics"
  autoRefresh={true}
  refreshInterval={30000} // Проверять каждые 30 секунд
>
  {/* ... */}
</ConfigProvider>
```

### Ручная проверка обновлений

```tsx
function MyComponent() {
  const { checkForUpdates } = useConfig();
  
  const handleCheck = async () => {
    const hasUpdates = await checkForUpdates();
    if (hasUpdates) {
      console.log('Доступны обновления!');
    }
  };
  
  return <button onClick={handleCheck}>Проверить обновления</button>;
}
```

### ConfigUpdateNotifier

Автоматическое уведомление пользователей об обновлениях:

```tsx
import ConfigUpdateNotifier from '@/components/market/ConfigUpdateNotifier';

function Layout({ children }) {
  return (
    <>
      <ConfigUpdateNotifier />
      {children}
    </>
  );
}
```

## 📁 Структура файлов

```
Frontend/web-app/src/
├── lib/
│   ├── configClient.ts          # Config Service API client
│   ├── ConfigProvider.tsx        # React Context Provider
│   └── tenantUtils.ts           # Утилиты для tenant routing
├── components/market/
│   ├── DynamicHeader.tsx        # Динамическая шапка
│   ├── DynamicFooter.tsx        # Динамический футер
│   ├── HeroSection.tsx          # Главный баннер
│   ├── CategoriesSection.tsx    # Секция категорий
│   ├── FeaturedProducts.tsx     # Рекомендуемые товары
│   ├── ConfigUpdateNotifier.tsx # Уведомление об обновлениях
│   └── index.ts                 # Exports
└── app/market/[tenant]/
    ├── layout.tsx               # Layout с ConfigProvider
    └── page.tsx                 # Главная страница магазина
```

## 🧪 Тестирование

### Тест разных магазинов

```bash
# Магазин электроники
http://localhost:3003/market/electronics

# Книжный магазин
http://localhost:3003/market/books

# Магазин одежды
http://localhost:3003/market/fashion
```

### Тест с query параметром

```bash
http://localhost:3003?tenant=electronics
```

### Тест с subdomain (требуется настройка hosts)

```bash
# Добавить в /etc/hosts или C:\Windows\System32\drivers\etc\hosts
127.0.0.1 electronics.localhost
127.0.0.1 books.localhost

# Открыть
http://electronics.localhost:3003
```

## 📊 Производительность

- **Кэширование**: Конфиги кэшируются на 5 минут
- **Next.js ISR**: Server-side кэширование с revalidate: 300
- **Redis cache**: Config Service использует Redis для быстрого доступа
- **WebSocket**: Real-time уведомления об изменениях (опционально)

## 🐛 Troubleshooting

### Проблема: Конфиг не загружается

**Решение**: Проверьте переменные окружения и доступность Config Service:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/config/electronics
```

### Проблема: CSS переменные не применяются

**Решение**: Убедитесь что ConfigProvider обертывает ваши компоненты:

```tsx
<ConfigProvider tenantId="electronics">
  <YourComponent />
</ConfigProvider>
```

### Проблема: Старая версия конфига

**Решение**: Очистите кэш:

```tsx
const configClient = getConfigClient();
configClient.clearCache('electronics');
```

## 🚀 Следующие шаги

- [ ] WebSocket поддержка для real-time обновлений
- [ ] Оффлайн режим с Service Worker
- [ ] A/B тестирование конфигов
- [ ] Версионирование и откат конфигов
- [ ] Аналитика использования конфигов

## 📝 Примечания

- Конфиг загружается при первом рендере layout
- SSR поддержка позволяет SEO-оптимизацию
- Изменения в Config Service автоматически применяются при следующей загрузке
- Для production рекомендуется использовать CDN для статических ресурсов (logo, images)
