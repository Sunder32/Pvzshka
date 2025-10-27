-- Таблица для хранения отчетов о продажах
CREATE TABLE IF NOT EXISTS sales_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID,
    product_id UUID,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(100),
    customer_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_sales_tenant_id ON sales_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_reports(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_tenant_date ON sales_reports(tenant_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_category ON sales_reports(category);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_sales_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_reports_updated_at
    BEFORE UPDATE ON sales_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_reports_updated_at();

-- Тестовые данные для electronics (87b9f436-d30d-406e-be1d-8f1123d77d90)
-- Продажи за последние 3 месяца
INSERT INTO sales_reports (tenant_id, product_id, product_name, quantity, unit_price, total_price, sale_date, category) VALUES
-- Октябрь 2025
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'iPhone 15 Pro', 5, 999.99, 4999.95, '2025-10-25 14:30:00', 'Смартфоны'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'MacBook Pro M3', 3, 2499.99, 7499.97, '2025-10-24 10:15:00', 'Ноутбуки'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'AirPods Pro', 12, 249.99, 2999.88, '2025-10-23 16:45:00', 'Аксессуары'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'iPad Air', 4, 599.99, 2399.96, '2025-10-22 11:20:00', 'Планшеты'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Samsung Galaxy S24', 7, 899.99, 6299.93, '2025-10-21 09:30:00', 'Смартфоны'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Sony WH-1000XM5', 6, 349.99, 2099.94, '2025-10-20 15:10:00', 'Аксессуары'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Dell XPS 15', 2, 1799.99, 3599.98, '2025-10-19 13:25:00', 'Ноутбуки'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Apple Watch Series 9', 8, 399.99, 3199.92, '2025-10-18 10:50:00', 'Носимая электроника'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'iPhone 15 Pro', 4, 999.99, 3999.96, '2025-10-15 14:30:00', 'Смартфоны'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'AirPods Pro', 10, 249.99, 2499.90, '2025-10-12 16:20:00', 'Аксессуары'),

-- Сентябрь 2025
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'MacBook Pro M3', 5, 2499.99, 12499.95, '2025-09-28 12:00:00', 'Ноутбуки'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Samsung Galaxy S24', 9, 899.99, 8099.91, '2025-09-25 14:15:00', 'Смартфоны'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'iPad Air', 6, 599.99, 3599.94, '2025-09-22 10:30:00', 'Планшеты'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Sony WH-1000XM5', 8, 349.99, 2799.92, '2025-09-18 15:45:00', 'Аксессуары'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Apple Watch Series 9', 10, 399.99, 3999.90, '2025-09-15 11:20:00', 'Носимая электроника'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'iPhone 15 Pro', 12, 999.99, 11999.88, '2025-09-10 09:30:00', 'Смартфоны'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Dell XPS 15', 3, 1799.99, 5399.97, '2025-09-05 13:10:00', 'Ноутбуки'),

-- Август 2025
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Samsung Galaxy S24', 15, 899.99, 13499.85, '2025-08-28 16:00:00', 'Смартфоны'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'MacBook Pro M3', 4, 2499.99, 9999.96, '2025-08-25 10:30:00', 'Ноутбуки'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'AirPods Pro', 20, 249.99, 4999.80, '2025-08-20 14:15:00', 'Аксессуары'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'iPad Air', 7, 599.99, 4199.93, '2025-08-15 11:45:00', 'Планшеты'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Apple Watch Series 9', 11, 399.99, 4399.89, '2025-08-10 09:20:00', 'Носимая электроника'),
('87b9f436-d30d-406e-be1d-8f1123d77d90', gen_random_uuid(), 'Sony WH-1000XM5', 9, 349.99, 3149.91, '2025-08-05 15:30:00', 'Аксессуары');

-- Тестовые данные для books (49de2553-0c51-457f-bd71-817ad1d979bf)
INSERT INTO sales_reports (tenant_id, product_id, product_name, quantity, unit_price, total_price, sale_date, category) VALUES
('49de2553-0c51-457f-bd71-817ad1d979bf', gen_random_uuid(), 'Война и мир', 15, 24.99, 374.85, '2025-10-20 12:00:00', 'Классика'),
('49de2553-0c51-457f-bd71-817ad1d979bf', gen_random_uuid(), 'Мастер и Маргарита', 12, 19.99, 239.88, '2025-10-15 14:30:00', 'Классика'),
('49de2553-0c51-457f-bd71-817ad1d979bf', gen_random_uuid(), 'Атомные привычки', 25, 16.99, 424.75, '2025-10-10 10:15:00', 'Саморазвитие'),
('49de2553-0c51-457f-bd71-817ad1d979bf', gen_random_uuid(), 'Sapiens', 18, 22.99, 413.82, '2025-09-25 11:20:00', 'Наука'),
('49de2553-0c51-457f-bd71-817ad1d979bf', gen_random_uuid(), '1984', 20, 14.99, 299.80, '2025-09-15 15:45:00', 'Фантастика');

-- Тестовые данные для fashion (fac2e1fd-52c5-4457-9a70-ce1020de71d7)
INSERT INTO sales_reports (tenant_id, product_id, product_name, quantity, unit_price, total_price, sale_date, category) VALUES
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', gen_random_uuid(), 'Nike Air Max', 30, 129.99, 3899.70, '2025-10-22 13:00:00', 'Обувь'),
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', gen_random_uuid(), 'Levi''s Jeans', 45, 79.99, 3599.55, '2025-10-18 10:30:00', 'Одежда'),
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', gen_random_uuid(), 'Adidas Hoodie', 25, 59.99, 1499.75, '2025-10-12 14:15:00', 'Одежда'),
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', gen_random_uuid(), 'Ray-Ban Sunglasses', 20, 149.99, 2999.80, '2025-09-28 11:45:00', 'Аксессуары'),
('fac2e1fd-52c5-4457-9a70-ce1020de71d7', gen_random_uuid(), 'Nike Air Max', 35, 129.99, 4549.65, '2025-09-15 09:20:00', 'Обувь');
