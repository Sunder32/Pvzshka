-- Создание таблицы поставщиков (suppliers)
-- Связь с tenants через tenant_id

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    description TEXT,
    products_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers(created_at);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER suppliers_updated_at_trigger
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION update_suppliers_updated_at();

-- Тестовые данные для существующих тенантов
INSERT INTO suppliers (tenant_id, name, contact_person, email, phone, products_count, status) 
VALUES 
    (
        (SELECT id FROM tenants WHERE subdomain = 'electronics' LIMIT 1),
        'TechSupply Co.',
        'Иван Петров',
        'ivan@techsupply.ru',
        '+7-495-123-4567',
        150,
        'active'
    ),
    (
        (SELECT id FROM tenants WHERE subdomain = 'electronics' LIMIT 1),
        'GlobalElectronics Ltd',
        'Мария Сидорова',
        'maria@globalelectronics.com',
        '+7-812-987-6543',
        200,
        'active'
    ),
    (
        (SELECT id FROM tenants WHERE subdomain = 'books' LIMIT 1),
        'Издательство Прогресс',
        'Алексей Кузнецов',
        'alexey@progress-books.ru',
        '+7-495-555-0123',
        500,
        'active'
    ),
    (
        (SELECT id FROM tenants WHERE subdomain = 'fashion' LIMIT 1),
        'Fashion Wholesale',
        'Елена Волкова',
        'elena@fashionwholesale.ru',
        '+7-495-777-8899',
        300,
        'active'
    )
ON CONFLICT DO NOTHING;

-- Проверка созданных данных
SELECT 
    s.id,
    t.subdomain as tenant_subdomain,
    s.name as supplier_name,
    s.contact_person,
    s.products_count,
    s.status,
    s.created_at
FROM suppliers s
JOIN tenants t ON s.tenant_id = t.id
ORDER BY t.subdomain, s.name;
