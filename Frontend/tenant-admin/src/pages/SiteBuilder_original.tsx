import React, { useState, useEffect } from 'react';
import { Layout, Card, Tabs, Button, Space, message, Spin, Select, Alert } from 'antd';
import { SaveOutlined, EyeOutlined, UndoOutlined, CloudUploadOutlined } from '@ant-design/icons';
import ThemeEditor from '../components/builder/ThemeEditor';
import LayoutBuilder from '../components/builder/LayoutBuilder';
import ComponentLibrary from '../components/builder/ComponentLibrary';
import PreviewFrame from '../components/builder/PreviewFrame';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

interface SiteConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: number;
  };
  logo: {
    url: string;
    width: number;
    height: number;
  };
  layout: {
    sections: Section[];
  };
}

interface Section {
  id: string;
  type: string;
  config: any;
  order: number;
}

export default function SiteBuilder() {
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [sites, setSites] = useState<any[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load available sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const authData = localStorage.getItem('auth-storage');
        if (!authData) {
          message.warning('Необходима авторизация');
          setLoadingSites(false);
          return;
        }

        const { state } = JSON.parse(authData);
        const token = state?.token;
        const userData = state?.user;

        if (!token || !userData) {
          message.warning('Необходима авторизация');
          setLoadingSites(false);
          return;
        }

        setUser(userData); // Save user to state

        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': userData.id,
            'x-user-role': userData.role,
          },
          body: JSON.stringify({
            query: `
              query AllSites {
                allSites {
                  id
                  siteName
                  domain
                  category
                  isEnabled
                  userId
                  user {
                    email
                    firstName
                  }
                }
              }
            `,
          }),
        });

        const { data } = await response.json();
        console.log('📋 Loaded sites:', data?.allSites);
        const sitesData = data?.allSites || [];
        setSites(sitesData);
        if (sitesData.length > 0) {
          console.log('✅ Selected first site ID:', sitesData[0].id);
          setSelectedSiteId(sitesData[0].id);
        }
      } catch (error) {
        console.error('Error loading sites:', error);
        message.error('Ошибка загрузки списка сайтов: ' + (error as Error).message);
      } finally {
        setLoadingSites(false);
      }
    };
    fetchSites();
  }, []);

  // Load site config via REST API
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [configData, setConfigData] = useState<any>(null);

  const refetch = async () => {
    if (!selectedSiteId) return;
    
    setLoadingConfig(true);
    try {
      const response = await fetch(`http://localhost:4000/api/config/${selectedSiteId}`);
      if (response.ok) {
        const result = await response.json();
        setConfigData(result.data);
      } else if (response.status === 404) {
        // No config exists yet, use default
        setConfigData(null);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Load config when site changes
  useEffect(() => {
    if (selectedSiteId) {
      console.log('🔄 Site changed to:', selectedSiteId);
      setHasChanges(false);
      setSelectedSection(null);
      refetch();
    }
  }, [selectedSiteId]);

  const [config, setConfig] = useState<SiteConfig>({
    theme: {
      primaryColor: '#0066cc',
      secondaryColor: '#6c757d',
      fontFamily: 'Inter',
      borderRadius: 8,
    },
    logo: {
      url: '/logo.png',
      width: 150,
      height: 40,
    },
    layout: {
      sections: [],
    },
  });

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);

  // Load config from REST API
  useEffect(() => {
    if (configData) {
      console.log('📥 Loading config from server for site:', selectedSiteId);
      console.log('📥 Raw data from server:', JSON.stringify(configData, null, 2));
      
      const sections = configData.layout?.sections || [];
      console.log('📥 Sections count from server:', sections.length);
      
      let needsMigration = false;
      
      const validSections = sections
        .filter((s: any) => s && s.id && s.type)
        .map((s: any) => {
          // Проверяем, пустой ли config
          const configIsEmpty = !s.config || Object.keys(s.config).length === 0;
          
          if (configIsEmpty) {
            console.log(`🔧 Migrating section ${s.type}(${s.id}) - adding default config`);
            needsMigration = true;
            const defaultConfig = getDefaultConfig(s.type);
            console.log(`🔧 Default config for ${s.type}:`, defaultConfig);
            
            return {
              id: s.id,
              type: s.type,
              config: defaultConfig,
              order: s.order || 0,
            };
          }
          
          return {
            id: s.id,
            type: s.type,
            config: s.config,
            order: s.order || 0,
          };
        });

      console.log('✅ Valid sections loaded:', validSections.length, validSections.map((s: any) => `${s.type}(${s.id})`));

      setConfig({
        theme: {
          primaryColor: configData.branding?.primaryColor || '#0066cc',
          secondaryColor: configData.branding?.secondaryColor || '#6c757d',
          fontFamily: configData.branding?.fontFamily || 'Inter',
          borderRadius: configData.layout?.borderRadius || 8,
        },
        logo: {
          url: configData.branding?.logo || '/logo.png',
          width: 150,
          height: 40,
        },
        layout: {
          sections: validSections,
        },
      });
      
      if (needsMigration) {
        console.log('💾 Auto-saving migrated data...');
        setHasChanges(true);
        message.warning('Обнаружены секции без настроек. Нажмите "Сохранить" для применения дефолтных значений.', 5);
      } else {
        setHasChanges(false);
      }
    }
  }, [configData, selectedSiteId]);

  const handleThemeChange = (themeUpdates: Partial<SiteConfig['theme']>) => {
    setConfig((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...themeUpdates },
    }));
    setHasChanges(true);
  };

  const handleSectionAdd = (sectionType: string) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type: sectionType,
      config: getDefaultConfig(sectionType),
      order: config.layout.sections.length,
    };

    console.log('➕ Adding new section:', sectionType, 'with ID:', newSection.id);
    
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        layout: {
          sections: [...prev.layout.sections, newSection],
        },
      };
      console.log('✅ New config state:', newConfig);
      return newConfig;
    });
    setHasChanges(true);
    message.success(`Секция "${sectionType}" добавлена`);
  };

  const handleSectionUpdate = (sectionId: string, updates: any) => {
    console.log('🔄 Updating section:', sectionId, 'with updates:', updates);
    setConfig((prev) => {
      // Создаем НОВЫЙ массив только с валидными секциями
      const validSections = prev.layout.sections
        .filter((s) => s && s.id && s.type && s.config)
        .map((section) => {
          if (section.id === sectionId) {
            const newConfig = { ...section.config, ...updates };
            console.log('✅ Section updated:', section.type, 'new config:', newConfig);
            return {
              id: section.id,
              type: section.type,
              config: newConfig,
              order: section.order,
            };
          }
          return {
            id: section.id,
            type: section.type,
            config: section.config,
            order: section.order,
          };
        });

      return {
        ...prev,
        layout: { sections: validSections },
      };
    });
    setHasChanges(true);
  };

  const handleSectionDelete = (sectionId: string) => {
    // КРИТИЧНО: Сбросить selectedSection если удаляемая секция была выбрана
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }

    setConfig((prev) => {
      // Создаем НОВЫЙ массив только с валидными секциями (как в handleSectionAdd)
      const validSections = prev.layout.sections
        .filter((s) => s && s.id && s.type && s.config && s.id !== sectionId)
        .map((s) => ({
          id: s.id,
          type: s.type,
          config: s.config,
          order: s.order,
        }));

      return {
        ...prev,
        layout: {
          sections: validSections,
        },
      };
    });
    setHasChanges(true);
  };

  const handleSectionReorder = (sectionId: string, direction: 'up' | 'down') => {
    // Создаем НОВЫЙ массив только с валидными секциями (как в handleSectionAdd)
    const validSections = config.layout.sections
      .filter(s => s && s.id && s.type && s.config)
      .map(s => ({
        id: s.id,
        type: s.type,
        config: s.config,
        order: s.order,
      }));

    const index = validSections.findIndex((s) => s.id === sectionId);

    if (
      index === -1 ||
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === validSections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [validSections[index], validSections[newIndex]] = [validSections[newIndex], validSections[index]];

    validSections.forEach((section, idx) => {
      section.order = idx;
    });

    setConfig((prev) => ({
      ...prev,
      layout: { sections: validSections },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedSiteId) {
      message.error('Выберите сайт для сохранения');
      return;
    }

    setSaving(true);
    try {
      // Фильтруем только валидные секции перед сохранением
      const validSections = config.layout.sections
        .filter(s => s && s.id && s.type && s.config)
        .map((s) => ({
          id: s.id,
          type: s.type,
          order: s.order,
          visible: true,
          config: s.config,
        }));

      console.log('💾 Saving config for site:', selectedSiteId);
      console.log('💾 Sections to save:', validSections.length, validSections.map(s => `${s.type}(${s.id})`));
      console.log('💾 Full sections data:', JSON.stringify(validSections, null, 2));

      // Use REST API instead of GraphQL
      const apiConfig = {
        branding: {
          logo: config.logo.url,
          primaryColor: config.theme.primaryColor,
          secondaryColor: config.theme.secondaryColor,
          fontFamily: config.theme.fontFamily,
        },
        layout: {
          sections: validSections,
          borderRadius: config.theme.borderRadius,
        },
        features: {},
        homepage: {},
        seo: {},
        integrations: {},
        locale: {},
      };

      const response = await fetch(`http://localhost:4000/api/config/${selectedSiteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to save config');
      }

      const result = await response.json();
      console.log('✅ Save result:', result);
      message.success('Настройки сохранены!');
      setHasChanges(false);
      
      // Refresh data after save
      setTimeout(() => {
        console.log('🔄 Refetching data...');
        refetch();
      }, 500);
    } catch (error) {
      message.error('Ошибка при сохранении');
      console.error('❌ Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedSiteId) {
      message.error('Выберите сайт для публикации');
      return;
    }

    setPublishing(true);
    try {
      await handleSave();
      
      if (!user) {
        throw new Error('Unauthorized - user not found');
      }
      
      // Enable site via GraphQL toggleSite mutation
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
        body: JSON.stringify({
          query: `
            mutation ToggleSite($id: ID!, $isEnabled: Boolean!) {
              toggleSite(id: $id, isEnabled: $isEnabled) {
                id
                isEnabled
                siteName
              }
            }
          `,
          variables: {
            id: selectedSiteId,
            isEnabled: true,
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to publish');
      }

      const selectedSite = sites.find(s => s.id === selectedSiteId);
      message.success(`Сайт "${selectedSite?.siteName}" опубликован!`);
      refetch();
    } catch (error) {
      message.error('Ошибка при публикации');
      console.error(error);
    } finally {
      setPublishing(false);
    }
  };

  if (loadingSites || loadingConfig) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Загрузка конфигурации..." />
      </div>
    );
  }

  const selectedSite = sites.find((s: any) => s.id === selectedSiteId);
  const siteUrl = selectedSite?.domain || 'Не указан';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Left Sidebar - Tools */}
      <Sider width={320} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px' }}>
          <h2>Конструктор сайта</h2>
          
          {/* Site Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Выберите сайт:
            </label>
            <Select
              style={{ width: '100%' }}
              value={selectedSiteId}
              onChange={(value) => setSelectedSiteId(value)}
              placeholder="Выберите сайт"
            >
              {sites.map((site: any) => (
                <Option key={site.id} value={site.id}>
                  {site.siteName} ({site.domain})
                </Option>
              ))}
            </Select>
            {selectedSite && (
              <>
                <Alert
                  message={`Домен: ${siteUrl} | Владелец: ${selectedSite.user?.email || 'Неизвестен'}`}
                  type="info"
                  style={{ marginTop: '8px', fontSize: '12px' }}
                />
                <Button
                  type="primary"
                  block
                  style={{ marginTop: '8px' }}
                  onClick={() => {
                    const url = `http://localhost:8000/${selectedSite.domain}`;
                    window.open(url, '_blank');
                  }}
                >
                  🌐 Открыть сайт
                </Button>
              </>
            )}
          </div>

          <Tabs defaultActiveKey="components">
            <TabPane tab="Компоненты" key="components">
              <ComponentLibrary onAdd={handleSectionAdd} />
            </TabPane>
            <TabPane tab="Тема" key="theme">
              <ThemeEditor theme={config.theme} onChange={handleThemeChange} />
            </TabPane>
          </Tabs>
        </div>
      </Sider>

      {/* Main Content - Preview */}
      <Content style={{ background: '#f5f5f5', position: 'relative' }}>
        {/* Top Toolbar */}
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '12px 24px',
            paddingRight: selectedSection ? '344px' : '24px', // Добавляем отступ справа когда открыта панель (320px + 24px padding)
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'padding-right 0.3s ease',
          }}
        >
          <Space>
            <Button
              type={previewMode === 'desktop' ? 'primary' : 'default'}
              onClick={() => setPreviewMode('desktop')}
            >
              💻 Desktop
            </Button>
            <Button
              type={previewMode === 'tablet' ? 'primary' : 'default'}
              onClick={() => setPreviewMode('tablet')}
            >
              📱 Tablet
            </Button>
            <Button
              type={previewMode === 'mobile' ? 'primary' : 'default'}
              onClick={() => setPreviewMode('mobile')}
            >
              📱 Mobile
            </Button>
          </Space>

          <Space>
            {hasChanges && (
              <Button icon={<UndoOutlined />} onClick={() => {
                refetch();
              }}>
                Отменить
              </Button>
            )}
            <Button 
              icon={<CloudUploadOutlined />} 
              onClick={() => {
                refetch();
                message.info('Превью обновлено');
              }}
              title="Обновить превью с сервера"
            >
              Обновить
            </Button>
            <Button 
              icon={<SaveOutlined />} 
              onClick={handleSave} 
              loading={saving}
              disabled={!hasChanges}
            >
              Сохранить
            </Button>
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              onClick={handlePublish}
              loading={publishing}
            >
              Опубликовать
            </Button>
          </Space>
        </div>

        {/* Preview Area */}
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <PreviewFrame
            key={JSON.stringify(config.layout.sections.map(s => s?.id))}
            config={config}
            mode={previewMode}
            selectedSection={selectedSection}
            onSectionSelect={setSelectedSection}
            onSectionUpdate={handleSectionUpdate}
            onSectionDelete={handleSectionDelete}
            onSectionReorder={handleSectionReorder}
          />
        </div>
      </Content>

      {/* Right Sidebar - Section Editor */}
      {selectedSection && (() => {
        const section = config.layout.sections.find((s) => s && s.id === selectedSection);
        if (!section) return null;
        
        return (
          <Sider 
            width={320} 
            theme="light" 
            style={{ 
              borderLeft: '1px solid #f0f0f0',
              position: 'fixed',
              right: 0,
              top: 0,
              height: '100vh',
              overflowY: 'auto',
              zIndex: 100,
              boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ 
              padding: '16px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '12px',
                position: 'sticky',
                top: 0,
                background: '#fff',
                zIndex: 1,
              }}>
                <h3 style={{ margin: 0 }}>Настройки секции</h3>
                <Button
                  type="text"
                  icon={<span style={{ fontSize: '18px' }}>✕</span>}
                  onClick={() => setSelectedSection(null)}
                  title="Закрыть панель настроек"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <LayoutBuilder
                  section={section}
                  onChange={(updates: any) => handleSectionUpdate(selectedSection, updates)}
                />
              </div>
            </div>
          </Sider>
        );
      })()}
    </Layout>
  );
}

