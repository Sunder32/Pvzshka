import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Tabs, Button, Space, message, Spin, Select, Alert } from 'antd';
import { SaveOutlined, EyeOutlined, UndoOutlined, CloudUploadOutlined } from '@ant-design/icons';
import ThemeEditor from '../components/builder/ThemeEditor';
import LayoutBuilder from '../components/builder/LayoutBuilder';
import ComponentLibrary from '../components/builder/ComponentLibrary';
import PreviewFrame from '../components/builder/PreviewFrame';
import { useAuthStore } from '../store/auth';
import { useSiteStore } from '../store/site';

const { Content, Sider } = Layout;

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

function getDefaultConfig(type: string): any {
  const defaults: Record<string, any> = {
    header: {
      sticky: false,
      showSearch: true,
      showProfile: true,
      showCart: true,
      showWishlist: true,
      backgroundColor: '#ffffff',
      textColor: '#333333',
    },
    hero: {
      title: 'Заголовок',
      subtitle: 'Подзаголовок',
      buttonText: 'Узнать больше',
      buttonLink: '/catalog',
      backgroundImage: '',
      backgroundColor: '#f0f0f0',
      textColor: '#333333',
      height: 400,
    },
    products: {
      title: 'Популярные товары',
      limit: 8,
      columns: 4,
      showFilters: true,
      showSort: true,
      categoryId: null,
    },
    categories: {
      title: 'Категории',
      layout: 'grid',
      columns: 4,
      showImages: true,
      showCount: true,
    },
    features: {
      title: 'Наши преимущества',
      items: [
        { icon: 'CheckCircle', title: 'Качество', description: 'Только проверенные товары' },
        { icon: 'Truck', title: 'Доставка', description: 'Быстрая доставка по всему миру' },
        { icon: 'Shield', title: 'Гарантия', description: 'Официальная гарантия производителя' },
      ],
    },
    newsletter: {
      title: 'Подпишитесь на рассылку',
      subtitle: 'Получайте первыми информацию о новинках и специальных предложениях',
      placeholder: 'Введите ваш email',
      buttonText: 'Подписаться',
      backgroundColor: '#f8f9fa',
      textColor: '#333333',
    },
    footer: {
      backgroundColor: '#333333',
      textColor: '#ffffff',
      showSocial: true,
      showNewsletter: true,
      copyrightText: '© 2024 Все права защищены',
    },
  };

  return defaults[type] || {};
}

