import React, { useMemo } from 'react';
import { Card, Button, Space, Popconfirm } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';

interface PreviewFrameProps {
  config: any;
  mode: 'desktop' | 'tablet' | 'mobile';
  selectedSection: string | null;
  onSectionSelect: (id: string) => void;
  onSectionUpdate: (id: string, updates: any) => void;
  onSectionDelete: (id: string) => void;
  onSectionReorder: (id: string, direction: 'up' | 'down') => void;
}

export default function PreviewFrame({
  config,
  mode,
  selectedSection,
  onSectionSelect,
  onSectionDelete,
  onSectionReorder,
}: PreviewFrameProps) {
  // Логирование для отладки
  console.log('🖼️ PreviewFrame render, sections count:', config?.layout?.sections?.length || 0);
  
  // Проверяем config перед использованием
  if (!config) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
        Конфигурация не загружена
      </div>
    );
  }

  if (!config.theme) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
        Тема не загружена
      </div>
    );
  }

  // Мемоизируем валидные секции для предотвращения ре-рендера с устаревшими данными
  const validSections = useMemo(() => {
    if (!config.layout?.sections) {
      console.log('❌ No sections in config.layout');
      return [];
    }
    
    console.log('🔍 Filtering sections, total:', config.layout.sections.length);
    
    // КРИТИЧНО: Фильтруем ТАК ЖЕ как в SiteBuilder.tsx
    const filtered = config.layout.sections
      .filter((s: any) => {
        const isValid = s && s.id && s.type && s.config;
        if (!isValid) {
          console.log('❌ Invalid section:', s);
        }
        return isValid;
      })
      .map((s: any) => ({
        id: s.id,
        type: s.type,
        config: s.config,
        order: s.order || 0,
      }))
      .sort((a: any, b: any) => a.order - b.order);
      
    console.log('✅ Valid sections after filter:', filtered.length, filtered);
    return filtered;
  }, [config]);

  const getFrameWidth = () => {
    switch (mode) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      case 'desktop':
      default:
        return 1200;
    }
  };

  const renderSection = (section: any) => {
    // КРИТИЧНО: Проверяем ВСЕ обязательные поля (как в SiteBuilder)
    if (!section || !section.id || !section.type || !section.config) {
      console.error('Invalid section in renderSection:', section);
      return null;
    }

    // Проверяем наличие темы
    if (!config || !config.theme) {
      console.error('Missing config or theme');
      return null;
    }

    const isSelected = selectedSection === section.id;

    return (
      <div
        key={section.id}
        onClick={() => onSectionSelect(section.id)}
        style={{
          position: 'relative',
          border: isSelected ? '2px solid #1890ff' : '2px solid transparent',
          borderRadius: config.theme.borderRadius,
          marginBottom: 16,
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.border = '2px dashed #d9d9d9';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.border = '2px solid transparent';
          }
        }}
      >
        {/* Section Toolbar - показываем ВСЕГДА */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            padding: '4px 8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <Space size="small">
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onSectionReorder(section.id, 'up');
              }}
              title="Переместить вверх"
            />
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onSectionReorder(section.id, 'down');
              }}
              title="Переместить вниз"
            />
            <Button
              size="small"
              icon={<EditOutlined />}
              type={isSelected ? 'primary' : 'default'}
              onClick={(e) => {
                e.stopPropagation();
                onSectionSelect(section.id);
              }}
              title="Редактировать"
            />
            <Popconfirm
              title="Удалить секцию?"
              description="Это действие нельзя отменить"
              onConfirm={(e) => {
                e?.stopPropagation();
                onSectionDelete(section.id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Удалить"
              cancelText="Отмена"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
                title="Удалить секцию"
              />
            </Popconfirm>
          </Space>
        </div>

        {/* Section Content - INLINE рендеринг без отдельного компонента */}
        {section && section.type && section.config && (() => {
          const sType = section.type;
          const sConfig = section.config;
          const sTheme = config.theme;

          switch (sType) {
            case 'header':
              return (
                <div style={{
                  background: sConfig.backgroundColor || '#fff',
                  borderBottom: '1px solid #f0f0f0',
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: sTheme.borderRadius,
                  marginBottom: '16px',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: sConfig.textColor || sTheme.primaryColor }}>
                    {sConfig.logoUrl ? (
                      <img src={sConfig.logoUrl} alt="Logo" style={{ height: 40 }} />
                    ) : (
                      sConfig.storeName || 'Header'
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: sConfig.textColor || '#000' }}>
                    {sConfig.showSearch && <span>🔍 Поиск</span>}
                    {sConfig.showCart && <span>🛒 Корзина</span>}
                    {sConfig.showProfile && <span>👤 Профиль</span>}
                  </div>
                </div>
              );

            case 'hero':
              return (
                <div style={{
                  background: `linear-gradient(135deg, ${sTheme.primaryColor} 0%, ${sTheme.secondaryColor} 100%)`,
                  color: '#fff',
                  padding: '80px 40px',
                  textAlign: 'center',
                  borderRadius: sTheme.borderRadius,
                }}>
                  <h1 style={{ fontSize: 48, marginBottom: 16 }}>{sConfig.title || 'Заголовок'}</h1>
                  <p style={{ fontSize: 20, marginBottom: 32 }}>{sConfig.subtitle || 'Подзаголовок'}</p>
                  {sConfig.showButton && (
                    <button style={{
                      background: '#fff',
                      color: sTheme.primaryColor,
                      border: 'none',
                      padding: '12px 32px',
                      fontSize: 16,
                      borderRadius: sTheme.borderRadius,
                      cursor: 'pointer',
                    }}>
                      {sConfig.buttonText || 'Действие'}
                    </button>
                  )}
                </div>
              );

            case 'features':
              return (
                <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: 36, marginBottom: 40, color: sTheme.primaryColor }}>
                    {sConfig.title || 'Наши преимущества'}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {(sConfig.items || []).map((item: any, idx: number) => (
                      <div key={idx} style={{ padding: 20, background: '#f9f9f9', borderRadius: sTheme.borderRadius }}>
                        <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon || '⭐'}</div>
                        <h3 style={{ fontSize: 20, marginBottom: 8 }}>{item.title || 'Заголовок'}</h3>
                        <p style={{ color: '#666' }}>{item.description || 'Описание'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'products':
              return (
                <div style={{ padding: '60px 40px' }}>
                  <h2 style={{ fontSize: 36, marginBottom: 40, textAlign: 'center', color: sTheme.primaryColor }}>
                    {sConfig.title || 'Популярные товары'}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ border: '1px solid #e0e0e0', borderRadius: sTheme.borderRadius, overflow: 'hidden' }}>
                        <div style={{ height: 200, background: '#f0f0f0' }}></div>
                        <div style={{ padding: 16 }}>
                          <h4>Товар {i}</h4>
                          <p style={{ color: sTheme.primaryColor, fontWeight: 'bold' }}>1 999 ₽</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'cta':
              return (
                <div style={{
                  background: sTheme.primaryColor,
                  color: '#fff',
                  padding: '60px 40px',
                  textAlign: 'center',
                  borderRadius: sTheme.borderRadius,
                }}>
                  <h2 style={{ fontSize: 36, marginBottom: 16 }}>{sConfig.title || 'Готовы начать?'}</h2>
                  <p style={{ fontSize: 18, marginBottom: 32 }}>{sConfig.subtitle || 'Присоединяйтесь к нам сегодня'}</p>
                  <button style={{
                    background: '#fff',
                    color: sTheme.primaryColor,
                    border: 'none',
                    padding: '12px 32px',
                    fontSize: 16,
                    borderRadius: sTheme.borderRadius,
                    cursor: 'pointer',
                  }}>
                    {sConfig.buttonText || 'Начать'}
                  </button>
                </div>
              );

            default:
              return (
                <div style={{
                  padding: '40px',
                  background: '#f9f9f9',
                  borderRadius: sTheme.borderRadius,
                }}>
                  <p style={{ color: '#999' }}>Секция типа: {sType}</p>
                </div>
              );
          }
        })()}
      </div>
    );
  };

  return (
    <div
      style={{
        width: getFrameWidth(),
        margin: '0 auto',
        background: '#fff',
        minHeight: '800px',
        boxShadow: '0 0 30px rgba(0,0,0,0.1)',
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'width 0.3s',
      }}
    >
      {/* Header Preview - ДИНАМИЧЕСКИЙ */}
      {(() => {
        const headerSection = validSections.find((s: any) => s.type === 'header');
        const headerConfig = headerSection?.config || {};
        
        return (
          <div
            style={{
              background: headerConfig.backgroundColor || '#fff',
              borderBottom: '1px solid #f0f0f0',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: headerConfig.sticky ? 'sticky' : 'relative',
              top: 0,
              zIndex: 100,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 'bold', color: headerConfig.textColor || config.theme.primaryColor }}>
              {headerConfig.logoUrl ? (
                <img src={headerConfig.logoUrl} alt="Logo" style={{ height: 40 }} />
              ) : (
                headerConfig.storeName || 'Marketplace'
              )}
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              {headerConfig.showSearch && (
                <span style={{ cursor: 'pointer', color: headerConfig.textColor || '#000' }}>🔍 Поиск</span>
              )}
              <span style={{ cursor: 'pointer', color: headerConfig.textColor || '#000' }}>Каталог</span>
              {headerConfig.showCart && (
                <span style={{ cursor: 'pointer', color: headerConfig.textColor || '#000' }}>🛒 Корзина</span>
              )}
              {headerConfig.showProfile && (
                <span style={{ cursor: 'pointer', color: headerConfig.textColor || '#000' }}>👤 Профиль</span>
              )}
            </div>
          </div>
        );
      })()}

      {/* Sections */}
      <div style={{ padding: 24 }}>
        {(() => {
          console.log('🎨 Rendering all sections:', validSections.length, validSections.map((s: any) => s.type));
          
          return validSections.map((section: any) => {
            // КРИТИЧНО: Проверка перед рендерингом
            if (!section || !section.id || !section.type || !section.config) {
              console.error('Invalid section in map:', section);
              return null;
            }
            
            // Рендерим напрямую без обертки
            return renderSection(section);
          });
        })()}

        {validSections.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '100px 20px',
              color: '#999',
            }}
          >
            <p style={{ fontSize: 18, marginBottom: 8 }}>Страница пуста</p>
            <p>Добавьте компоненты из библиотеки слева</p>
          </div>
        )}
      </div>

      {/* Footer Preview */}
      <div
        style={{
          background: '#1f1f1f',
          color: '#fff',
          padding: '40px 24px',
          marginTop: 60,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p>&copy; 2024 Marketplace. Все права защищены.</p>
        </div>
      </div>
    </div>
  );
}