function getDefaultConfig(type: string): any {
  const defaults: Record<string, any> = {
    header: {
      sticky: false,
      showSearch: true,
      showProfile: true,
      showCart: true,
      backgroundColor: '#ffffff',
      textColor: '#000000',
      height: 64,
    },
    hero: {
      title: 'Заголовок',
      subtitle: 'Подзаголовок',
      backgroundImage: '',
      showButton: true,
      buttonText: 'Действие',
    },
    features: {
      items: [
        { icon: 'truck', title: 'Доставка', text: 'Быстрая доставка' },
        { icon: 'shield', title: 'Гарантия', text: 'Гарантия качества' },
      ],
    },
    products: {
      title: 'Популярные товары',
      layout: 'grid',
      columns: 4,
      limit: 8,
    },
    categories: {
      title: 'Категории',
      layout: 'grid',
      columns: 4,
    },
    banner: {
      image: '',
      title: '',
      text: '',
      buttonText: '',
      buttonLink: '',
    },
    testimonials: {
      title: 'Отзывы клиентов',
      showRating: true,
      layout: 'carousel',
      items: [
        {
          author: 'Иван Иванов',
          text: 'Отличный сервис!',
          rating: 5,
        },
      ],
    },
    'custom-html': {
      html: '<div class="custom-section"><p>Пользовательский HTML контент</p></div>',
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    newsletter: {
      title: 'Подпишитесь на рассылку',
      subtitle: 'Получайте актуальные предложения',
      placeholder: 'Ваш email',
      buttonText: 'Подписаться',
      backgroundColor: '#f8f9fa',
    },
    footer: {
      backgroundColor: '#333333',
      textColor: '#ffffff',
      showSocial: true,
      showNewsletter: true,
      copyrightText: '© 2025 Все права защищены',
    },
  };

  return defaults[type] || {};
}

