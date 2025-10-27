-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    image_url TEXT,
    images JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Индексы для products
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();

CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Тестовые данные: Категории для electronics
INSERT INTO categories (tenant_id, name, slug, description, icon, sort_order) VALUES
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Smartphones', 'smartphones', 'Latest smartphones and mobile devices', '📱', 1),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Laptops', 'laptops', 'Powerful laptops and notebooks', '💻', 2),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Tablets', 'tablets', 'Tablets and iPads', '📲', 3),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Accessories', 'accessories', 'Phone and laptop accessories', '🎧', 4),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Wearables', 'wearables', 'Smart watches and fitness trackers', '⌚', 5),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Gaming', 'gaming', 'Gaming consoles and accessories', '🎮', 6);

-- Получим ID категорий для создания товаров
DO $$
DECLARE
    cat_smartphones UUID;
    cat_laptops UUID;
    cat_tablets UUID;
    cat_accessories UUID;
    cat_wearables UUID;
BEGIN
    SELECT id INTO cat_smartphones FROM categories WHERE slug = 'smartphones' AND tenant_id = '87b9f436-d30d-406e-be1d-8f1123d77d90';
    SELECT id INTO cat_laptops FROM categories WHERE slug = 'laptops' AND tenant_id = '87b9f436-d30d-406e-be1d-8f1123d77d90';
    SELECT id INTO cat_tablets FROM categories WHERE slug = 'tablets' AND tenant_id = '87b9f436-d30d-406e-be1d-8f1123d77d90';
    SELECT id INTO cat_accessories FROM categories WHERE slug = 'accessories' AND tenant_id = '87b9f436-d30d-406e-be1d-8f1123d77d90';
    SELECT id INTO cat_wearables FROM categories WHERE slug = 'wearables' AND tenant_id = '87b9f436-d30d-406e-be1d-8f1123d77d90';

    -- Товары для electronics
    INSERT INTO products (tenant_id, category_id, name, slug, description, short_description, price, compare_at_price, sku, stock_quantity, is_featured, image_url) VALUES
    -- Smartphones
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_smartphones, 'iPhone 15 Pro', 'iphone-15-pro', 'Latest iPhone with titanium design and A17 Pro chip', 'Premium flagship smartphone', 999.99, 1099.99, 'IP15PRO-256', 45, true, 'https://images.unsplash.com/photo-1696446702547-f10e57f-0ae82d?w=400'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_smartphones, 'Samsung Galaxy S24 Ultra', 'samsung-s24-ultra', 'Powerful Android flagship with S Pen', 'Top-tier Android phone', 899.99, 999.99, 'SGS24U-512', 38, true, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_smartphones, 'Google Pixel 8 Pro', 'google-pixel-8-pro', 'Best camera phone with AI features', 'Photography enthusiast choice', 799.99, NULL, 'GPX8PRO-256', 52, true, 'https://images.unsplash.com/photo-1598327105666-5b89351-aef97b?w=400'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_smartphones, 'OnePlus 12', 'oneplus-12', 'Fast charging flagship killer', 'Value flagship phone', 699.99, NULL, 'OP12-256', 67, false, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
    
    -- Laptops
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_laptops, 'MacBook Pro 16"', 'macbook-pro-16', 'Apple M3 Max chip, 36GB RAM, 1TB SSD', 'Ultimate creative workstation', 2499.99, NULL, 'MBP16-M3MAX', 23, true, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_laptops, 'Dell XPS 15', 'dell-xps-15', 'Intel i9, 32GB RAM, RTX 4060', 'Premium Windows laptop', 1799.99, 1999.99, 'DXPS15-I9', 18, true, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_laptops, 'Lenovo ThinkPad X1 Carbon', 'thinkpad-x1-carbon', 'Business ultrabook, i7, 16GB RAM', 'Professional business laptop', 1399.99, NULL, 'TPX1C-I7', 31, false, 'https://images.unsplash.com/photo-1588702547923-7093a6c3-9787fe?w=400'),
    
    -- Tablets
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_tablets, 'iPad Air M2', 'ipad-air-m2', '11-inch Liquid Retina, M2 chip', 'Versatile tablet for work and play', 599.99, NULL, 'IPAD-AIRM2', 42, true, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_tablets, 'Samsung Galaxy Tab S9', 'galaxy-tab-s9', 'Android tablet with S Pen included', 'Premium Android tablet', 499.99, 599.99, 'SGTABS9-256', 35, false, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400'),
    
    -- Accessories
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_accessories, 'AirPods Pro (2nd gen)', 'airpods-pro-2', 'Active noise cancellation, USB-C', 'Premium wireless earbuds', 249.99, NULL, 'APP2-USBC', 156, true, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_accessories, 'Sony WH-1000XM5', 'sony-wh-1000xm5', 'Industry-leading noise cancellation', 'Best over-ear headphones', 349.99, 399.99, 'SONYWH1000XM5', 89, true, 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_accessories, 'Logitech MX Master 3S', 'logitech-mx-master-3s', 'Ergonomic wireless mouse', 'Professional productivity mouse', 99.99, NULL, 'LOGMXM3S', 124, false, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
    
    -- Wearables
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_wearables, 'Apple Watch Series 9', 'apple-watch-9', 'S9 chip, Always-On display, GPS', 'Advanced smartwatch', 399.99, NULL, 'AWS9-GPS', 78, true, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca186?w=400'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_wearables, 'Garmin Fenix 7', 'garmin-fenix-7', 'Multisport GPS smartwatch', 'Outdoor adventure watch', 599.99, NULL, 'GARF7-GPS', 45, false, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400');
END $$;

