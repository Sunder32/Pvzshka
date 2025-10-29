import React from 'react';
import { Form, Input, InputNumber, Switch, Select, Card, Divider, ColorPicker, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Color } from 'antd/es/color-picker';

// Предустановленные цветовые палитры
const colorPresets = [
  { label: '🔵 Синие', colors: ['#0066cc', '#1890ff', '#096dd9', '#003a8c', '#40a9ff'] },
  { label: '🟣 Фиолетовые', colors: ['#667eea', '#764ba2', '#9b59b6', '#8e44ad', '#a855f7'] },
  { label: '🟢 Зелёные', colors: ['#52c41a', '#73d13d', '#389e0d', '#237804', '#10b981'] },
  { label: '🔴 Красные', colors: ['#ff4d4f', '#ff7875', '#cf1322', '#a8071a', '#ef4444'] },
  { label: '🟡 Жёлтые', colors: ['#faad14', '#ffc53d', '#d48806', '#ad6800', '#f59e0b'] },
  { label: '⚫ Нейтральные', colors: ['#000000', '#262626', '#595959', '#8c8c8c', '#d9d9d9', '#ffffff'] },
];

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
      case 'header':
        return (
          <>
            <Form.Item label="Логотип URL">
              <Input
                value={config.logoUrl}
                onChange={(e) => onChange({ logoUrl: e.target.value })}
                placeholder="/logo.png"
              />
            </Form.Item>

            <Form.Item label="Название магазина">
              <Input
                value={config.storeName}
                onChange={(e) => onChange({ storeName: e.target.value })}
                placeholder="Мой магазин"
              />
            </Form.Item>

            <Form.Item label="Фиксированный хедер">
              <Switch
                checked={config.sticky}
                onChange={(checked) => onChange({ sticky: checked })}
              />
            </Form.Item>

            <Form.Item label="Показать поиск">
              <Switch
                checked={config.showSearch}
                onChange={(checked) => onChange({ showSearch: checked })}
              />
            </Form.Item>

            <Form.Item label="Показать корзину">
              <Switch
                checked={config.showCart}
                onChange={(checked) => onChange({ showCart: checked })}
              />
            </Form.Item>

            <Form.Item label="Показать профиль">
              <Switch
                checked={config.showProfile}
                onChange={(checked) => onChange({ showProfile: checked })}
              />
            </Form.Item>

            <Form.Item label="Показать логотип">
              <Switch
                checked={config.showLogo !== false}
                onChange={(checked) => onChange({ showLogo: checked })}
              />
            </Form.Item>

            <Form.Item label="Цвет фона">
              <ColorPicker
                value={config.backgroundColor || '#ffffff'}
                onChange={(color) => onChange({ backgroundColor: color.toHexString() })}
                showText
                format="hex"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Цвет текста">
              <ColorPicker
                value={config.textColor || '#000000'}
                onChange={(color) => onChange({ textColor: color.toHexString() })}
                showText
                format="hex"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Высота хедера (px)">
              <InputNumber
                value={config.height || 64}
                onChange={(value) => onChange({ height: value })}
                min={48}
                max={120}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Divider>Меню навигации</Divider>

            {(config.menu || []).map((item: any, index: number) => (
              <Card 
                key={item.id || index} 
                size="small" 
                style={{ marginBottom: 8 }}
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const newMenu = [...(config.menu || [])];
                      newMenu.splice(index, 1);
                      onChange({ menu: newMenu });
                    }}
                  />
                }
              >
                <Form.Item label={`Название #${index + 1}`} style={{ marginBottom: 8 }}>
                  <Input
                    value={item.label}
                    onChange={(e) => {
                      const newMenu = [...(config.menu || [])];
                      newMenu[index] = { ...newMenu[index], label: e.target.value };
                      onChange({ menu: newMenu });
                    }}
                    placeholder="Каталог"
                  />
                </Form.Item>
                <Form.Item label="URL" style={{ marginBottom: 8 }}>
                  <Input
                    value={item.url}
                    onChange={(e) => {
                      const newMenu = [...(config.menu || [])];
                      newMenu[index] = { ...newMenu[index], url: e.target.value };
                      onChange({ menu: newMenu });
                    }}
                    placeholder="/catalog"
                  />
                </Form.Item>
                <Form.Item label="Иконка" style={{ marginBottom: 8 }}>
                  <Select
                    value={item.icon || 'none'}
                    onChange={(value) => {
                      const newMenu = [...(config.menu || [])];
                      newMenu[index] = { ...newMenu[index], icon: value };
                      onChange({ menu: newMenu });
                    }}
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="none">🚫 Без иконки</Select.Option>
                    <Select.Option value="home">🏠 Дом</Select.Option>
                    <Select.Option value="catalog">📦 Каталог</Select.Option>
                    <Select.Option value="cart">🛒 Корзина</Select.Option>
                    <Select.Option value="user">👤 Профиль</Select.Option>
                    <Select.Option value="heart">❤️ Избранное</Select.Option>
                    <Select.Option value="info">ℹ️ Информация</Select.Option>
                    <Select.Option value="phone">📞 Контакты</Select.Option>
                    <Select.Option value="mail">✉️ Сообщения</Select.Option>
                    <Select.Option value="star">⭐ Избранное</Select.Option>
                    <Select.Option value="tag">🏷️ Акции</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Порядок" style={{ marginBottom: 0 }}>
                  <InputNumber
                    value={item.order}
                    onChange={(value) => {
                      const newMenu = [...(config.menu || [])];
                      newMenu[index] = { ...newMenu[index], order: value || 0 };
                      onChange({ menu: newMenu });
                    }}
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Card>
            ))}

            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => {
                const newMenu = [...(config.menu || [])];
                newMenu.push({
                  id: `menu-${Date.now()}`,
                  label: 'Новый пункт',
                  url: '/',
                  order: newMenu.length,
                });
                onChange({ menu: newMenu });
              }}
            >
              Добавить пункт меню
            </Button>
          </>
        );

      case 'hero':
        return (
          <>
            <Form.Item label="Вариант дизайна">
              <Select
                value={config.variant || 'gradient'}
                onChange={(value) => onChange({ variant: value })}
                options={[
                  { label: '🌈 Gradient - Градиентный фон', value: 'gradient' },
                  { label: '✨ Particles - Частицы', value: 'particles' },
                  { label: '🌊 Waves - Волны', value: 'waves' },
                  { label: '🔷 Geometric - Геометрия', value: 'geometric' },
                  { label: '📝 Minimal - Минимализм', value: 'minimal' },
                ]}
              />
            </Form.Item>

            <Divider>Контент</Divider>

            <Form.Item label="Заголовок">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Добро пожаловать в наш магазин"
              />
            </Form.Item>

            <Form.Item label="Подзаголовок">
              <Input.TextArea
                value={config.subtitle}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                placeholder="Лучшие товары по лучшим ценам"
                rows={3}
              />
            </Form.Item>

            <Form.Item label="Текст кнопки">
              <Input
                value={config.buttonText}
                onChange={(e) => onChange({ buttonText: e.target.value })}
                placeholder="Начать покупки"
              />
            </Form.Item>

            <Form.Item label="Ссылка кнопки">
              <Input
                value={config.buttonLink}
                onChange={(e) => onChange({ buttonLink: e.target.value })}
                placeholder="/catalog"
              />
            </Form.Item>

            <Form.Item label="Текст второй кнопки">
              <Input
                value={config.secondaryButtonText}
                onChange={(e) => onChange({ secondaryButtonText: e.target.value })}
                placeholder="Узнать больше (необязательно)"
              />
            </Form.Item>

            <Form.Item label="Ссылка второй кнопки">
              <Input
                value={config.secondaryButtonLink}
                onChange={(e) => onChange({ secondaryButtonLink: e.target.value })}
                placeholder="/about"
              />
            </Form.Item>

            <Form.Item label="Значок (badge)">
              <Input
                value={config.badge}
                onChange={(e) => onChange({ badge: e.target.value })}
                placeholder="✨ НОВАЯ КОЛЛЕКЦИЯ"
              />
            </Form.Item>

            <Form.Item label="Показать статистику">
              <Switch
                checked={config.showStats}
                onChange={(checked) => onChange({ showStats: checked })}
              />
            </Form.Item>

            <Divider>Цвета</Divider>

            <Form.Item label="Цвет градиента (начало)">
              <ColorPicker
                value={config.gradientStart || '#667eea'}
                onChange={(color) => onChange({ gradientStart: color.toHexString() })}
                showText
                format="hex"
                presets={colorPresets}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Цвет градиента (конец)">
              <ColorPicker
                value={config.gradientEnd || '#764ba2'}
                onChange={(color) => onChange({ gradientEnd: color.toHexString() })}
                showText
                format="hex"
                presets={colorPresets}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Цвет текста">
              <ColorPicker
                value={config.textColor || '#ffffff'}
                onChange={(color) => onChange({ textColor: color.toHexString() })}
                showText
                format="hex"
                presets={colorPresets}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Цвет кнопки">
              <ColorPicker
                value={config.buttonColor || '#ffffff'}
                onChange={(color) => onChange({ buttonColor: color.toHexString() })}
                showText
                format="hex"
                presets={colorPresets}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Цвет текста кнопки">
              <ColorPicker
                value={config.buttonTextColor || '#667eea'}
                onChange={(color) => onChange({ buttonTextColor: color.toHexString() })}
                showText
                format="hex"
                presets={colorPresets}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Цвет фона (для Minimal)">
              <ColorPicker
                value={config.backgroundColor || '#ffffff'}
                onChange={(color) => onChange({ backgroundColor: color.toHexString() })}
                showText
                format="hex"
                presets={colorPresets}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        );

      case 'products':
        return (
          <>
            <Form.Item label="Заголовок секции">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Товары из каталога"
              />
            </Form.Item>

            <Form.Item label="Цвет фона">
              <ColorPicker
                value={config.backgroundColor || '#ffffff'}
                onChange={(color) => onChange({ backgroundColor: color.toHexString() })}
                showText
                format="hex"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Divider>Настройки отображения</Divider>

            <Form.Item label="Макет">
              <Select
                value={config.layout || 'grid'}
                onChange={(value) => onChange({ layout: value })}
                options={[
                  { label: 'Сетка', value: 'grid' },
                  { label: 'Карусель', value: 'carousel' },
                  { label: 'Список', value: 'list' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Колонок в сетке">
              <InputNumber
                min={2}
                max={6}
                value={config.columns || 4}
                onChange={(value) => onChange({ columns: value })}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Количество товаров">
              <InputNumber
                min={1}
                max={20}
                value={config.limit || 8}
                onChange={(value) => onChange({ limit: value })}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Фильтр товаров">
              <Select
                value={config.filter || 'all'}
                onChange={(value) => onChange({ filter: value })}
                options={[
                  { label: 'Все товары', value: 'all' },
                  { label: 'Популярные', value: 'popular' },
                  { label: 'Новинки', value: 'new' },
                  { label: 'Со скидкой', value: 'discounted' },
                  { label: 'Хиты продаж', value: 'bestsellers' },
                ]}
              />
            </Form.Item>

            <Divider>Дополнительные опции</Divider>

            <Form.Item label="Показать скидочные бейджи">
              <Switch
                checked={config.showDiscountBadges !== false}
                onChange={(checked) => onChange({ showDiscountBadges: checked })}
              />
            </Form.Item>

            <Form.Item label="Анимация при появлении">
              <Switch
                checked={config.enableAnimations !== false}
                onChange={(checked) => onChange({ enableAnimations: checked })}
              />
            </Form.Item>

            <Form.Item label="Показать старую цену">
              <Switch
                checked={config.showOldPrice !== false}
                onChange={(checked) => onChange({ showOldPrice: checked })}
              />
            </Form.Item>

            <Form.Item label="Показать кнопку 'В корзину'">
              <Switch
                checked={config.showAddToCart !== false}
                onChange={(checked) => onChange({ showAddToCart: checked })}
              />
            </Form.Item>
          </>
        );

      case 'features':
        return (
          <>
            <Form.Item label="Заголовок секции">
              <Input
                value={config.sectionTitle}
                onChange={(e) => onChange({ sectionTitle: e.target.value })}
                placeholder="Наши преимущества"
              />
            </Form.Item>

            <Form.Item label="Цвет фона">
              <ColorPicker
                value={config.backgroundColor || '#f9fafb'}
                onChange={(color) => onChange({ backgroundColor: color.toHexString() })}
                showText
                format="hex"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Divider>Карточки преимуществ</Divider>

            {(config.items || []).map((item: any, index: number) => (
              <Card 
                key={index} 
                size="small" 
                style={{ marginBottom: 16 }}
                title={`Преимущество ${index + 1}`}
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const newItems = [...(config.items || [])];
                      newItems.splice(index, 1);
                      onChange({ items: newItems });
                    }}
                  />
                }
              >
                <Form.Item label="Иконка">
                  <Select
                    value={item.icon}
                    onChange={(value) => {
                      const newItems = [...(config.items || [])];
                      newItems[index] = { ...item, icon: value };
                      onChange({ items: newItems });
                    }}
                    options={[
                      { label: '⭐ Звезда', value: 'star' },
                      { label: '🛒 Корзина', value: 'cart' },
                      { label: '🚚 Доставка', value: 'truck' },
                      { label: '🛡️ Защита', value: 'shield' },
                      { label: '⚡ Скорость', value: 'zap' },
                      { label: '❤️ Сердце', value: 'heart' },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Заголовок">
                  <Input
                    value={item.title}
                    onChange={(e) => {
                      const newItems = [...(config.items || [])];
                      newItems[index] = { ...item, title: e.target.value };
                      onChange({ items: newItems });
                    }}
                  />
                </Form.Item>

                <Form.Item label="Описание">
                  <Input.TextArea
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...(config.items || [])];
                      newItems[index] = { ...item, description: e.target.value };
                      onChange({ items: newItems });
                    }}
                    rows={2}
                  />
                </Form.Item>
              </Card>
            ))}

            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => {
                const newItems = [
                  ...(config.items || []),
                  { icon: 'star', title: 'Новое преимущество', description: 'Описание преимущества' },
                ];
                onChange({ items: newItems });
              }}
            >
              Добавить преимущество
            </Button>
          </>
        );

      case 'categories':
        return (
          <>
            <Form.Item label="Заголовок">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Категории товаров"
              />
            </Form.Item>

            <Form.Item label="Цвет фона">
              <ColorPicker
                value={config.backgroundColor || '#f9fafb'}
                onChange={(color) => onChange({ backgroundColor: color.toHexString() })}
                showText
                format="hex"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Колонок">
              <InputNumber
                min={2}
                max={6}
                value={config.columns || 4}
                onChange={(value) => onChange({ columns: value })}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Показать счетчик товаров">
              <Switch
                checked={config.showCount !== false}
                onChange={(checked) => onChange({ showCount: checked })}
              />
            </Form.Item>

            <Form.Item label="Показать иконки">
              <Switch
                checked={config.showIcons !== false}
                onChange={(checked) => onChange({ showIcons: checked })}
              />
            </Form.Item>

            <Divider>Категории</Divider>

            {(config.categories || []).map((cat: any, index: number) => (
              <Card 
                key={index} 
                size="small" 
                style={{ marginBottom: 16 }}
                title={`Категория ${index + 1}`}
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const newCats = [...(config.categories || [])];
                      newCats.splice(index, 1);
                      onChange({ categories: newCats });
                    }}
                  />
                }
              >
                <Form.Item label="Название">
                  <Input
                    value={cat.name}
                    onChange={(e) => {
                      const newCats = [...(config.categories || [])];
                      newCats[index] = { ...cat, name: e.target.value };
                      onChange({ categories: newCats });
                    }}
                  />
                </Form.Item>

                <Form.Item label="Иконка (emoji)">
                  <Input
                    value={cat.icon}
                    onChange={(e) => {
                      const newCats = [...(config.categories || [])];
                      newCats[index] = { ...cat, icon: e.target.value };
                      onChange({ categories: newCats });
                    }}
                    placeholder="📦"
                  />
                </Form.Item>

                <Form.Item label="Ссылка">
                  <Input
                    value={cat.link}
                    onChange={(e) => {
                      const newCats = [...(config.categories || [])];
                      newCats[index] = { ...cat, link: e.target.value };
                      onChange({ categories: newCats });
                    }}
                    placeholder="/category/electronics"
                  />
                </Form.Item>
              </Card>
            ))}

            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => {
                const newCats = [
                  ...(config.categories || []),
                  { name: 'Новая категория', icon: '📦', link: '/category/new' },
                ];
                onChange({ categories: newCats });
              }}
            >
              Добавить категорию
            </Button>
          </>
        );

      case 'banner':
        return (
          <>
            <Form.Item label="Заголовок">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Специальное предложение"
              />
            </Form.Item>

            <Form.Item label="Описание">
              <Input.TextArea
                value={config.description}
                onChange={(e) => onChange({ description: e.target.value })}
                rows={3}
                placeholder="Получите скидку 20% на первый заказ"
              />
            </Form.Item>

            <Form.Item label="Текст кнопки">
              <Input
                value={config.buttonText}
                onChange={(e) => onChange({ buttonText: e.target.value })}
                placeholder="Узнать больше"
              />
            </Form.Item>

            <Form.Item label="Ссылка кнопки">
              <Input
                value={config.buttonLink}
                onChange={(e) => onChange({ buttonLink: e.target.value })}
                placeholder="/promo"
              />
            </Form.Item>

            <Divider>Дизайн</Divider>

            <Form.Item label="Цвет фона (начало градиента)">
              <ColorPicker
                value={config.backgroundColor || '#667eea'}
                onChange={(color) => onChange({ backgroundColor: color.toHexString() })}
                showText
                format="hex"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Цвет фона (конец градиента)">
              <ColorPicker
                value={config.gradientEnd || '#764ba2'}
                onChange={(color) => onChange({ gradientEnd: color.toHexString() })}
                showText
                format="hex"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Фоновое изображение (URL)">
              <Input
                value={config.backgroundImage}
                onChange={(e) => onChange({ backgroundImage: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </Form.Item>

            <Form.Item label="Высота баннера (px)">
              <InputNumber
                min={200}
                max={800}
                value={config.height || 400}
                onChange={(value) => onChange({ height: value })}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        );

      case 'hot-deals':
        return (
          <>
            <Form.Item label="Заголовок">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="🔥 Горячие предложения"
              />
            </Form.Item>

            <Form.Item label="Цвет фона">
              <ColorPicker
                value={config.backgroundColor || '#fef3c7'}
                onChange={(color) => onChange({ backgroundColor: color.toHexString() })}
                showText
                format="hex"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Количество предложений">
              <InputNumber
                min={1}
                max={6}
                value={config.dealsCount || 3}
                onChange={(value) => onChange({ dealsCount: value })}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Автоматическая ротация">
              <Switch
                checked={config.autoRotate !== false}
                onChange={(checked) => onChange({ autoRotate: checked })}
              />
            </Form.Item>

            {config.autoRotate !== false && (
              <Form.Item label="Интервал ротации (сек)">
                <InputNumber
                  min={3}
                  max={30}
                  value={config.rotateInterval || 5}
                  onChange={(value) => onChange({ rotateInterval: value })}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
          </>
        );

      case 'newsletter':
        return (
          <>
            <Form.Item label="Заголовок">
              <Input
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="📧 Подпишитесь на рассылку"
              />
            </Form.Item>

            <Form.Item label="Описание">
              <Input.TextArea
                value={config.description}
                onChange={(e) => onChange({ description: e.target.value })}
                rows={2}
                placeholder="Получайте лучшие предложения и новости первыми"
              />
            </Form.Item>

            <Form.Item label="Placeholder поля email">
              <Input
                value={config.placeholder}
                onChange={(e) => onChange({ placeholder: e.target.value })}
                placeholder="Введите ваш email"
              />
            </Form.Item>

            <Form.Item label="Текст кнопки">
              <Input
                value={config.buttonText}
                onChange={(e) => onChange({ buttonText: e.target.value })}
                placeholder="Подписаться"
              />
            </Form.Item>

            <Divider>Дизайн</Divider>

            <Form.Item label="Цвет фона">
              <ColorPicker
                value={config.backgroundColor || '#667eea'}
                onChange={(color) => onChange({ backgroundColor: color.toHexString() })}
                showText
                format="hex"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Показывать паттерн фона">
              <Switch
                checked={config.showPattern !== false}
                onChange={(checked) => onChange({ showPattern: checked })}
              />
            </Form.Item>

            <Form.Item label="Центрировать форму">
              <Switch
                checked={config.centerForm !== false}
                onChange={(checked) => onChange({ centerForm: checked })}
              />
            </Form.Item>
          </>
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
