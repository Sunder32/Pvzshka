# Настройка DataGrip для работы с PostgreSQL

## 🚨 ВАЖНО: Если базы данных не видны

### Проблема: "No databases selected"

**Решение в 3 шага:**

1. **В левой панели Database Explorer найдите подключение `postgres@localhost`**
2. **Кликните стрелку ▶ чтобы развернуть**
3. **Найдите базу `platform` и КЛИКНИТЕ НА ЧЕКБОКС ☑ рядом с ней**
4. **Нажмите F5 (Refresh) или иконку обновления**
5. **Разверните: `platform` → `schemas` → `public` → `tables`**

Теперь должны появиться все таблицы!

---

## 1. Подключение к PostgreSQL в Docker

### Параметры подключения:
```
Host: localhost
Port: 5432
Database: platform
User: platform
Password: platform123
```

### Шаги в DataGrip:

1. **Открыть DataGrip**

2. **Создать новое подключение:**
   - Нажмите `+` в окне Database
   - Выберите `Data Source` → `PostgreSQL`

3. **Настройте соединение:**
   ```
   Name: pvZZz Platform
   Host: localhost
   Port: 5432
   Authentication: User & Password
   User: platform
   Password: platform123
   Database: platform  ← ВАЖНО!
   ```

4. **Скачайте драйвер:**
   - При первом подключении DataGrip предложит скачать драйвер PostgreSQL
   - Нажмите "Download missing driver files"

5. **На вкладке "Schemas" убедитесь, что выбрана схема `public`**

6. **Проверьте соединение:**
   - Нажмите кнопку `Test Connection`
   - Должно появиться сообщение "Successful"

7. **Сохраните:**
   - Нажмите `OK`

8. **В Database Explorer:**
   - Разверните подключение (стрелка ▶)
   - **ОБЯЗАТЕЛЬНО поставьте галочку ☑ на базе `platform`**
   - Нажмите F5 для обновления

---

## 🚀 Быстрый тест (если таблицы не видны)

### Вариант 1: Через SQL Console

1. **Правый клик на подключение `postgres@localhost`**
2. **Выберите `New` → `Query Console`**
3. **Скопируйте и выполните:**

```sql
-- Проверка текущей базы
SELECT current_database();

-- Список всех таблиц
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Просмотр tenant_configs
SELECT * FROM tenant_configs LIMIT 5;
```

4. **Нажмите Ctrl+Enter для выполнения**

### Вариант 2: Открыть готовый SQL файл

1. В DataGrip: `File` → `Open`
2. Откройте: `Backend/scripts/datagrip-quickstart.sql`
3. Выберите подключение в выпадающем списке вверху
4. Нажмите `Ctrl+Enter`

---

## 2. Создание таблицы tenant_configs

### Вариант A: Через SQL файл

1. В DataGrip откройте файл:
   ```
   Backend/scripts/config-service-schema.sql
   ```

2. Выберите соединение "pvZZz Platform (localhost)"

3. Нажмите `Ctrl+Enter` или кнопку `Execute` (зеленая стрелка)

4. Скрипт создаст:
   - Таблицу `tenant_configs`
   - Индексы для оптимизации
   - Триггер для автоматического обновления версии
   - Тестовые данные для существующих tenants

### Вариант B: Через командную строку (PowerShell)

```powershell
# Перейдите в папку проекта
cd "C:\Users\rapha\OneDrive\Рабочий стол\pvZZz"

# Выполните скрипт
docker exec -i pvzzz-postgres-1 psql -U platform -d platform < Backend/scripts/config-service-schema.sql
```

---

## 3. Проверка созданных таблиц

### В DataGrip:

1. В окне Database разверните:
   ```
   pvZZz Platform (localhost)
   └── platform
       └── schemas
           └── public
               └── tables
   ```

2. Должны увидеть таблицы:
   - `audit_logs`
   - `categories`
   - `notifications`
   - `order_items`
   - `orders`
   - `payment_transfers`
   - `payments`
   - `products`
   - `pvz_locations`
   - `shipments`
   - `tenants`
   - `tenant_configs` ← **НОВАЯ ТАБЛИЦА**
   - `users`
   - `webhook_logs`

### Проверочный запрос:

