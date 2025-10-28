# 🎛️ Полный справочник настроек секций

Все секции теперь имеют расширенные настройки, доступные в конструкторе сайта.

---

## 📋 Содержание

1. [Header (Шапка сайта)](#header)
2. [Hero (Главный баннер)](#hero)
3. [Products (Товары)](#products)
4. [Features (Преимущества)](#features)
5. [Categories (Категории)](#categories)
6. [Banner (Рекламный баннер)](#banner)
7. [Hot Deals (Горячие предложения)](#hot-deals)
8. [Newsletter (Подписка)](#newsletter)

---

## <a name="header"></a>🔝 Header (Шапка сайта)

### Основные настройки

| Параметр | Тип | Описание | Пример |
|----------|-----|----------|--------|
| `logoUrl` | string | URL логотипа | `/logo.png` |
| `storeName` | string | Название магазина | "Мой магазин" |
| `sticky` | boolean | Фиксированный хедер при скролле | `true` |
| `showSearch` | boolean | Показать поиск | `true` |
| `showCart` | boolean | Показать корзину | `true` |
| `showProfile` | boolean | Показать профиль пользователя | `true` |
| `backgroundColor` | string | Цвет фона | `#ffffff` |
| `textColor` | string | Цвет текста | `#000000` |

### Пример конфигурации

```json
{
  "type": "header",
  "config": {
    "logoUrl": "/logo.png",
    "storeName": "Мой Интернет-Магазин",
    "sticky": true,
    "showSearch": true,
    "showCart": true,
    "showProfile": true,
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937"
  }
}
```

---

## <a name="hero"></a>🌟 Hero (Главный баннер)

### Варианты дизайна

| Вариант | Описание | Рекомендация |
|---------|----------|--------------|
| `gradient` | Градиентный фон с анимацией | E-commerce, универсальный |
| `particles` | Анимированные частицы | Tech, стартапы |
| `waves` | Волны SVG | Lifestyle, промо |
| `geometric` | Геометрические фигуры | Modern, креатив |
| `minimal` | Минималистичный | Premium бренды |

### Все параметры

| Параметр | Тип | Описание | Значение по умолчанию |
|----------|-----|----------|-----------------------|
| `variant` | string | Вариант дизайна | `gradient` |
| `title` | string | Заголовок | - |
| `subtitle` | string | Подзаголовок | - |
| `buttonText` | string | Текст кнопки | - |
| `buttonLink` | string | Ссылка кнопки | `/catalog` |
| `gradientStart` | string | Начало градиента | `#667eea` |
| `gradientEnd` | string | Конец градиента | `#764ba2` |
| `textColor` | string | Цвет текста | `#ffffff` |
| `buttonColor` | string | Цвет кнопки | `#ffffff` |
| `buttonTextColor` | string | Цвет текста кнопки | `#667eea` |
| `backgroundColor` | string | Фон (для minimal) | `#ffffff` |

### Примеры для разных вариантов

#### Gradient Hero
```json
{
  "variant": "gradient",
  "title": "Добро пожаловать в наш магазин",
  "subtitle": "Лучшие товары по лучшим ценам",
  "buttonText": "Начать покупки",
  "buttonLink": "/catalog",
  "gradientStart": "#667eea",
  "gradientEnd": "#764ba2",
  "textColor": "#ffffff",
  "buttonColor": "#ffffff",
  "buttonTextColor": "#667eea"
}
```

#### Particles Hero (Tech-стиль)
```json
{
  "variant": "particles",
  "title": "Технологии будущего уже здесь",
  "subtitle": "Исследуйте наш каталог инноваций",
  "buttonText": "Смотреть товары",
  "gradientStart": "#1a1a2e",
  "gradientEnd": "#16213e",
  "textColor": "#ffffff"
}
```

#### Minimal Hero (Premium)
```json
{
  "variant": "minimal",
  "title": "Элегантность",
  "subtitle": "Качество в каждой детали",
  "buttonText": "Коллекция",
  "backgroundColor": "#ffffff",
  "textColor": "#1f2937"
}
```

---

## <a name="products"></a>🛍️ Products (Секция товаров)

### Основные настройки

| Параметр | Тип | Описание | Диапазон | По умолчанию |
|----------|-----|----------|----------|--------------|
| `title` | string | Заголовок секции | - | "Товары из каталога" |
| `backgroundColor` | string | Цвет фона | - | `#ffffff` |
| `layout` | string | Макет отображения | grid/carousel/list | `grid` |
| `columns` | number | Колонок в сетке | 2-6 | 4 |
| `limit` | number | Количество товаров | 1-20 | 8 |
| `filter` | string | Фильтр товаров | См. ниже | `all` |

### Фильтры товаров

- `all` - Все товары
- `popular` - Популярные
- `new` - Новинки
- `discounted` - Со скидкой
- `bestsellers` - Хиты продаж

### Дополнительные опции

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `showDiscountBadges` | boolean | Показать скидочные бейджи | `true` |
| `enableAnimations` | boolean | Анимация при появлении | `true` |
| `showOldPrice` | boolean | Показать старую цену | `true` |
| `showAddToCart` | boolean | Кнопка "В корзину" | `true` |

### Пример конфигурации

```json
{
  "type": "products",
  "config": {
    "title": "Хиты продаж",
    "backgroundColor": "#f9fafb",
    "layout": "grid",
    "columns": 4,
    "limit": 8,
    "filter": "bestsellers",
    "showDiscountBadges": true,
    "enableAnimations": true,
    "showOldPrice": true,
    "showAddToCart": true
  }
}
```

---

## <a name="features"></a>✨ Features (Преимущества)

### Настройки секции

| Параметр | Тип | Описание |
|----------|-----|----------|
| `sectionTitle` | string | Заголовок секции |
| `backgroundColor` | string | Цвет фона |
| `items` | array | Массив преимуществ |

### Структура элемента преимущества

```typescript
{
  icon: string,        // Ключ иконки: star, cart, truck, shield, zap, heart
  title: string,       // Заголовок преимущества
  description: string  // Описание
}
```

### Доступные иконки

| Ключ | Иконка | Название |
|------|--------|----------|
| `star` | ⭐ | Звезда |
| `cart` | 🛒 | Корзина |
| `truck` | 🚚 | Доставка |
| `shield` | 🛡️ | Защита |
| `zap` | ⚡ | Скорость |
| `heart` | ❤️ | Сердце |

### Пример полной конфигурации

```json
{
  "type": "features",
  "config": {
    "sectionTitle": "Почему выбирают нас",
    "backgroundColor": "#f9fafb",
    "items": [
      {
        "icon": "truck",
        "title": "Быстрая доставка",
        "description": "Доставка по всей России за 1-3 дня"
      },
      {
        "icon": "shield",
        "title": "Гарантия качества",
        "description": "Официальная гарантия на все товары"
      },
      {
        "icon": "zap",
        "title": "Выгодные цены",
        "description": "Лучшие предложения на рынке"
      }
    ]
  }
}
```

### Управление элементами в UI

- **Добавить**: Кнопка "Добавить преимущество"
- **Удалить**: Иконка корзины в каждой карточке
- **Редактировать**: Прямо в форме

---

## <a name="categories"></a>📦 Categories (Категории)

### Настройки секции

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `title` | string | Заголовок | "Категории товаров" |
| `backgroundColor` | string | Цвет фона | `#f9fafb` |
| `columns` | number | Колонок (2-6) | 4 |
| `showCount` | boolean | Показать счетчик | `true` |
| `showIcons` | boolean | Показать иконки | `true` |
| `categories` | array | Массив категорий | [] |

### Структура категории

```typescript
{
  name: string,   // Название категории
  icon: string,   // Emoji иконка
  link: string    // Ссылка на категорию
}
```

### Пример конфигурации

```json
{
  "type": "categories",
  "config": {
    "title": "Популярные категории",
    "backgroundColor": "#ffffff",
    "columns": 4,
    "showCount": true,
    "showIcons": true,
    "categories": [
      {
        "name": "Электроника",
        "icon": "📱",
        "link": "/category/electronics"
      },
      {
        "name": "Одежда",
        "icon": "👕",
        "link": "/category/clothing"
      },
      {
        "name": "Дом и сад",
        "icon": "🏡",
        "link": "/category/home"
      },
      {
        "name": "Спорт",
        "icon": "⚽",
        "link": "/category/sports"
      }
    ]
  }
}
```

---

## <a name="banner"></a>🎯 Banner (Рекламный баннер)

### Все параметры

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `title` | string | Заголовок | - |
| `description` | string | Описание | - |
| `buttonText` | string | Текст кнопки | - |
| `buttonLink` | string | Ссылка кнопки | `/promo` |
| `backgroundColor` | string | Начало градиента | `#667eea` |
| `gradientEnd` | string | Конец градиента | `#764ba2` |
| `backgroundImage` | string | URL фонового изображения | - |
| `height` | number | Высота баннера (px) | 400 |

### Пример конфигурации

```json
{
  "type": "banner",
  "config": {
    "title": "Черная пятница",
    "description": "Скидки до 70% на все категории товаров",
    "buttonText": "Смотреть акции",
    "buttonLink": "/black-friday",
    "backgroundColor": "#1f2937",
    "gradientEnd": "#4b5563",
    "height": 500
  }
}
```

---

## <a name="hot-deals"></a>🔥 Hot Deals (Горячие предложения)

### Настройки

| Параметр | Тип | Описание | Диапазон | По умолчанию |
|----------|-----|----------|----------|--------------|
| `title` | string | Заголовок | - | "🔥 Горячие предложения" |
| `backgroundColor` | string | Цвет фона | - | `#fef3c7` |
| `dealsCount` | number | Кол-во предложений | 1-6 | 3 |
| `autoRotate` | boolean | Автоматическая ротация | - | `true` |
| `rotateInterval` | number | Интервал (сек) | 3-30 | 5 |

### Пример

```json
{
  "type": "hot-deals",
  "config": {
    "title": "⚡ Молниеносные скидки",
    "backgroundColor": "#fef3c7",
    "dealsCount": 3,
    "autoRotate": true,
    "rotateInterval": 5
  }
}
```

---

## <a name="newsletter"></a>📧 Newsletter (Подписка на рассылку)

### Все параметры

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `title` | string | Заголовок | "📧 Подпишитесь на рассылку" |
| `description` | string | Описание | - |
| `placeholder` | string | Placeholder поля | "Введите ваш email" |
| `buttonText` | string | Текст кнопки | "Подписаться" |
| `backgroundColor` | string | Цвет фона | `#667eea` |
| `showPattern` | boolean | Pattern фон | `true` |
| `centerForm` | boolean | Центрировать форму | `true` |

### Пример конфигурации

```json
{
  "type": "newsletter",
  "config": {
    "title": "Будьте в курсе",
    "description": "Эксклюзивные предложения и новинки раз в неделю",
    "placeholder": "Ваш email адрес",
    "buttonText": "Подписаться",
    "backgroundColor": "#4f46e5",
    "showPattern": true,
    "centerForm": true
  }
}
```

---

## 🎨 Цветовая палитра

### Рекомендуемые градиенты

```
Синий-Фиолетовый:    #667eea → #764ba2
Розовый-Оранжевый:   #f093fb → #f5576c
Зеленый-Синий:       #4facfe → #00f2fe
Оранжевый-Красный:   #fa709a → #fee140
Темный:              #1a1a2e → #16213e
```

### Нейтральные цвета

```
Белый:        #ffffff
Светло-серый: #f9fafb
Серый:        #6b7280
Темно-серый:  #1f2937
Черный:       #000000
```

---

## 💡 Советы по использованию

### Hero секция
- **Gradient**: Универсальный, подходит всем
- **Particles**: Для tech-продуктов
- **Minimal**: Для премиум брендов
- Используйте контрастные цвета для кнопок

### Products
- **Grid**: Для большинства случаев
- **Carousel**: Когда мало места
- **4 колонки**: Оптимально для desktop
- Включайте скидочные бейджи

### Features
- **3 элемента**: Идеально для восприятия
- Используйте релевантные иконки
- Краткие, но емкие описания

### Categories
- **4-6 колонок**: Оптимально
- Используйте emoji для визуала
- Категории должны быть кликабельными

---

## 🚀 Быстрый старт

1. Откройте **localhost:3001/site-builder**
2. Добавьте секции из библиотеки компонентов
3. Кликните на секцию для редактирования
4. Настройте параметры справа
5. Сохраните изменения
6. Откройте **localhost:3003** для просмотра

---

## 🔧 Технические детали

- Все изменения сохраняются в PostgreSQL
- GraphQL API для загрузки конфигурации
- Framer Motion для анимаций
- Responsive дизайн (mobile-first)
- SSR поддержка (Next.js)

---

## 📱 Адаптивность

Все секции автоматически адаптируются:

- **Mobile** (<768px): 1-2 колонки
- **Tablet** (768-1024px): 2-3 колонки
- **Desktop** (>1024px): Полная сетка

---

## 🎯 Следующие шаги

- Экспериментируйте с настройками
- Комбинируйте разные секции
- Используйте preview для проверки
- Сохраняйте удачные комбинации

**Ваш сайт готов к настройке!** 🎉
