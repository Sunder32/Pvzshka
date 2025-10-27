-- Очистка старых данных
DELETE FROM products WHERE tenant_id IN ('87b9f436-d30d-406e-be1d-8f1123d77d90', '49de2553-0c51-457f-bd71-817ad1d979bf', 'fac2e1fd-52c5-4457-9a70-ce1020de71d7');
DELETE FROM categories WHERE tenant_id IN ('87b9f436-d30d-406e-be1d-8f1123d77d90', '49de2553-0c51-457f-bd71-817ad1d979bf', 'fac2e1fd-52c5-4457-9a70-ce1020de71d7');

-- Категории для electronics
INSERT INTO categories (tenant_id, name, slug, description, sort_order, metadata) VALUES
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Smartphones', 'smartphones', 'Latest smartphones and mobile devices', 1, '{"icon": "📱"}'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Laptops', 'laptops', 'Powerful laptops and notebooks', 2, '{"icon": "💻"}'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Tablets', 'tablets', 'Tablets and iPads', 3, '{"icon": "📲"}'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Accessories', 'accessories', 'Phone and laptop accessories', 4, '{"icon": "🎧"}'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Wearables', 'wearables', 'Smart watches and fitness trackers', 5, '{"icon": "⌚"}'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', 'Gaming', 'gaming', 'Gaming consoles and accessories', 6, '{"icon": "🎮"}');

-- Получаем ID категорий и создаем товары
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

    -- Smartphones
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, compare_at_price, inventory, is_featured, images) VALUES
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_smartphones, 'IP15PRO-256', 'iPhone 15 Pro', 'Latest iPhone with titanium design and A17 Pro chip. Premium flagship smartphone with advanced camera system.', 999.99, 1099.99, 45, true, '["https://images.unsplash.com/photo-1696446702547-f10e57f-0ae82d?w=400"]'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_smartphones, 'SGS24U-512', 'Samsung Galaxy S24 Ultra', 'Powerful Android flagship with S Pen. Top-tier Android phone with stunning display.', 899.99, 999.99, 38, true, '["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400"]'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_smartphones, 'GPX8PRO-256', 'Google Pixel 8 Pro', 'Best camera phone with AI features. Photography enthusiast choice with Google Tensor G3.', 799.99, NULL, 52, true, '["https://images.unsplash.com/photo-1598327105666-5b89351-aef97b?w=400"]'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_smartphones, 'OP12-256', 'OnePlus 12', 'Fast charging flagship killer. Value flagship phone with 100W SUPERVOOC charging.', 699.99, NULL, 67, false, '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"]');

    -- Laptops
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, is_featured, images) VALUES
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_laptops, 'MBP16-M3MAX', 'MacBook Pro 16"', 'Apple M3 Max chip, 36GB RAM, 1TB SSD. Ultimate creative workstation for professionals.', 2499.99, 23, true, '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"]'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_laptops, 'DXPS15-I9', 'Dell XPS 15', 'Intel i9, 32GB RAM, RTX 4060. Premium Windows laptop with InfinityEdge display.', 1799.99, 18, true, '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400"]'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_laptops, 'TPX1C-I7', 'Lenovo ThinkPad X1 Carbon', 'Business ultrabook, i7, 16GB RAM. Professional business laptop with legendary keyboard.', 1399.99, 31, false, '["https://images.unsplash.com/photo-1588702547923-7093a6c3-9787fe?w=400"]');

    -- Tablets
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, is_featured, images) VALUES
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_tablets, 'IPAD-AIRM2', 'iPad Air M2', '11-inch Liquid Retina, M2 chip. Versatile tablet for work and play with Apple Pencil support.', 599.99, 42, true, '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400"]'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_tablets, 'SGTABS9-256', 'Samsung Galaxy Tab S9', 'Android tablet with S Pen included. Premium Android tablet with AMOLED display.', 499.99, 35, false, '["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400"]');

    -- Accessories
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, compare_at_price, inventory, is_featured, images) VALUES
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_accessories, 'APP2-USBC', 'AirPods Pro (2nd gen)', 'Active noise cancellation, USB-C. Premium wireless earbuds with spatial audio.', 249.99, NULL, 156, true, '["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400"]'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_accessories, 'SONYWH1000XM5', 'Sony WH-1000XM5', 'Industry-leading noise cancellation. Best over-ear headphones with 30-hour battery.', 349.99, 399.99, 89, true, '["https://images.unsplash.com/photo-1545127398-14699f92334b?w=400"]'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_accessories, 'LOGMXM3S', 'Logitech MX Master 3S', 'Ergonomic wireless mouse. Professional productivity mouse with 8K DPI sensor.', 99.99, NULL, 124, false, '["https://images.unsplash.com/photo-1527814050087-3793815479db?w=400"]');

    -- Wearables
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, is_featured, images) VALUES
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_wearables, 'AWS9-GPS', 'Apple Watch Series 9', 'S9 chip, Always-On display, GPS. Advanced smartwatch with health monitoring.', 399.99, 78, true, '["https://images.unsplash.com/photo-1434493789847-2f02dc6ca186?w=400"]'),
    ('87b9f436-d30d-406e-be1d-8f1123d77d90', cat_wearables, 'GARF7-GPS', 'Garmin Fenix 7', 'Multisport GPS smartwatch. Outdoor adventure watch with solar charging.', 599.99, 45, false, '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400"]');
