-- Site Builder Database Schema

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  custom_domain VARCHAR(255),
  description TEXT,
  logo TEXT,
  favicon TEXT,
  theme JSONB NOT NULL DEFAULT '{
    "primaryColor": "#0066cc",
    "secondaryColor": "#ff6600",
    "fontFamily": "Inter",
    "borderRadius": 8
  }',
  features JSONB NOT NULL DEFAULT '{
    "enablePVZ": true,
    "enableMarketplace": true,
    "enableReviews": true
  }',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Site Configurations table
CREATE TABLE IF NOT EXISTS site_configs (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  logo TEXT,
  theme JSONB NOT NULL DEFAULT '{
    "primaryColor": "#0066cc",
    "secondaryColor": "#ff6600",
    "fontFamily": "Inter",
    "borderRadius": 8
  }',
  layout JSONB NOT NULL DEFAULT '{
    "header": {
      "showLogo": true,
      "showSearch": true,
      "showCart": true,
      "menu": []
    },
    "footer": {
      "showNewsletter": true,
      "showSocial": true,
      "columns": []
    },
    "sections": []
  }',
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain);
CREATE INDEX idx_site_configs_tenant ON site_configs(tenant_id);
CREATE INDEX idx_site_configs_status ON site_configs(status);

-- Insert demo tenant
INSERT INTO tenants (name, subdomain, description, logo, theme, features)
VALUES (
  'Demo Store',
  'demo',
  'Демонстрационный магазин',
  NULL,
  '{
    "primaryColor": "#0066cc",
    "secondaryColor": "#ff6600",
    "fontFamily": "Inter",
    "borderRadius": 8
  }',
  '{
    "enablePVZ": true,
    "enableMarketplace": true,
    "enableReviews": true
  }'
) ON CONFLICT (subdomain) DO NOTHING;

-- Insert default site configuration for demo tenant
INSERT INTO site_configs (tenant_id, theme, layout, status)
SELECT 
  t.id,
  '{
    "primaryColor": "#0066cc",
    "secondaryColor": "#ff6600",
    "fontFamily": "Inter",
    "borderRadius": 8
  }',
  '{
    "header": {
      "showLogo": true,
      "showSearch": true,
      "showCart": true,
      "menu": [
        {"label": "Каталог", "url": "/catalog", "icon": "grid"},
        {"label": "О нас", "url": "/about", "icon": "info"}
      ]
    },
    "footer": {
      "showNewsletter": true,
      "showSocial": true,
      "columns": [
        {
          "title": "Компания",
          "links": [
            {"label": "О нас", "url": "/about"},
            {"label": "Контакты", "url": "/contacts"}
          ]
        }
      ]
    },
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "order": 0,
        "visible": true,
        "config": {
          "title": "Добро пожаловать в наш магазин",
          "subtitle": "Лучшие товары по выгодным ценам",
          "backgroundImage": "",
          "showButton": true,
          "buttonText": "Перейти в каталог",
          "buttonLink": "/catalog"
        }
      },
      {
        "id": "categories-1",
        "type": "categories",
        "order": 1,
        "visible": true,
        "config": {
          "title": "Категории товаров",
          "columns": 4,
          "showCount": true
        }
      },
      {
        "id": "products-1",
        "type": "products",
        "order": 2,
        "visible": true,
        "config": {
          "title": "Популярные товары",
          "layout": "grid",
          "columns": 4,
          "limit": 8,
          "filter": "popular"
        }
      }
    ]
  }',
  'published'
FROM tenants t
WHERE t.subdomain = 'demo'
ON CONFLICT DO NOTHING;
