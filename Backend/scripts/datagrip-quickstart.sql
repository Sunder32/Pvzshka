-- DataGrip Quick Start
-- Скопируйте этот запрос в DataGrip и выполните (Ctrl+Enter)

-- 1. Проверка подключения
SELECT version();

-- 2. Список всех баз данных
SELECT datname FROM pg_database WHERE datistemplate = false;

-- 3. Текущая база данных
SELECT current_database();

-- 4. Список всех таблиц
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Просмотр tenant_configs
SELECT 
    tc.id,
    t.subdomain,
    t.name as tenant_name,
    tc.version,
    tc.branding->>'siteName' as site_name,
    tc.branding->>'primaryColor' as primary_color,
    tc.contact_info->>'email' as email,
    tc.created_at
FROM tenant_configs tc
JOIN tenants t ON t.id = tc.tenant_id
ORDER BY t.subdomain;

-- 6. Структура таблицы tenant_configs
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'tenant_configs'
ORDER BY ordinal_position;

-- 7. Все tenants
SELECT 
    id,
    subdomain,
    name,
    tier,
    status,
    created_at
FROM tenants
ORDER BY created_at DESC;
