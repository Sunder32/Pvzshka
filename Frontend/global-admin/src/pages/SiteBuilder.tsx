import React, { useState, useEffect } from 'react';
import { Layout, Card, Tabs, Button, Space, message, Spin, Select, Alert } from 'antd';
import { SaveOutlined, EyeOutlined, UndoOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import ThemeEditor from '../components/builder/ThemeEditor';
import LayoutBuilder from '../components/builder/LayoutBuilder';
import ComponentLibrary from '../components/builder/ComponentLibrary';
import PreviewFrame from '../components/builder/PreviewFrame';
import {
  GET_SITE_CONFIG,
  SAVE_SITE_CONFIG,
  PUBLISH_SITE_CONFIG,
} from '../lib/graphql';

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
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  // Load available tenants
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          message.warning('Необходима авторизация');
          setLoadingTenants(false);
          return;
        }

        const response = await fetch('http://localhost:8080/api/tenants', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setTenants(data.tenants || []);
        if (data.tenants && data.tenants.length > 0) {
          setSelectedTenantId(data.tenants[0].id);
        }
      } catch (error) {
        console.error('Error loading tenants:', error);
        message.error('Ошибка загрузки списка сайтов: ' + (error as Error).message);
      } finally {
        setLoadingTenants(false);
      }
    };
    fetchTenants();
  }, []);

  // Load site config
  const { data, loading, refetch } = useQuery(GET_SITE_CONFIG, {
    variables: { tenantId: selectedTenantId },
    skip: !selectedTenantId,
  });

  // Mutations
  const [saveSiteConfig, { loading: saving }] = useMutation(SAVE_SITE_CONFIG);
  const [publishSiteConfig, { loading: publishing }] = useMutation(PUBLISH_SITE_CONFIG);

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

  // Load config from GraphQL
  useEffect(() => {
    if (data?.siteConfig) {
      // Sanitize sections - создаем НОВЫЙ массив только с валидными секциями
      const validSections = (data.siteConfig.layout?.sections || [])
        .filter((s: any) => s && s.id && s.type && s.config)
        .map((s: any) => ({
          id: s.id,
          type: s.type,
          config: s.config,
          order: s.order || 0,
        }));

      setConfig({
        theme: data.siteConfig.theme || {
          primaryColor: '#0066cc',
          secondaryColor: '#6c757d',
          fontFamily: 'Inter',
          borderRadius: 8,
        },
        logo: {
          url: data.siteConfig.logo || '/logo.png',
          width: 150,
          height: 40,
        },
        layout: {
          sections: validSections,
        },
      });
    }
  }, [data]);

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

    setConfig((prev) => ({
      ...prev,
      layout: {
        sections: [...prev.layout.sections, newSection],
      },
    }));
    setHasChanges(true);
  };

  const handleSectionUpdate = (sectionId: string, updates: any) => {
    setConfig((prev) => {
      // Создаем НОВЫЙ массив только с валидными секциями
      const validSections = prev.layout.sections
        .filter((s) => s && s.id && s.type && s.config)
        .map((section) => {
          if (section.id === sectionId) {
            return {
              id: section.id,
              type: section.type,
              config: { ...section.config, ...updates },
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
    try {
      await saveSiteConfig({
        variables: {
          tenantId: selectedTenantId,
          logo: config.logo.url,
          theme: {
            primaryColor: config.theme.primaryColor,
            secondaryColor: config.theme.secondaryColor,
            fontFamily: config.theme.fontFamily,
            borderRadius: config.theme.borderRadius,
          },
          layout: {
            header: {
              showLogo: true,
              showSearch: true,
              showCart: true,
              menu: [],
            },
            footer: {
              showNewsletter: true,
              showSocial: true,
              columns: [],
            },
            sections: config.layout.sections.map((s) => ({
              id: s.id,
              type: s.type,
              order: s.order,
              visible: true,
              config: s.config,
            })),
          },
        },
      });
      message.success('Настройки сохранены!');
      setHasChanges(false);
      refetch();
    } catch (error) {
      message.error('Ошибка при сохранении');
      console.error(error);
    }
  };

  const handlePublish = async () => {
    try {
      await handleSave();
      await publishSiteConfig({
        variables: { tenantId: selectedTenantId },
      });
      message.success('Сайт опубликован!');
      refetch();
    } catch (error) {
      message.error('Ошибка при публикации');
      console.error(error);
    }
  };

  if (loadingTenants || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Загрузка конфигурации..." />
      </div>
    );
  }

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const siteUrl = selectedTenant?.custom_domain || `${selectedTenant?.subdomain}.yourplatform.com`;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Left Sidebar - Tools */}
      <Sider width={320} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px' }}>
          <h2>Конструктор сайта</h2>
          
          {/* Tenant Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Выберите сайт:
            </label>
            <Select
              style={{ width: '100%' }}
              value={selectedTenantId}
              onChange={(value) => setSelectedTenantId(value)}
              placeholder="Выберите tenant"
            >
              {tenants.map(tenant => (
                <Option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </Option>
              ))}
            </Select>
            {selectedTenant && (
              <Alert
                message={`Адрес сайта: ${siteUrl}`}
                type="info"
                style={{ marginTop: '8px', fontSize: '12px' }}
              />
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
              <Button icon={<UndoOutlined />} onClick={() => window.location.reload()}>
                Отменить
              </Button>
            )}
            <Button icon={<SaveOutlined />} onClick={handleSave} disabled={!hasChanges}>
              Сохранить
            </Button>
            <Button type="primary" icon={<EyeOutlined />} onClick={handlePublish}>
              Опубликовать
            </Button>
          </Space>
        </div>

        {/* Preview Area */}
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <PreviewFrame
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
          <Sider width={320} theme="light" style={{ borderLeft: '1px solid #f0f0f0' }}>
            <div style={{ padding: '16px' }}>
              <h3>Настройки секции</h3>
              <LayoutBuilder
                section={section}
                onChange={(updates: any) => handleSectionUpdate(selectedSection, updates)}
              />
            </div>
          </Sider>
        );
      })()}
    </Layout>
  );
}

function getDefaultConfig(type: string): any {
  const defaults: Record<string, any> = {
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
  };

  return defaults[type] || {};
}
