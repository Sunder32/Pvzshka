-- Get current tenant ID
DO $$
DECLARE
    current_tenant_id UUID;
BEGIN
    SELECT id INTO current_tenant_id FROM tenants LIMIT 1;
    
    -- Delete old test data
    DELETE FROM products;
    DELETE FROM categories;
    
    -- Create categories
    INSERT INTO categories (tenant_id, name, slug, description, sort_order, metadata) VALUES
    (current_tenant_id, 'Электроника', 'electronics', 'Смартфоны, ноутбуки, планшеты', 1, '{"icon": "📱"}'),
    (current_tenant_id, 'Одежда', 'clothing', 'Мужская и женская одежда', 2, '{"icon": "👕"}'),
    (current_tenant_id, 'Дом и сад', 'home', 'Товары для дома', 3, '{"icon": "🏠"}'),
    (current_tenant_id, 'Спорт', 'sports', 'Спортивные товары', 4, '{"icon": "⚽"}'),
    (current_tenant_id, 'Красота', 'beauty', 'Косметика и парфюмерия', 5, '{"icon": "💄"}'),
    (current_tenant_id, 'Игрушки', 'toys', 'Детские игрушки', 6, '{"icon": "🧸"}'),
    (current_tenant_id, 'Книги', 'books', 'Книги и журналы', 7, '{"icon": "📚"}'),
    (current_tenant_id, 'Продукты', 'food', 'Продукты питания', 8, '{"icon": "🍎"}');
    
    -- Insert products
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, compare_at_price, inventory, is_featured, images) 
    SELECT 
        current_tenant_id,
        c.id,
        'IPHONE15-256',
        'iPhone 15 Pro 256GB',
        'Новый iPhone 15 Pro с титановым корпусом и чипом A17 Pro',
        89990.00,
        99990.00,
        50,
        true,
        '["https://images.unsplash.com/photo-1696446702547-f10e57f-0ae82d?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'electronics' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, is_featured, images)
    SELECT 
        current_tenant_id,
        c.id,
        'SAMSUNG-S24',
        'Samsung Galaxy S24 Ultra',
        'Флагманский смартфон Samsung с 200Мп камерой',
        79990.00,
        35,
        true,
        '["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'electronics' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, compare_at_price, inventory, is_featured, images)
    SELECT 
        current_tenant_id,
        c.id,
        'MACBOOK-PRO',
        'MacBook Pro 16" M3 Max',
        'Профессиональный ноутбук Apple с чипом M3 Max',
        249990.00,
        279990.00,
        20,
        true,
        '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'electronics' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, images)
    SELECT 
        current_tenant_id,
        c.id,
        'AIRPODS-PRO',
        'AirPods Pro 2',
        'Беспроводные наушники с активным шумоподавлением',
        24990.00,
        100,
        '["https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'electronics' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, compare_at_price, inventory, images)
    SELECT 
        current_tenant_id,
        c.id,
        'NIKE-AIR',
        'Nike Air Max 2024',
        'Стильные кроссовки Nike для бега и повседневной носки',
        12990.00,
        14990.00,
        75,
        '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'sports' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, images)
    SELECT 
        current_tenant_id,
        c.id,
        'ADIDAS-ULTRA',
        'Adidas Ultraboost 23',
        'Премиальные беговые кроссовки Adidas',
        15990.00,
        45,
        '["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'sports' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, is_featured, images)
    SELECT 
        current_tenant_id,
        c.id,
        'DIOR-SAUVAGE',
        'Dior Sauvage EDT 100ml',
        'Легендарный мужской аромат Dior Sauvage',
        8990.00,
        60,
        true,
        '["https://images.unsplash.com/photo-1541643600914-78b084683601?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'beauty' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, compare_at_price, inventory, images)
    SELECT 
        current_tenant_id,
        c.id,
        'LEGO-TECH',
        'LEGO Technic Ferrari',
        'Конструктор LEGO Technic Ferrari 488 GTE',
        19990.00,
        22990.00,
        30,
        '["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'toys' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, images)
    SELECT 
        current_tenant_id,
        c.id,
        'DYSON-V15',
        'Dyson V15 Detect',
        'Беспроводной пылесос Dyson с лазерным детектором пыли',
        54990.00,
        25,
        '["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'home' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, compare_at_price, inventory, is_featured, images)
    SELECT 
        current_tenant_id,
        c.id,
        'ZARA-COAT',
        'Пальто шерстяное ZARA',
        'Элегантное женское пальто из натуральной шерсти',
        15990.00,
        18990.00,
        40,
        true,
        '["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'clothing' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, images)
    SELECT 
        current_tenant_id,
        c.id,
        'HM-JEANS',
        'Джинсы H&M Slim Fit',
        'Классические мужские джинсы H&M',
        3990.00,
        120,
        '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'clothing' AND c.tenant_id = current_tenant_id;
    
    INSERT INTO products (tenant_id, category_id, sku, title, description, price, inventory, images)
    SELECT 
        current_tenant_id,
        c.id,
        'BOOK-HARRY',
        'Гарри Поттер. Полное собрание',
        'Все 7 книг о Гарри Поттере в подарочном издании',
        5990.00,
        50,
        '["https://images.unsplash.com/photo-1618944847828-82e943c3bdb7?w=400"]'::jsonb
    FROM categories c WHERE c.slug = 'books' AND c.tenant_id = current_tenant_id;
    
END $$;