```sql
-- Посмотреть все конфиги
SELECT 
    tc.id,
    t.name as tenant_name,
    tc.version,
    tc.branding->>'siteName' as site_name,
    tc.branding->>'primaryColor' as primary_color,
    tc.created_at
FROM tenant_configs tc
JOIN tenants t ON t.id = tc.tenant_id;
```

---

## 4. Полезные SQL команды для DataGrip

### Посмотреть структуру таблицы:
```sql
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tenant_configs'
ORDER BY ordinal_position;
```

### Посмотреть все tenants:
```sql
SELECT 
    id,
    subdomain,
    name,
    tier,
    status,
    created_at
FROM tenants
ORDER BY created_at DESC;
```

### Создать новый конфиг для tenant:
```sql
INSERT INTO tenant_configs (tenant_id, branding, contact_info)
VALUES (
    (SELECT id FROM tenants WHERE subdomain = 'electronics'),
    jsonb_build_object(
        'siteName', 'Электроника Маркет',
        'logoUrl', 'https://example.com/logo.png',
        'primaryColor', '#FF6B35',
        'secondaryColor', '#004E89',
        'accentColor', '#F7B801'
    ),
    jsonb_build_object(
        'email', 'support@electronics.shop',
        'phone', '+7 (495) 123-45-67',
        'address', 'Москва, ул. Примерная, д. 1'
    )
) ON CONFLICT (tenant_id) DO UPDATE SET
    branding = EXCLUDED.branding,
    contact_info = EXCLUDED.contact_info;
```

### Обновить конфиг:
```sql
UPDATE tenant_configs 
SET branding = jsonb_set(
    branding, 
    '{primaryColor}', 
    '"#FF0000"'
)
WHERE tenant_id = (SELECT id FROM tenants WHERE subdomain = 'electronics');
```

### Посмотреть историю версий:
```sql
SELECT 
    tenant_id,
    version,
    updated_at
FROM tenant_configs
ORDER BY updated_at DESC;
```

---

## 5. Создание тестового tenant

Если у вас еще нет tenants в базе:

```sql
-- Создать тестовый tenant
INSERT INTO tenants (subdomain, name, tier, status, config)
VALUES 
    ('electronics', 'Магазин Электроники', 'professional', 'active', '{}'),
    ('books', 'Книжный Мир', 'starter', 'active', '{}'),
    ('fashion', 'Модный Бутик', 'professional', 'active', '{}')
ON CONFLICT (subdomain) DO NOTHING;

-- Создать для них конфиги
INSERT INTO tenant_configs (tenant_id, branding)
SELECT 
    t.id,
    jsonb_build_object(
        'siteName', t.name,
        'primaryColor', CASE t.subdomain
            WHEN 'electronics' THEN '#3B82F6'
            WHEN 'books' THEN '#8B4513'
            WHEN 'fashion' THEN '#EC4899'
        END
    )
FROM tenants t
WHERE t.subdomain IN ('electronics', 'books', 'fashion')
ON CONFLICT (tenant_id) DO NOTHING;
```

---

## 6. Горячие клавиши DataGrip

- `Ctrl+Enter` - Выполнить текущий SQL запрос
- `Ctrl+Shift+Enter` - Выполнить все запросы
- `F5` - Обновить список таблиц
- `Ctrl+Q` - Показать документацию
- `Ctrl+Space` - Автодополнение
- `Ctrl+/` - Закомментировать строку

---

## 7. Экспорт данных

### Экспорт таблицы в CSV:
1. Правый клик на таблицу `tenant_configs`
2. `Dump Data To File`
3. Выберите формат: CSV, JSON, SQL и т.д.

### Экспорт результата запроса:
1. Выполните запрос
2. В окне результатов нажмите на иконку экспорта
3. Выберите формат

---

## 8. Бэкап и восстановление

### Создать бэкап через DataGrip:
1. Правый клик на базу `platform`
2. `Tools` → `Dump with 'pg_dump'`
3. Сохраните файл

### Создать бэкап через командную строку:
```powershell
docker exec pvzzz-postgres-1 pg_dump -U platform platform > backup.sql
```

### Восстановить бэкап:
```powershell
docker exec -i pvzzz-postgres-1 psql -U platform platform < backup.sql
```

---

## Готово! 🎉

Теперь вы можете:
✅ Подключиться к PostgreSQL через DataGrip
✅ Создать таблицу tenant_configs
✅ Просматривать и редактировать данные
✅ Выполнять SQL запросы
✅ Создавать бэкапы
