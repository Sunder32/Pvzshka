-- Add pages configuration to site_configs table

-- Add pages column to store page configurations
ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS pages JSONB DEFAULT '[]'::jsonb;

-- Create index for pages
CREATE INDEX IF NOT EXISTS idx_site_configs_pages ON site_configs USING GIN (pages);

COMMENT ON COLUMN site_configs.pages IS 'Pages configuration (catalog, profile, cart, etc.)';

-- Update existing records with default pages structure
UPDATE site_configs 
SET pages = '[
  {
    "id": "catalog",
    "name": "Каталог",
    "slug": "/catalog",
    "title": "Каталог товаров",
    "description": "Список всех товаров с фильтрами и сортировкой",
    "isEnabled": true,
    "icon": "📦",
    "showInMenu": true,
    "menuOrder": 1,
    "sections": []
  },
  {
    "id": "profile",
    "name": "Профиль",
    "slug": "/profile",
    "title": "Личный кабинет",
    "description": "Управление профилем пользователя",
    "isEnabled": true,
    "icon": "👤",
    "showInMenu": true,
    "menuOrder": 2,
    "sections": []
  },
  {
    "id": "cart",
    "name": "Корзина",
    "slug": "/cart",
    "title": "Корзина покупок",
    "description": "Товары добавленные в корзину",
    "isEnabled": true,
    "icon": "🛒",
    "showInMenu": true,
    "menuOrder": 3,
    "sections": []
  },
  {
    "id": "favorites",
    "name": "Избранное",
    "slug": "/favorites",
    "title": "Избранные товары",
    "description": "Список избранных товаров",
    "isEnabled": true,
    "icon": "❤️",
    "showInMenu": true,
    "menuOrder": 4,
    "sections": []
  },
  {
    "id": "orders",
    "name": "Заказы",
    "slug": "/orders",
    "title": "Мои заказы",
    "description": "История заказов пользователя",
    "isEnabled": true,
    "icon": "📋",
    "showInMenu": true,
    "menuOrder": 5,
    "sections": []
  },
  {
    "id": "about",
    "name": "О компании",
    "slug": "/about",
    "title": "О нас",
    "description": "Информация о компании",
    "isEnabled": true,
    "icon": "ℹ️",
    "showInMenu": true,
    "menuOrder": 6,
    "sections": []
  },
  {
    "id": "contacts",
    "name": "Контакты",
    "slug": "/contacts",
    "title": "Контактная информация",
    "description": "Способы связи с нами",
    "isEnabled": true,
    "icon": "📞",
    "showInMenu": true,
    "menuOrder": 7,
    "sections": []
  }
]'::jsonb
WHERE pages IS NULL OR pages = '[]'::jsonb;