-- Категории для books
INSERT INTO categories (tenant_id, name, slug, description, icon, sort_order) VALUES
('49de2553-0c51-457f-bd71-817ad1d979bf', 'Fiction', 'fiction', 'Novels and fiction books', '📚', 1),
('49de2553-0c51-457f-bd71-817ad1d979bf', 'Non-Fiction', 'non-fiction', 'Educational and reference books', '📖', 2),
('49de2553-0c51-457f-bd71-817ad1d979bf', 'Science', 'science', 'Scientific literature', '🔬', 3),
('49de2553-0c51-457f-bd71-817ad1d979bf', 'Self-Help', 'self-help', 'Personal development books', '💡', 4);

-- Товары для books (упрощенно)
INSERT INTO products (tenant_id, category_id, name, slug, description, price, sku, stock_quantity, is_featured) 
SELECT 
    '49de2553-0c51-457f-bd71-817ad1d979bf',
    id,
    'Sample Book in ' || name,
    'sample-' || slug,
    'Great book in ' || name || ' category',
    CASE 
        WHEN slug = 'fiction' THEN 24.99
        WHEN slug = 'non-fiction' THEN 29.99
        WHEN slug = 'science' THEN 39.99
        ELSE 19.99
    END,
    'BOOK-' || UPPER(slug),
    FLOOR(RANDOM() * 100 + 50)::INTEGER,
    RANDOM() < 0.5
FROM categories 
WHERE tenant_id = '49de2553-0c51-457f-bd71-817ad1d979bf';

-- Категории для fashion
INSERT INTO categories (tenant_id, name, slug, description, icon, sort_order) VALUES
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', 'Clothing', 'clothing', 'Men and women clothing', '👔', 1),
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', 'Shoes', 'shoes', 'Footwear collection', '👟', 2),
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', 'Accessories', 'accessories-fashion', 'Fashion accessories', '👜', 3);

-- Товары для fashion
INSERT INTO products (tenant_id, category_id, name, slug, description, price, sku, stock_quantity, is_featured)
SELECT 
    'fac2e1fd-52c5-4457-9a70-ce1020de71d7',
    id,
    'Trendy ' || name || ' Item',
    'trendy-' || slug,
    'Fashionable ' || name,
    FLOOR(RANDOM() * 200 + 50)::DECIMAL(10,2),
    'FASH-' || UPPER(slug),
    FLOOR(RANDOM() * 150 + 30)::INTEGER,
    RANDOM() < 0.5
FROM categories 
WHERE tenant_id = 'fac2e1fd-52c5-4457-9a70-ce1020de71d7';
