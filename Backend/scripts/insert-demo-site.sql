-- Создание демонстрационного сайта с полной конфигурацией

-- Удалить старую конфигурацию если есть
DELETE FROM site_configs WHERE site_id = (SELECT id FROM sites WHERE domain = 'demo');

-- Вставить новую конфигурацию
INSERT INTO site_configs (
  site_id,
  theme,
  logo,
  layout,
  status,
  is_active
) VALUES (
  (SELECT id FROM sites WHERE domain = 'demo'),
  '{
    "primaryColor": "#0066cc",
    "secondaryColor": "#ff6600",
    "fontFamily": "Inter",
    "borderRadius": 8
  }'::jsonb,
  '/logo.png',
  '{
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "order": 1,
        "config": {
          "variant": "gradient",
          "title": "Добро пожаловать в Demo магазин",
          "subtitle": "Лучшие товары с доставкой по всей России",
          "ctaText": "Перейти в каталог",
          "ctaLink": "/catalog",
          "backgroundImage": "https://images.unsplash.com/photo-1557821552-17105176677c?w=1920"
        }
      },
      {
        "id": "features-1",
        "type": "features",
        "order": 2,
        "config": {
          "title": "Наши преимущества",
          "features": [
            {
              "icon": "🚚",
              "title": "Быстрая доставка",
              "description": "Доставка в ПВЗ за 1-3 дня"
            },
            {
              "icon": "💳",
              "title": "Удобная оплата",
              "description": "Оплата картой или наличными"
            },
            {
              "icon": "✨",
              "title": "Гарантия качества",
              "description": "100% оригинальные товары"
            },
            {
              "icon": "🎁",
              "title": "Бонусы и скидки",
              "description": "Программа лояльности"
            }
          ]
        }
      },
      {
        "id": "products-1",
        "type": "products",
        "order": 3,
        "config": {
          "title": "Популярные товары",
          "limit": 8,
          "variant": "grid"
        }
      },
      {
        "id": "categories-1",
        "type": "categories",
        "order": 4,
        "config": {
          "title": "Категории товаров",
          "variant": "cards"
        }
      },
      {
        "id": "banner-1",
        "type": "banner",
        "order": 5,
        "config": {
          "title": "Специальное предложение!",
          "subtitle": "Скидка 20% на первый заказ",
          "ctaText": "Получить скидку",
          "ctaLink": "/catalog",
          "backgroundColor": "#ff6600",
          "image": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800"
        }
      },
      {
        "id": "newsletter-1",
        "type": "newsletter",
        "order": 6,
        "config": {
          "title": "Подпишитесь на новости",
          "subtitle": "Получайте эксклюзивные предложения первыми",
          "placeholder": "Ваш email"
        }
      }
    ]
  }'::jsonb,
  'published',
  true
)
ON CONFLICT (site_id) DO UPDATE SET
  theme = EXCLUDED.theme,
  logo = EXCLUDED.logo,
  layout = EXCLUDED.layout,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Проверка результата
SELECT 
  s.id, 
  s.domain, 
  sc.theme->>'primaryColor' as primary_color,
  jsonb_array_length(sc.layout->'sections') as sections_count
FROM sites s
JOIN site_configs sc ON s.id = sc.site_id
WHERE s.domain = 'demo';