export default function SiteBuilder() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { activeSite, sites, setActiveSite, setSites } = useSiteStore();

  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [configData, setConfigData] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [hasChanges, setHasChanges] = useState(false);

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

  // Load sites from GraphQL
  useEffect(() => {
    const loadSites = async () => {
      if (!token || !user) {
        message.warning('Необходима авторизация');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:4000/api/sites/my', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': user.id.toString(),
          },
        });

        if (!response.ok) throw new Error('Failed to load sites');

        const result = await response.json();
        if (result.success) {
          const fetchedSites = result.data || [];
          setSites(fetchedSites);

          // Set active site from URL or first site
          if (siteId) {
            const site = fetchedSites.find((s: any) => s.id === siteId);
            if (site) setActiveSite(site);
          } else if (fetchedSites.length > 0 && !activeSite) {
            setActiveSite(fetchedSites[0]);
          }
        }
      } catch (error) {
        console.error('Error loading sites:', error);
        message.error('Не удалось загрузить список сайтов');
      } finally {
        setLoadingSites(false);
      }
    };

    loadSites();
  }, [token, user, siteId]);

  const refetch = async () => {
    if (!activeSite?.id) return;
    
    setLoadingConfig(true);
    try {
      const response = await fetch(`http://localhost:4000/api/config/${activeSite.id}`);
      if (response.ok) {
        const result = await response.json();
        setConfigData(result.data);
      } else if (response.status === 404) {
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
    if (activeSite?.id) {
      setHasChanges(false);
      setSelectedSection(null);
      refetch();
    }
  }, [activeSite?.id]);

  // Process loaded config data
  useEffect(() => {
    if (configData) {
      const sections = configData.layout?.sections || [];
      let needsMigration = false;

      const validSections = sections
        .filter((s: any) => s && s.id && s.type)
        .map((s: any) => {
          const configIsEmpty = !s.config || Object.keys(s.config).length === 0;
          if (configIsEmpty) {
            needsMigration = true;
            return {
              id: s.id,
              type: s.type,
              config: getDefaultConfig(s.type),
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
        setHasChanges(true);
        message.warning('Обнаружены секции без настроек. Нажмите "Сохранить" для применения дефолтных значений.', 5);
      } else {
        setHasChanges(false);
      }
    }
  }, [configData]);

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
    message.success(`Секция "${sectionType}" добавлена`);
  };

  const handleSectionUpdate = (sectionId: string, updates: any) => {
    setConfig((prev) => ({
      ...prev,
      layout: {
        sections: prev.layout.sections
          .filter((s) => s && s.id && s.type && s.config)
          .map((section) =>
            section.id === sectionId
              ? { ...section, config: { ...section.config, ...updates } }
              : section
          ),
      },
    }));
    setHasChanges(true);
  };

  const handleSectionDelete = (sectionId: string) => {
    if (selectedSection === sectionId) setSelectedSection(null);
    setConfig((prev) => ({
      ...prev,
      layout: {
        sections: prev.layout.sections.filter((s) => s && s.id !== sectionId),
      },
    }));
    setHasChanges(true);
  };

  const handleSectionReorder = (sectionId: string, direction: 'up' | 'down') => {
    const validSections = config.layout.sections.filter((s) => s && s.id && s.type && s.config);
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
    if (!activeSite?.id || !token) {
      message.error('Необходимо выбрать сайт');
      return;
    }

    setSaving(true);
    try {
      const validSections = config.layout.sections
        .filter((s) => s && s.id && s.type && s.config)
        .map((s) => ({
          id: s.id,
          type: s.type,
          order: s.order,
          visible: true,
          config: s.config,
        }));

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

      const response = await fetch(`http://localhost:4000/api/config/${activeSite.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiConfig),
      });

      if (!response.ok) throw new Error('Failed to save config');

      message.success('Настройки сохранены!');
      setHasChanges(false);
      setTimeout(() => refetch(), 500);
    } catch (error) {
      message.error('Ошибка при сохранении');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!activeSite?.id || !token || !user) {
      message.error('Необходимо выбрать сайт и авторизоваться');
      return;
    }

    setPublishing(true);
    try {
      await handleSave();

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': user.id.toString(),
          'x-user-role': user.role,
        },
        body: JSON.stringify({
          query: `
            mutation {
              toggleSite(id: "${activeSite.id}", isEnabled: true) {
                id
                isEnabled
                siteName
              }
            }
          `,
        }),
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);

      // Инвалидация кэша после публикации
      try {
        await fetch(`http://localhost:4000/api/config/invalidate/${activeSite.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('✅ Кэш очищен для сайта:', activeSite.id);
      } catch (cacheError) {
        console.error('⚠️ Ошибка очистки кэша:', cacheError);
        // Не прерываем процесс публикации из-за ошибки кэша
      }

      message.success('Сайт опубликован! Кэш очищен.');
      refetch();
    } catch (error) {
      message.error('Ошибка при публикации');
      console.error(error);
    } finally {
      setPublishing(false);
    }
  };

  const handleSiteChange = (newSiteId: string) => {
    const site = sites.find((s) => s.id === newSiteId);
    if (site) {
      setActiveSite(site);
      navigate(`/site-builder/${newSiteId}`);
    }
  };

  if (loadingSites || loadingConfig) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Загрузка конфигурации..." />
      </div>
    );
  }

  if (!activeSite) {
    return (
      <Alert
        message="Сайт не выбран"
        description="Пожалуйста, выберите сайт из списка или создайте новый"
        type="warning"
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  const section = config.layout.sections.find((s) => s && s.id === selectedSection);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={320} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px' }}>
          <h2>Конструктор сайта</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Выберите сайт:
            </label>
            <Select
              style={{ width: '100%' }}
              value={activeSite.id}
              onChange={handleSiteChange}
              placeholder="Выберите сайт"
            >
              {sites.map((site: any) => (
                <Select.Option key={site.id} value={site.id}>
                  {site.siteName} ({site.domain})
                </Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              block
              style={{ marginTop: '8px' }}
              onClick={() => {
                const url = `http://localhost:3003?site=${activeSite.domain}`;
                window.open(url, '_blank');
              }}
            >
              🌐 Открыть сайт
            </Button>
          </div>

          <Tabs defaultActiveKey="components">
            <Tabs.TabPane tab="Компоненты" key="components">
              <ComponentLibrary onAdd={handleSectionAdd} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Тема" key="theme">
              <ThemeEditor theme={config.theme} onChange={handleThemeChange} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Sider>

      <Content style={{ background: '#f5f5f5', position: 'relative' }}>
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
              <Button icon={<UndoOutlined />} onClick={() => refetch()}>
                Отменить
              </Button>
            )}
            <Button
              icon={<CloudUploadOutlined />}
              onClick={() => {
                refetch();
                message.info('Превью обновлено');
              }}
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

      {selectedSection && section && (
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
          <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0 }}>Настройки секции</h3>
              <Button
                type="text"
                icon={<span style={{ fontSize: '18px' }}>✕</span>}
                onClick={() => setSelectedSection(null)}
                title="Закрыть панель настроек"
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <LayoutBuilder
                section={section}
                onChange={(updates) => handleSectionUpdate(section.id, updates)}
              />
            </div>
          </div>
        </Sider>
      )}
    </Layout>
  );
}
