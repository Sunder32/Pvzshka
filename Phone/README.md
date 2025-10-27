# Marketplace Mobile App

React Native мобильное приложение для multi-tenant маркетплейса с ПВЗ.

## Технологии

- **React Native 0.73** + **Expo 50** - фреймворк
- **Expo Router** - файловая навигация
- **WatermelonDB** - локальная база данных для offline-first
- **Zustand** - управление состоянием
- **CodePush** - OTA обновления
- **expo-camera** - сканирование QR кодов
- **expo-local-authentication** - биометрическая аутентификация
- **react-native-maps** - карты с ПВЗ
- **Axios** - HTTP клиент

## Установка

```powershell
cd Phone
npm install
```

## Запуск

### Development

```powershell
# Android
npx expo run:android

# iOS
npx expo run:ios

# Expo Go
npx expo start
```

### Production Build

```powershell
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

## Структура

```
app/
  (tabs)/             # Tab navigation
    index.tsx         # Главная (Server-Driven UI)
    catalog.tsx       # Каталог товаров
    cart.tsx          # Корзина
    orders.tsx        # Заказы
    profile.tsx       # Профиль
  _layout.tsx         # Root layout
  login.tsx           # Вход/Регистрация
  checkout.tsx        # Оформление заказа
  qr-scanner.tsx      # QR сканер
src/
  components/
    DynamicSection.tsx # Server-Driven UI компонент
  database/
    index.ts          # WatermelonDB setup
    schema.ts         # Database schema
    models/           # WatermelonDB модели
      Product.ts
      Order.ts
      CartItem.ts
  store/
    auth.ts           # Auth store (Zustand)
    cart.ts           # Cart store (Zustand)
```

## Основные функции

### 1. Server-Driven UI
Главный экран отображает динамический контент с сервера:
- Баннеры
- Карусели товаров
- Категории
- Промо-блоки

### 2. Offline-First
WatermelonDB обеспечивает:
- Работу без интернета
- Кэширование товаров
- Синхронизацию при подключении
- Быстрый доступ к данным

### 3. Биометрическая аутентификация
- Face ID (iOS)
- Touch ID (iOS/Android)
- Fingerprint (Android)

### 4. QR сканер
Сканирование QR кодов для:
- Получения заказа в ПВЗ
- Быстрого доступа к товару

### 5. Интеграция с картами
- Поиск ближайших ПВЗ
- Построение маршрута
- Информация о графике работы

### 6. CodePush
OTA обновления без ребилда:
- Мгновенные исправления
- A/B тестирование
- Rollback при ошибках

## Конфигурация

### Environment Variables

Создайте `.env` файл:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### CodePush Deployment Keys

В `app.json` укажите ключи:
```json
"android": {
  "codePush": {
    "deploymentKey": "your-android-deployment-key"
  }
},
"ios": {
  "codePush": {
    "deploymentKey": "your-ios-deployment-key"
  }
}
```

## Скрипты

```json
{
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web"
}
```

## Архитектура

### State Management
- **Zustand** для глобального состояния (auth, cart)
- **WatermelonDB** для персистентных данных
- **React Query** для server state (планируется)

### Navigation
Expo Router (file-based):
- `(tabs)/` - Tab navigation
- Stack навигация по умолчанию
- Deep linking support

### Styling
- StyleSheet API (React Native)
- Shared theme constants
- Responsive design для разных размеров экранов

## Требования

- Node.js 18+
- npm или yarn
- Android Studio (для Android)
- Xcode (для iOS, только macOS)
- EAS CLI (для production builds)

## License

MIT
