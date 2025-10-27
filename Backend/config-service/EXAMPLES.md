# Примеры использования Config Service

## 1. Базовое использование в JavaScript

```javascript
import ConfigServiceClient from './src/client/configClient.js';

// Создание клиента
const configClient = new ConfigServiceClient('http://localhost:4000');

// Получить конфиг магазина
async function loadTenantConfig() {
  try {
    const config = await configClient.getConfig('electronics');
    
    console.log('Название магазина:', config.branding.name);
    console.log('Основной цвет:', config.branding.primaryColor);
    console.log('Категории:', config.categories);
    
    // Применить брендинг к сайту
    document.documentElement.style.setProperty(
      '--primary-color',
      config.branding.primaryColor
    );
    document.title = config.branding.name;
    
    return config;
  } catch (error) {
    console.error('Ошибка загрузки конфига:', error);
  }
}

// Обновить конфиг
async function updateBranding() {
  try {
    const updatedConfig = await configClient.patchConfig('electronics', {
      branding: {
        primaryColor: '#EF4444',
        logo: 'https://example.com/new-logo.png',
      }
    });
    
    console.log('Конфиг обновлен, новая версия:', updatedConfig.version);
  } catch (error) {
    console.error('Ошибка обновления:', error);
  }
}

// Подписка на изменения через WebSocket
configClient.subscribeToUpdates('electronics', (notification) => {
  console.log('Получено обновление конфига:', notification);
  
  // Автоматически перезагрузить конфиг
  loadTenantConfig();
});
```

## 2. Использование в Next.js (Web App)

```javascript
// src/lib/config.js
import ConfigServiceClient from '@/lib/configClient';

const configClient = new ConfigServiceClient(
  process.env.NEXT_PUBLIC_CONFIG_SERVICE_URL
);

export async function getTenantConfig(tenantId) {
  return await configClient.getConfig(tenantId);
}

export default configClient;
```

```jsx
// src/app/market/[tenant]/page.jsx
import { getTenantConfig } from '@/lib/config';
import ProductList from '@/components/ProductList';

export default async function MarketPage({ params }) {
  const { tenant } = params;
  const config = await getTenantConfig(tenant);
  
  return (
    <div style={{
      '--primary': config.branding.primaryColor,
      '--secondary': config.branding.secondaryColor,
    }}>
      <header>
        <img src={config.branding.logo} alt={config.branding.name} />
        <h1>{config.branding.name}</h1>
      </header>
      
      <main>
        <ProductList categories={config.categories} />
      </main>
    </div>
  );
}

// Metadata для SEO
export async function generateMetadata({ params }) {
  const config = await getTenantConfig(params.tenant);
  
  return {
    title: config.seo.title || config.branding.name,
    description: config.seo.description,
    keywords: config.seo.keywords,
    openGraph: {
      images: [config.seo.ogImage],
    },
  };
}
```

## 3. React компонент с хуками

```jsx
// TenantBrandingEditor.jsx
import React from 'react';
import { useConfig } from '../client/useConfig';
import { SketchPicker } from 'react-color';

function TenantBrandingEditor({ tenantId }) {
  const { config, loading, error, patchConfig } = useConfig(tenantId, {
    enableWebSocket: true,
  });

  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);

  if (loading) return <div>Загрузка конфига...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  const handleColorChange = async (color) => {
    try {
      await patchConfig({
        branding: {
          primaryColor: color.hex,
        },
      });
      console.log('Цвет обновлен!');
    } catch (err) {
      alert('Ошибка при обновлении цвета');
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    
    // Загрузить файл на сервер (например, S3)
    const logoUrl = await uploadFile(file);
    
    // Обновить конфиг
    await patchConfig({
      branding: {
        logo: logoUrl,
      },
    });
  };

  return (
    <div className="branding-editor">
      <h2>Настройка брендинга: {config.branding.name}</h2>
      
      <div className="preview" style={{
        backgroundColor: config.branding.primaryColor,
      }}>
        <img src={config.branding.logo} alt="Logo" />
      </div>

      <div className="controls">
        <div>
          <label>Основной цвет:</label>
          <button
            style={{ backgroundColor: config.branding.primaryColor }}
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
          >
            {config.branding.primaryColor}
          </button>
          
          {colorPickerOpen && (
            <SketchPicker
              color={config.branding.primaryColor}
              onChangeComplete={handleColorChange}
            />
          )}
        </div>

        <div>
          <label>Логотип:</label>
          <input type="file" onChange={handleLogoUpload} />
        </div>

        <div>
          <label>Название магазина:</label>
          <input
            type="text"
            value={config.branding.name}
            onChange={(e) => patchConfig({
              branding: { name: e.target.value }
            })}
          />
        </div>
      </div>

      <div className="version-info">
        Версия конфига: {config.version}
        <br />
        Обновлено: {new Date(config.updatedAt).toLocaleString('ru')}
      </div>
    </div>
  );
}

export default TenantBrandingEditor;
```