END $$;

-- Категории для books
INSERT INTO categories (tenant_id, name, slug, description, sort_order, metadata) VALUES
('49de2553-0c51-457f-bd71-817ad1d979bf', 'Fiction', 'fiction', 'Novels and fiction books', 1, '{"icon": "📚"}'),
('49de2553-0c51-457f-bd71-817ad1d979bf', 'Non-Fiction', 'non-fiction', 'Educational and reference books', 2, '{"icon": "📖"}'),
('49de2553-0c51-457f-bd71-817ad1d979bf', 'Science', 'science', 'Scientific literature', 3, '{"icon": "🔬"}'),
('49de2553-0c51-457f-bd71-817ad1d979bf', 'Self-Help', 'self-help', 'Personal development books', 4, '{"icon": "💡"}');

-- Товары для books
DO $$
DECLARE
    cat_record RECORD;
BEGIN
    FOR cat_record IN SELECT id, name, slug FROM categories WHERE tenant_id = '49de2553-0c51-457f-bd71-817ad1d979bf'
    LOOP
        INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, is_featured)
        VALUES (
            '49de2553-0c51-457f-bd71-817ad1d979bf',
            cat_record.id,
            'BOOK-' || UPPER(cat_record.slug) || '-' || FLOOR(RANDOM() * 1000)::TEXT,
            'Sample Book in ' || cat_record.name,
            'Great book in ' || cat_record.name || ' category with engaging content.',
            CASE 
                WHEN cat_record.slug = 'fiction' THEN 24.99
                WHEN cat_record.slug = 'non-fiction' THEN 29.99
                WHEN cat_record.slug = 'science' THEN 39.99
                ELSE 19.99
            END,
            FLOOR(RANDOM() * 100 + 50)::INTEGER,
            RANDOM() < 0.5
        );
    END LOOP;
END $$;

-- Категории для fashion
INSERT INTO categories (tenant_id, name, slug, description, sort_order, metadata) VALUES
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', 'Clothing', 'clothing', 'Men and women clothing', 1, '{"icon": "👔"}'),
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', 'Shoes', 'shoes', 'Footwear collection', 2, '{"icon": "👟"}'),
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', 'Accessories', 'accessories-fashion', 'Fashion accessories', 3, '{"icon": "👜"}');

-- Товары для fashion
DO $$
DECLARE
    cat_record RECORD;
BEGIN
    FOR cat_record IN SELECT id, name, slug FROM categories WHERE tenant_id = 'fac2e1fd-52c5-4457-9a70-ce1020de71d7'
    LOOP
        INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, is_featured)
        VALUES (
            'fac2e1fd-52c5-4457-9a70-ce1020de71d7',
            cat_record.id,
            'FASH-' || UPPER(cat_record.slug) || '-' || FLOOR(RANDOM() * 1000)::TEXT,
            'Trendy ' || cat_record.name || ' Item',
            'Fashionable ' || cat_record.name || ' with modern design.',
            FLOOR(RANDOM() * 200 + 50)::DECIMAL(10,2),
            FLOOR(RANDOM() * 150 + 30)::INTEGER,
            RANDOM() < 0.5
        );
    END LOOP;
END $$;
