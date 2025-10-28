# 🎨 Варианты дизайна Hero секции

Система поддерживает несколько современных вариантов дизайна для Hero секции. Вариант выбирается через параметр `variant` в конфигурации секции.

## Доступные варианты

### 1. **Gradient** (по умолчанию)
```json
{
  "variant": "gradient",
  "title": "Добро пожаловать",
  "subtitle": "Лучший магазин для ваших покупок",
  "buttonText": "Начать покупки",
  "gradientStart": "#667eea",
  "gradientEnd": "#764ba2",
  "textColor": "#ffffff",
  "buttonColor": "#ffffff",
  "buttonTextColor": "#667eea"
}
```

**Особенности:**
- Анимированный градиентный фон
- Плавающие фоновые элементы (blur circles)
- Parallax эффект при скролле
- Fade out эффект при прокрутке
- Анимация появления текста снизу вверх
- Hover эффекты на кнопке

---

### 2. **Particles** (частицы)
```json
{
  "variant": "particles",
  "title": "Исследуйте наш каталог",
  "subtitle": "Тысячи товаров ждут вас",
  "buttonText": "Смотреть товары",
  "gradientStart": "#1a1a2e",
  "gradientEnd": "#16213e",
  "textColor": "#ffffff"
}
```

**Особенности:**
- Темный футуристичный фон
- 20 анимированных частиц с разной скоростью
- Floating эффект для частиц
- Scale in анимация для заголовка
- Современный tech-стиль

---

### 3. **Waves** (волны)
```json
{
  "variant": "waves",
  "title": "Волна скидок",
  "subtitle": "Специальные предложения каждый день",
  "buttonText": "Посмотреть акции",
  "gradientStart": "#4f46e5",
  "textColor": "#ffffff"
}
```

**Особенности:**
- Анимированные SVG волны внизу секции
- Морфинг волн (меняют форму)
- Spring анимация для заголовка (упругий эффект)
- Scale from zero для кнопки
- Плавные переходы

---

### 4. **Geometric** (геометрические фигуры)
```json
{
  "variant": "geometric",
  "title": "Стильный шопинг",
  "subtitle": "Современные решения для современных людей",
  "buttonText": "Перейти в каталог",
  "gradientStart": "#667eea",
  "gradientEnd": "#764ba2",
  "textColor": "#ffffff"
}
```

**Особенности:**
- Вращающиеся геометрические фигуры (квадраты, круги)
- Разная скорость вращения (20s, 15s, 5s)
- Пульсирующий эффект для центрального круга
- 3D Rotate эффект для заголовка
- Wiggle эффект на hover кнопки

---

### 5. **Minimal** (минималистичный)
```json
{
  "variant": "minimal",
  "title": "Простота",
  "subtitle": "Качество без лишнего",
  "buttonText": "В каталог",
  "backgroundColor": "#ffffff",
  "textColor": "#1f2937"
}
```

**Особенности:**
- Чистый белый фон
- Letter spacing анимация для заголовка
- Крупный типографичный шрифт (8xl)
- Минималистичный стиль
- Акцент на типографике
- Идеален для премиум брендов

---

## 🎬 Общие анимации для всех вариантов

### Текстовые элементы:
- **Заголовок**: Fade in + Slide up (0.8s)
- **Подзаголовок**: Fade in с задержкой (0.3s)
- **Кнопка**: Появление с задержкой (0.4-0.6s)

### Hover эффекты:
- **Кнопки**: Scale 1.05 + Shadow увеличение
- **Карточки**: Lift up (-10px) + Shadow
- **Иконки**: Scale 1.2 + Rotate

### whileInView анимации:
Все элементы анимируются при появлении в viewport (once: true)

---

## 📦 Улучшенные секции

### Products Section
**Новые фичи:**
- 8 товаров с градиентными плейсхолдерами
- Animated discount badges (rotate + scale)
- Staggered animation (задержка 0.1s между карточками)
- Hover lift эффект (-10px)
- Современные тени (0 20px 40px rgba)
- Скидочные бейджи с анимацией

### Features Section
**Улучшения:**
- Радиальный градиент фон при hover
- Анимация иконок: scale + rotate
- Staggered появление (0.15s delay)
- Современные карточки с большими иконками (64px)
- Тени при наведении

### Banner Section
**Анимации:**
- Пульсирующие круги на фоне
- Разные скорости анимации (4s, 5s)
- Gradient фон
- Staggered content появление

### Hot Deals Section
**Особенности:**
- Желтый gradient фон (#fef3c7 → #fde68a)
- Wiggling иконки (rotate animation)
- Hover с изменением фона
- Staggered cards (0.15s)

### Newsletter Section
**Улучшения:**
- Dot pattern фон
- Flexbox форма (responsive)
- Scale + shadow эффекты на кнопке
- Gradient фон с pattern

---

## 🚀 Как использовать

### В Global Admin (Site Builder):

1. Откройте конструктор сайта
2. Добавьте Hero секцию
3. В настройках секции добавьте параметр `variant`:

```json
{
  "variant": "particles",
  "title": "Ваш текст",
  "subtitle": "Подзаголовок",
  "buttonText": "Кнопка",
  "gradientStart": "#цвет1",
  "gradientEnd": "#цвет2"
}
```

4. Сохраните конфигурацию
5. Откройте localhost:3003 для просмотра

---

## 🎨 Рекомендации по использованию

- **E-commerce**: `gradient` или `minimal`
- **Tech/Стартапы**: `particles` или `geometric`
- **Lifestyle/Fashion**: `minimal`
- **Промо/Акции**: `waves` или `gradient`
- **Premium бренды**: `minimal`

---

## 🛠 Технические детали

**Библиотека анимаций**: Framer Motion 10.16.5

**Производительность**:
- Hardware acceleration (transform, opacity)
- RequestAnimationFrame
- Viewport optimization (once: true)
- Debounced scroll events

**Совместимость**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

**Размер bundle**:
- Framer Motion: ~60KB gzipped
- Код анимаций: ~15KB

---

## 📱 Responsive дизайн

Все варианты полностью адаптивны:
- Mobile: text-6xl → text-7xl
- Tablet: grid-cols-1 → grid-cols-3
- Desktop: Полные эффекты

---

## 🎯 Следующие шаги

1. Протестируйте разные варианты
2. Настройте цвета под ваш бренд
3. Добавьте свои тексты
4. Экспериментируйте с комбинациями секций

**Сайт доступен**: http://localhost:3003
