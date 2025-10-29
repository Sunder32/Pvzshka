import React from 'react';
import { Card, Space, Button, Typography } from 'antd';
import {
  AppstoreOutlined,
  LayoutOutlined,
  PictureOutlined,
  StarOutlined,
  ShoppingOutlined,
  FireOutlined,
  MailOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface ComponentLibraryProps {
  onAdd: (type: string) => void;
}

const components = [
  {
    id: 'header',
    name: 'Шапка сайта',
    icon: <LayoutOutlined />,
    description: 'Навигация, поиск, корзина',
  },
  {
    id: 'hero',
    name: 'Hero секция',
    icon: <PictureOutlined />,
    description: 'Главный баннер с заголовком',
  },
  {
    id: 'features',
    name: 'Преимущества',
    icon: <StarOutlined />,
    description: 'Блок с иконками и текстом',
  },
  {
    id: 'products',
    name: 'Товары',
    icon: <ShoppingOutlined />,
    description: 'Сетка товаров из каталога',
  },
  {
    id: 'categories',
    name: 'Категории',
    icon: <AppstoreOutlined />,
    description: 'Плитка категорий',
  },
  {
    id: 'banner',
    name: 'Баннер',
    icon: <PictureOutlined />,
    description: 'Рекламный баннер',
  },
  {
    id: 'hot-deals',
    name: 'Горячие предложения',
    icon: <FireOutlined />,
    description: 'Товары со скидками',
  },
  {
    id: 'newsletter',
    name: 'Подписка',
    icon: <MailOutlined />,
    description: 'Форма подписки на рассылку',
  },
  {
    id: 'testimonials',
    name: 'Отзывы',
    icon: <CustomerServiceOutlined />,
    description: 'Отзывы покупателей',
  },
  {
    id: 'custom-html',
    name: 'HTML блок',
    icon: <LayoutOutlined />,
    description: 'Произвольный HTML код',
  },
];

export default function ComponentLibrary({ onAdd }: ComponentLibraryProps) {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="small">
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Перетащите компоненты на страницу
      </Text>

      {components.map((component) => (
        <Card
          key={component.id}
          size="small"
          hoverable
          style={{ cursor: 'grab' }}
          onClick={() => onAdd(component.id)}
        >
          <Space>
            <div style={{ fontSize: 24 }}>{component.icon}</div>
            <div>
              <div style={{ fontWeight: 500 }}>{component.name}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {component.description}
              </Text>
            </div>
          </Space>
        </Card>
      ))}

      <Card size="small" style={{ marginTop: 16, background: '#f0f2f5' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          💡 Tip: Кликните на компонент чтобы добавить его на страницу
        </Text>
      </Card>
    </Space>
  );
}