## 4. Создание нового магазина (Global Admin)

```jsx
// CreateTenantModal.jsx
import React, { useState } from 'react';
import { useCreateTenant } from '../client/useConfig';
import { Modal, Form, Input, Select, ColorPicker, message } from 'antd';

function CreateTenantModal({ visible, onClose, onCreated }) {
  const { createTenant, creating } = useCreateTenant();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const tenant = await createTenant({
        name: values.name,
        subdomain: values.subdomain,
        adminEmail: values.email,
        tier: values.tier,
        config: {
          branding: {
            primaryColor: values.primaryColor,
            secondaryColor: values.secondaryColor,
          },
          categories: values.categories || [],
          locale: {
            currency: values.currency,
            language: values.language,
          },
        },
      });

      message.success(`Магазин "${tenant.name}" создан!`);
      form.resetFields();
      onCreated(tenant);
      onClose();
    } catch (error) {
      message.error('Ошибка при создании магазина: ' + error.message);
    }
  };

  return (
    <Modal
      title="Создать новый магазин"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={creating}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Название магазина"
          name="name"
          rules={[{ required: true, message: 'Введите название' }]}
        >
          <Input placeholder="Например: Электроника" />
        </Form.Item>

        <Form.Item
          label="Subdomain (уникальный ID)"
          name="subdomain"
          rules={[
            { required: true, message: 'Введите subdomain' },
            { pattern: /^[a-z0-9-]+$/, message: 'Только латиница, цифры и дефис' }
          ]}
        >
          <Input placeholder="electronics" addonBefore="https://" addonAfter=".shop.com" />
        </Form.Item>

        <Form.Item
          label="Email администратора"
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Некорректный email' }
          ]}
        >
          <Input placeholder="admin@electronics.com" />
        </Form.Item>

        <Form.Item label="Тарифный план" name="tier" initialValue="free">
          <Select>
            <Select.Option value="free">Free</Select.Option>
            <Select.Option value="basic">Basic</Select.Option>
            <Select.Option value="premium">Premium</Select.Option>
            <Select.Option value="enterprise">Enterprise</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Основной цвет" name="primaryColor" initialValue="#3B82F6">
          <ColorPicker showText />
        </Form.Item>

        <Form.Item label="Дополнительный цвет" name="secondaryColor" initialValue="#10B981">
          <ColorPicker showText />
        </Form.Item>

        <Form.Item label="Валюта" name="currency" initialValue="RUB">
          <Select>
            <Select.Option value="RUB">₽ Рубль</Select.Option>
            <Select.Option value="USD">$ Доллар</Select.Option>
            <Select.Option value="EUR">€ Евро</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Язык" name="language" initialValue="ru">
          <Select>
            <Select.Option value="ru">Русский</Select.Option>
            <Select.Option value="en">English</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateTenantModal;
```

## 5. Проверка обновлений конфига (Web App)

