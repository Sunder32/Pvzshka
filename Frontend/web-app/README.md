# Frontend Web App

Next.js PWA приложение для мульти-тенантной платформы маркетплейсов.

## Технологии

- **Next.js 14** - React фреймворк с SSR/SSG
- **TypeScript** - Типизация
- **Apollo Client 3.8** - GraphQL клиент
- **Zustand 4.4** - State management
- **Tailwind CSS 3.3** - Утилитарные стили
- **Lucide React** - Иконки
- **React Hook Form + Zod** - Формы и валидация
- **next-pwa** - PWA поддержка

## Возможности

### Главная страница
- Server-Driven UI из Config Service
- Динамические секции (баннеры, карусели, категории)
- Персонализированный контент

### Каталог товаров
- ✅ Поиск по названию
- ✅ Фильтры по категориям
- ✅ Добавление в корзину
- ✅ Статус наличия

### Корзина
- ✅ Управление количеством
- ✅ Удаление товаров
- ✅ Расчет итоговой суммы
- ✅ Drawer интерфейс

### Оформление заказа
- ✅ Форма контактных данных
- ✅ Выбор способа доставки (ПВЗ / Курьер)
- ✅ Выбор способа оплаты
- ✅ Итоговая стоимость с доставкой

### Личный кабинет
- ✅ Профиль пользователя
- ✅ История заказов
- ✅ Редактирование данных

### Аутентификация
- ✅ Вход / Регистрация
- ✅ JWT токены в localStorage
- ✅ Защищенные маршруты

### PWA
- ✅ Web App Manifest
- ✅ Иконки для всех размеров
- ✅ Offline-ready (next-pwa)
- ✅ Installable на устройства

## Установка и запуск

### Установка зависимостей

```bash
npm install
```

### Запуск dev-сервера

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`

### Сборка для production

```bash
npm run build
npm start
```

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Корневой layout
│   ├── page.tsx           # Главная страница
│   ├── catalog/
│   │   └── page.tsx       # Каталог товаров
│   ├── checkout/
│   │   └── page.tsx       # Оформление заказа
│   ├── orders/
│   │   └── page.tsx       # История заказов
│   ├── profile/
│   │   └── page.tsx       # Профиль пользователя
│   └── login/
│       └── page.tsx       # Вход/Регистрация
│
├── components/             # Компоненты
│   ├── Header.tsx         # Шапка с навигацией
│   ├── Cart.tsx           # Drawer корзины
│   ├── providers.tsx      # Apollo Provider
│   ├── dynamic/           # Server-Driven UI
│   │   ├── DynamicHomePage.tsx
│   │   └── DynamicSection.tsx
│   └── sections/          # Секции для главной
│       ├── HeroBanner.tsx
│       ├── ProductCarousel.tsx
│       ├── ProductGrid.tsx
│       ├── CategoryList.tsx
│       └── SearchBar.tsx
│
├── store/                  # Zustand stores
│   ├── cart.ts            # Корзина
│   └── auth.ts            # Аутентификация
│
├── lib/                    # Утилиты
│   ├── apollo-client.ts   # Apollo Client config
│   ├── config.ts          # Конфигурация
│   └── tenant.ts          # Multi-tenancy
│
└── public/                 # Статика
    ├── manifest.json      # PWA Manifest
    └── icons/             # PWA Icons
```

## Переменные окружения

Создайте `.env.local`:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_TENANT_ID=default
```

## Интеграция с Backend

### GraphQL (Config Service)
```typescript
import { apolloClient } from '@/lib/apollo-client'
import { gql } from '@apollo/client'

const GET_CONFIG = gql`
  query GetConfig($tenantId: String!) {
    tenantConfig(tenantId: $tenantId) {
      pages {
        path
        sections {
          type
          props
        }
      }
    }
  }
`

const { data } = await apolloClient.query({
  query: GET_CONFIG,
  variables: { tenantId },
})
```

### REST API (Catalog Service)
```typescript
const response = await fetch('/api/products')
const products = await response.json()
```

## PWA Features

### Service Worker
Автоматически генерируется через `next-pwa`.

### Offline Support
- Кэширование страниц
- IndexedDB для данных
- Background sync для заказов

### Install Prompt
```typescript
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  // Show custom install button
})
```

## Deployment

### Vercel
```bash
vercel --prod
```

### Docker
```bash
docker build -t marketplace-web .
docker run -p 3000:3000 marketplace-web
```

## Лицензия

Proprietary
