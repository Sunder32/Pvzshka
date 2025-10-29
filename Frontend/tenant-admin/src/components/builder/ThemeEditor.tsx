import React from 'react';
import { Card, Form, ColorPicker, Select, Slider, Upload, Button, Space, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface ThemeEditorProps {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: number;
  };
  onChange: (updates: any) => void;
}

const fontOptions = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Raleway', value: 'Raleway' },
];

export default function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  return (
    <div>
      <Card title="Цвета" size="small" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="Основной цвет">
            <ColorPicker
              value={theme.primaryColor}
              onChange={(_, hex) => onChange({ primaryColor: hex })}
              showText
            />
          </Form.Item>

          <Form.Item label="Дополнительный цвет">
            <ColorPicker
              value={theme.secondaryColor}
              onChange={(_, hex) => onChange({ secondaryColor: hex })}
              showText
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="Типографика" size="small" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="Шрифт">
            <Select
              value={theme.fontFamily}
              onChange={(value) => onChange({ fontFamily: value })}
              options={fontOptions}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="Оформление" size="small" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label={`Скругление углов: ${theme.borderRadius}px`}>
            <Slider
              min={0}
              max={20}
              value={theme.borderRadius}
              onChange={(value) => onChange({ borderRadius: value })}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="Логотип" size="small">
        <Upload>
          <Button icon={<UploadOutlined />}>Загрузить логотип</Button>
        </Upload>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <small>Рекомендуемый размер: 300x80px</small>
          </div>
          <div>
            <small>Форматы: PNG, SVG, JPG</small>
          </div>
        </Space>
      </Card>

      <Card title="Быстрые темы" size="small" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            block
            onClick={() =>
              onChange({
                primaryColor: '#0066cc',
                secondaryColor: '#6c757d',
                fontFamily: 'Inter',
              })
            }
          >
            🔵 Классическая синяя
          </Button>
          <Button
            block
            onClick={() =>
              onChange({
                primaryColor: '#28a745',
                secondaryColor: '#6c757d',
                fontFamily: 'Roboto',
              })
            }
          >
            🟢 Эко зеленая
          </Button>
          <Button
            block
            onClick={() =>
              onChange({
                primaryColor: '#dc3545',
                secondaryColor: '#6c757d',
                fontFamily: 'Montserrat',
              })
            }
          >
            🔴 Энергичная красная
          </Button>
          <Button
            block
            onClick={() =>
              onChange({
                primaryColor: '#6f42c1',
                secondaryColor: '#6c757d',
                fontFamily: 'Raleway',
              })
            }
          >
            🟣 Премиум фиолетовая
          </Button>
        </Space>
      </Card>
    </div>
  );
}