```jsx
// ConfigUpdateNotifier.jsx
import React from 'react';
import { useConfigVersion } from '../client/useConfig';
import { Alert, Button } from 'antd';

function ConfigUpdateNotifier({ tenantId, onUpdate }) {
  const { hasUpdate, currentVersion, resetUpdateFlag } = useConfigVersion(
    tenantId,
    30000 // Проверять каждые 30 секунд
  );

  const handleUpdate = () => {
    resetUpdateFlag();
    onUpdate(); // Перезагрузить страницу или конфиг
  };

  if (!hasUpdate) return null;

  return (
    <Alert
      message="Доступно обновление"
      description={`Конфигурация магазина была обновлена (версия ${currentVersion}). Обновите страницу для применения изменений.`}
      type="info"
      showIcon
      action={
        <Button size="small" type="primary" onClick={handleUpdate}>
          Обновить
        </Button>
      }
      closable
      onClose={resetUpdateFlag}
    />
  );
}

export default ConfigUpdateNotifier;
```

## 6. Список всех магазинов (Global Admin)

```jsx
// TenantsList.jsx
import React from 'react';
import { useTenants } from '../client/useConfig';
import { Table, Tag, Button, Space } from 'antd';

function TenantsList() {
  const { tenants, loading, error, refetch } = useTenants({
    status: 'active',
    limit: 100,
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'tenantId',
      key: 'tenantId',
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Subdomain',
      dataIndex: 'subdomain',
      key: 'subdomain',
      render: (subdomain) => (
        <a href={`https://${subdomain}.shop.com`} target="_blank" rel="noreferrer">
          {subdomain}
        </a>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'adminEmail',
      key: 'adminEmail',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'green',
          suspended: 'orange',
          deleted: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Тариф',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier) => {
        const colors = {
          free: 'default',
          basic: 'blue',
          premium: 'purple',
          enterprise: 'gold',
        };
        return <Tag color={colors[tier]}>{tier.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" href={`/tenant/${record.tenantId}`}>
            Открыть
          </Button>
          <Button size="small" type="link">
            Настроить
          </Button>
        </Space>
      ),
    },
  ];

  if (error) {
    return <div>Ошибка загрузки: {error.message}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={refetch} loading={loading}>
          Обновить
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={tenants}
        rowKey="tenantId"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}

export default TenantsList;
```

## 7. Применение динамической темы (Web App)

```jsx
// ThemeProvider.jsx
import React, { useEffect } from 'react';
import { useConfig } from '../client/useConfig';
import { ConfigProvider, theme } from 'antd';

function ThemeProvider({ tenantId, children }) {
  const { config, loading } = useConfig(tenantId, {
    enableWebSocket: true,
  });

  useEffect(() => {
    if (config) {
      // Применяем CSS переменные
      document.documentElement.style.setProperty(
        '--primary-color',
        config.branding.primaryColor
      );
      document.documentElement.style.setProperty(
        '--secondary-color',
        config.branding.secondaryColor
      );
      document.documentElement.style.setProperty(
        '--accent-color',
        config.branding.accentColor
      );

      // Обновляем favicon
      const link = document.querySelector("link[rel*='icon']");
      if (link && config.branding.favicon) {
        link.href = config.branding.favicon;
      }

      // Обновляем title
      document.title = config.branding.name;
    }
  }, [config]);

  if (loading) {
    return <div>Загрузка темы...</div>;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: config.branding.primaryColor,
          colorSuccess: config.branding.secondaryColor,
          colorWarning: config.branding.accentColor,
          borderRadius: 8,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default ThemeProvider;
```

## 8. cURL примеры для тестирования

```bash
# Получить конфиг
curl http://localhost:4000/api/config/electronics

# Создать новый магазин
curl -X POST http://localhost:4000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Books Store",
    "subdomain": "books",
    "adminEmail": "admin@books.com",
    "tier": "basic"
  }'

# Обновить конфиг
curl -X PATCH http://localhost:4000/api/config/electronics \
  -H "Content-Type: application/json" \
  -d '{
    "branding": {
      "primaryColor": "#EF4444"
    }
  }'

# Получить версию
curl http://localhost:4000/api/config/electronics/version

# Получить список магазинов
curl "http://localhost:4000/api/config?status=active&tier=premium"

# Обновить статус
curl -X PATCH http://localhost:4000/api/config/electronics/status \
  -H "Content-Type: application/json" \
  -d '{"status": "suspended"}'

# Обновить тариф
curl -X PATCH http://localhost:4000/api/config/electronics/tier \
  -H "Content-Type: application/json" \
  -d '{"tier": "enterprise"}'
```
