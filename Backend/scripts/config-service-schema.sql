-- Config Service Schema
-- Таблица для хранения динамических конфигураций магазинов

CREATE TABLE IF NOT EXISTS tenant_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Версионирование
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Брендинг
    branding JSONB NOT NULL DEFAULT '{
        "siteName": "My Store",
        "logoUrl": "",
        "faviconUrl": "",
        "primaryColor": "#3B82F6",
        "secondaryColor": "#10B981",
        "accentColor": "#F59E0B"
    }'::jsonb,
    
    -- Настройки макета
    layout JSONB NOT NULL DEFAULT '{
        "headerStyle": "classic",
        "footerStyle": "default",
        "productsPerPage": 24,
        "enableSearch": true,
        "enableFilters": true,
        "enableWishlist": true
    }'::jsonb,
    
    -- Функциональность
    features JSONB NOT NULL DEFAULT '{
        "enableReviews": true,
        "enableRatings": true,
        "enableChat": false,
        "enableLoyalty": false,
        "enableSubscriptions": false,
        "enableMultiCurrency": false,
        "enableMultiLanguage": false
    }'::jsonb,
    
    -- Главная страница
    homepage JSONB NOT NULL DEFAULT '{
        "heroSection": {
            "enabled": true,
            "title": "Welcome to Our Store",
            "subtitle": "Discover amazing products",
            "ctaText": "Shop Now",
            "ctaLink": "/catalog",
            "backgroundImage": ""
        },
        "featuredCategories": [],
        "featuredProducts": [],
        "banners": []
    }'::jsonb,
    
    -- SEO настройки
    seo JSONB NOT NULL DEFAULT '{
        "metaTitle": "",
        "metaDescription": "",
        "metaKeywords": "",
        "ogImage": "",
        "twitterCard": "summary_large_image"
    }'::jsonb,
    
    -- Интеграции
    integrations JSONB NOT NULL DEFAULT '{
        "analytics": {
            "googleAnalytics": "",
            "yandexMetrika": "",
            "facebookPixel": ""
        },
        "social": {
            "facebook": "",
            "instagram": "",
            "twitter": "",
            "telegram": "",
            "whatsapp": ""
        },
        "payment": {
            "stripe": false,
            "paypal": false,
            "yookassa": false
        },
        "shipping": {
            "russianPost": false,
            "cdek": false,
            "boxberry": false
        }
    }'::jsonb,
    
    -- Локализация
    locale JSONB NOT NULL DEFAULT '{
        "language": "ru",
        "currency": "RUB",
        "timezone": "Europe/Moscow",
        "dateFormat": "DD.MM.YYYY",
        "timeFormat": "HH:mm"
    }'::jsonb,
    
    -- Контактная информация
    contact_info JSONB NOT NULL DEFAULT '{
        "email": "",
        "phone": "",
        "address": "",
        "workingHours": ""
    }'::jsonb,
    
    -- Метаданные
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальность: один конфиг на один tenant
    UNIQUE(tenant_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tenant_configs_tenant_id ON tenant_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_configs_active ON tenant_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_configs_version ON tenant_configs(version);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_tenant_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tenant_config_timestamp
    BEFORE UPDATE ON tenant_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_config_timestamp();

-- Комментарии для документации
COMMENT ON TABLE tenant_configs IS 'Динамические конфигурации для каждого магазина (tenant)';
COMMENT ON COLUMN tenant_configs.version IS 'Версия конфига, автоматически увеличивается при обновлении';
COMMENT ON COLUMN tenant_configs.branding IS 'Настройки брендинга: цвета, логотип, название';
COMMENT ON COLUMN tenant_configs.layout IS 'Настройки макета и отображения';
COMMENT ON COLUMN tenant_configs.features IS 'Включенные/выключенные функции магазина';
COMMENT ON COLUMN tenant_configs.homepage IS 'Настройки главной страницы';
COMMENT ON COLUMN tenant_configs.seo IS 'SEO метатеги и настройки';
COMMENT ON COLUMN tenant_configs.integrations IS 'Интеграции с внешними сервисами';
COMMENT ON COLUMN tenant_configs.locale IS 'Настройки локализации';

-- Вставка тестовых данных
INSERT INTO tenant_configs (tenant_id, branding, homepage, integrations, contact_info)
SELECT 
    t.id,
    jsonb_build_object(
        'siteName', t.name,
        'logoUrl', '',
        'faviconUrl', '',
        'primaryColor', '#3B82F6',
        'secondaryColor', '#10B981',
        'accentColor', '#F59E0B'
    ),
    jsonb_build_object(
        'heroSection', jsonb_build_object(
            'enabled', true,
            'title', 'Добро пожаловать в ' || t.name,
            'subtitle', 'Откройте для себя удивительные товары',
            'ctaText', 'В каталог',
            'ctaLink', '/catalog',
            'backgroundImage', ''
        ),
        'featuredCategories', '[]'::jsonb,
        'featuredProducts', '[]'::jsonb,
        'banners', '[]'::jsonb
    ),
    jsonb_build_object(
        'analytics', jsonb_build_object(
            'googleAnalytics', '',
            'yandexMetrika', '',
            'facebookPixel', ''
        ),
        'social', jsonb_build_object(
            'facebook', '',
            'instagram', '',
            'twitter', '',
            'telegram', '',
            'whatsapp', ''
        ),
        'payment', jsonb_build_object(
            'stripe', false,
            'paypal', false,
            'yookassa', false
        ),
        'shipping', jsonb_build_object(
            'russianPost', false,
            'cdek', false,
            'boxberry', false
        )
    ),
    jsonb_build_object(
        'email', '',
        'phone', '',
        'address', '',
        'workingHours', 'Пн-Пт: 9:00-18:00'
    )
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM tenant_configs tc WHERE tc.tenant_id = t.id
);
