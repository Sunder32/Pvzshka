import React from 'react';
import { Form, Input, InputNumber, Switch, Select, Card, Divider } from 'antd';

interface LayoutBuilderProps {
  section: any;
  onChange: (updates: any) => void;
}

export default function LayoutBuilder({ section, onChange }: LayoutBuilderProps) {
  // БЕЗОПАСНАЯ проверка перед использованием
  if (!section || !section.type || !section.config) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
        Секция не выбрана
      </div>
    );
  }

  // БЕЗОПАСНОЕ присваивание БЕЗ деструктуризации
  const type = section.type;
  const config = section.config;

  const renderFields = () => {
    switch (type) {
      case 'hero':
        return (
          <>
            <Form.Item label="Заголовок">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Введите заголовок"
              />
            </Form.Item>

            <Form.Item label="Подзаголовок">
              <Input.TextArea
                value={config.subtitle}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                placeholder="Введите подзаголовок"
                rows={3}
              />
            </Form.Item>

            <Form.Item label="Фоновое изображение">
              <Input
                value={config.backgroundImage}
                onChange={(e) => onChange({ backgroundImage: e.target.value })}
                placeholder="URL изображения"
              />
            </Form.Item>

            <Form.Item label="Показать кнопку">
              <Switch
                checked={config.showButton}
                onChange={(checked) => onChange({ showButton: checked })}
              />
            </Form.Item>

            {config.showButton && (
              <Form.Item label="Текст кнопки">
                <Input
                  value={config.buttonText}
                  onChange={(e) => onChange({ buttonText: e.target.value })}
                />
              </Form.Item>
            )}
          </>
        );

      case 'products':
        return (
          <>
            <Form.Item label="Заголовок">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
              />
            </Form.Item>

            <Form.Item label="Макет">
              <Select
                value={config.layout}
                onChange={(value) => onChange({ layout: value })}
                options={[
                  { label: 'Сетка', value: 'grid' },
                  { label: 'Карусель', value: 'carousel' },
                  { label: 'Список', value: 'list' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Колонок">
              <InputNumber
                min={2}
                max={6}
                value={config.columns}
                onChange={(value) => onChange({ columns: value })}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Количество товаров">
              <InputNumber
                min={1}
                max={20}
                value={config.limit}
                onChange={(value) => onChange({ limit: value })}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Фильтр">
              <Select
                value={config.filter}
                onChange={(value) => onChange({ filter: value })}
                options={[
                  { label: 'Все товары', value: 'all' },
                  { label: 'Популярные', value: 'popular' },
                  { label: 'Новинки', value: 'new' },
                  { label: 'Со скидкой', value: 'discounted' },
                ]}
              />
            </Form.Item>
          </>
        );

      case 'categories':
        return (
          <>
            <Form.Item label="Заголовок">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
              />
            </Form.Item>

            <Form.Item label="Колонок">
              <InputNumber
                min={2}
                max={6}
                value={config.columns}
                onChange={(value) => onChange({ columns: value })}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Показать счетчик товаров">
              <Switch
                checked={config.showCount}
                onChange={(checked) => onChange({ showCount: checked })}
              />
            </Form.Item>
          </>
        );

      case 'banner':
        return (
          <>
            <Form.Item label="Изображение">
              <Input
                value={config.image}
                onChange={(e) => onChange({ image: e.target.value })}
                placeholder="URL изображения"
              />
            </Form.Item>

            <Form.Item label="Заголовок">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
              />
            </Form.Item>

            <Form.Item label="Текст">
              <Input.TextArea
                value={config.text}
                onChange={(e) => onChange({ text: e.target.value })}
                rows={3}
              />
            </Form.Item>

            <Form.Item label="Текст кнопки">
              <Input
                value={config.buttonText}
                onChange={(e) => onChange({ buttonText: e.target.value })}
              />
            </Form.Item>

            <Form.Item label="Ссылка кнопки">
              <Input
                value={config.buttonLink}
                onChange={(e) => onChange({ buttonLink: e.target.value })}
                placeholder="/catalog"
              />
            </Form.Item>
          </>
        );

      case 'features':
        return (
          <Card size="small">
            <p>Редактор элементов в разработке</p>
            <small>Количество элементов: {config.items?.length || 0}</small>
          </Card>
        );

      default:
        return (
          <Card size="small">
            <p style={{ color: '#999' }}>Нет настроек для данного типа секции</p>
          </Card>
        );
    }
  };

  return (
    <div>
      <Divider>Настройки секции</Divider>
      <Form layout="vertical">{renderFields()}</Form>
    </div>
  );
}
