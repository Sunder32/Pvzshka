import { Input, Switch, ColorPicker, InputNumber, Button, Space, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

interface HeaderConfig {
  sticky: boolean;
  showSearch: boolean;
  showProfile: boolean;
  showCart: boolean;
  showLogo: boolean;
  logoUrl?: string;
  logoText?: string;
  backgroundColor: string;
  textColor: string;
  height: number;
  menu: MenuItem[];
}

interface HeaderSettingsProps {
  config: HeaderConfig;
  onChange: (config: HeaderConfig) => void;
}

export default function HeaderSettings({ config, onChange }: HeaderSettingsProps) {
  const handleMenuItemChange = (index: number, field: keyof MenuItem, value: any) => {
    const newMenu = [...(config.menu || [])];
    newMenu[index] = { ...newMenu[index], [field]: value };
    onChange({ ...config, menu: newMenu });
  };

  const addMenuItem = () => {
    const newMenu = [...(config.menu || [])];
    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      label: 'Новый пункт',
      url: '/',
      order: newMenu.length,
    };
    newMenu.push(newItem);
    onChange({ ...config, menu: newMenu });
  };

  const removeMenuItem = (index: number) => {
    const newMenu = [...(config.menu || [])];
    newMenu.splice(index, 1);
    onChange({ ...config, menu: newMenu });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Настройки хедера</h3>

      {/* Основные настройки */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Фиксированный хедер</label>
          <Switch
            checked={config.sticky}
            onChange={(checked) => onChange({ ...config, sticky: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Показывать поиск</label>
          <Switch
            checked={config.showSearch}
            onChange={(checked) => onChange({ ...config, showSearch: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Показывать профиль</label>
          <Switch
            checked={config.showProfile}
            onChange={(checked) => onChange({ ...config, showProfile: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Показывать корзину</label>
          <Switch
            checked={config.showCart}
            onChange={(checked) => onChange({ ...config, showCart: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Показывать логотип</label>
          <Switch
            checked={config.showLogo}
            onChange={(checked) => onChange({ ...config, showLogo: checked })}
          />
        </div>
      </div>

      {/* Логотип */}
      {config.showLogo && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-1">URL логотипа</label>
            <Input
              value={config.logoUrl}
              onChange={(e) => onChange({ ...config, logoUrl: e.target.value })}
              placeholder="/logo.png"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Текст логотипа</label>
            <Input
              value={config.logoText}
              onChange={(e) => onChange({ ...config, logoText: e.target.value })}
              placeholder="Marketplace"
            />
          </div>
        </div>
      )}

      {/* Цвета */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Цвет фона</label>
          <ColorPicker
            value={config.backgroundColor}
            onChange={(_, hex) => onChange({ ...config, backgroundColor: hex })}
            showText
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Цвет текста</label>
          <ColorPicker
            value={config.textColor}
            onChange={(_, hex) => onChange({ ...config, textColor: hex })}
            showText
          />
        </div>
      </div>

      {/* Высота */}
      <div>
        <label className="block text-sm font-medium mb-1">Высота хедера (px)</label>
        <InputNumber
          value={config.height}
          onChange={(value) => onChange({ ...config, height: value || 64 })}
          min={48}
          max={120}
          style={{ width: '100%' }}
        />
      </div>

      {/* Меню навигации */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Меню навигации</h4>
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={addMenuItem}
          >
            Добавить пункт
          </Button>
        </div>

        {(config.menu || []).map((item, index) => (
          <div key={item.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Пункт #{index + 1}</span>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeMenuItem(index)}
              />
            </div>
            <Input
              placeholder="Название"
              value={item.label}
              onChange={(e) => handleMenuItemChange(index, 'label', e.target.value)}
            />
            <Input
              placeholder="URL (например: /catalog)"
              value={item.url}
              onChange={(e) => handleMenuItemChange(index, 'url', e.target.value)}
            />
            <InputNumber
              placeholder="Порядок"
              value={item.order}
              onChange={(value) => handleMenuItemChange(index, 'order', value || 0)}
              min={0}
              style={{ width: '100%' }}
            />
          </div>
        ))}

        {(!config.menu || config.menu.length === 0) && (
          <div className="text-center text-gray-400 py-4">
            Нет пунктов меню. Нажмите "Добавить пункт" чтобы создать.
          </div>
        )}
      </div>
    </div>
  );
}
