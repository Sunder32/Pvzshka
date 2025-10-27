import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  VStack,
  HStack,
  useToast,
  Heading,
  Text,
  Spinner,
  Center,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { FaSave, FaEye, FaRocket, FaUndo, FaDesktop, FaTablet, FaMobile } from 'react-icons/fa';
import { useAuthStore } from '../store/auth';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: number;
}

interface Section {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  config: any;
}

interface SiteConfig {
  theme: ThemeConfig;
  logo: string | null;
  layout: {
    sections: Section[];
  };
}

const API_URL = 'http://localhost:8080/api';

export default function SiteBuilder() {
  const toast = useToast();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SiteConfig>({
    theme: {
      primaryColor: '#0066cc',
      secondaryColor: '#ff6600',
      fontFamily: 'Inter',
      borderRadius: 8,
    },
    logo: null,
    layout: {
      sections: [],
    },
  });
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Load configuration from API
  useEffect(() => {
    const loadConfig = async () => {
      if (!token || !user?.tenantId) {
        setLoading(false);
        return;
      }

      try {
        const tenantId = user.tenantId;
        
        const response = await fetch(`${API_URL}/sites/${tenantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.config) {
            setConfig({
              theme: data.config.theme || config.theme,
              logo: data.config.logo || null,
              layout: {
                sections: Array.isArray(data.config.layout?.sections) 
                  ? data.config.layout.sections 
                  : [],
              },
            });
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading config:', error);
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить конфигурацию сайта',
          status: 'error',
          duration: 3000,
        });
        setLoading(false);
      }
    };
    loadConfig();
  }, [token, user]);

  const handleSave = async () => {
    if (!token || !user?.tenantId) {
      toast({
        title: 'Ошибка',
        description: 'Вы не авторизованы',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setSaving(true);
    try {
      const tenantId = user.tenantId;
      
      const response = await fetch(`${API_URL}/sites/${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast({
        title: 'Сохранено',
        description: 'Настройки сайта сохранены как черновик',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!token || !user?.tenantId) {
      toast({
        title: 'Ошибка',
        description: 'Вы не авторизованы',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await handleSave();
      
      const tenantId = user.tenantId;
      
      const response = await fetch(`${API_URL}/sites/${tenantId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to publish');
      }

      toast({
        title: 'Опубликовано!',
        description: 'Ваш сайт обновлен и виден посетителям',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: 'Ошибка публикации',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleThemeChange = (updates: Partial<ThemeConfig>) => {
    setConfig((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...updates },
    }));
  };

  const handleAddSection = (type: string) => {
    const currentSections = config.layout?.sections || [];
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      order: currentSections.length,
      visible: true,
      config: {},
    };
    setConfig((prev) => ({
      ...prev,
      layout: {
        sections: [...currentSections, newSection],
      },
    }));
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="lg">Конструктор сайта</Heading>
          <Text color="gray.600">Настройте внешний вид вашего магазина</Text>
          {user?.subdomain && (
            <Text fontSize="sm" color="blue.600" mt={1}>
              <strong>Адрес сайта:</strong> {user.customDomain || `${user.subdomain}.yourplatform.com`}
            </Text>
          )}
        </Box>
        <HStack>
          <Button leftIcon={<FaUndo />} variant="outline">
            Отменить
          </Button>
          <Button
            leftIcon={<FaSave />}
            colorScheme="blue"
            isLoading={saving}
            onClick={handleSave}
          >
            Сохранить
          </Button>
          <Button leftIcon={<FaRocket />} colorScheme="green" onClick={handlePublish}>
            Опубликовать
          </Button>
        </HStack>
      </HStack>

      <Grid templateColumns="300px 1fr 320px" gap={4} h="calc(100vh - 200px)">
        {/* Левая панель - Инструменты */}
        <Card>
          <CardBody>
            <Tabs>
              <TabList>
                <Tab>Компоненты</Tab>
                <Tab>Тема</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <VStack align="stretch" spacing={2}>
                    <Text fontWeight="bold" mb={2}>
                      Добавить секцию:
                    </Text>
                    <Button size="sm" onClick={() => handleAddSection('hero')}>
                      Hero Баннер
                    </Button>
                    <Button size="sm" onClick={() => handleAddSection('products')}>
                      Товары
                    </Button>
                    <Button size="sm" onClick={() => handleAddSection('categories')}>
                      Категории
                    </Button>
                    <Button size="sm" onClick={() => handleAddSection('banner')}>
                      Баннер
                    </Button>
                    <Button size="sm" onClick={() => handleAddSection('features')}>
                      Преимущества
                    </Button>
                  </VStack>
                </TabPanel>
                <TabPanel px={0}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="bold" mb={2}>
                        Основной цвет
                      </Text>
                      <input
                        type="color"
                        value={config.theme.primaryColor}
                        onChange={(e) => handleThemeChange({ primaryColor: e.target.value })}
                        style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                      />
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={2}>
                        Дополнительный цвет
                      </Text>
                      <input
                        type="color"
                        value={config.theme.secondaryColor}
                        onChange={(e) => handleThemeChange({ secondaryColor: e.target.value })}
                        style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                      />
                    </Box>
                    <Divider />
                    <Button
                      size="sm"
                      onClick={() =>
                        handleThemeChange({
                          primaryColor: '#0066cc',
                          secondaryColor: '#ff6600',
                        })
                      }
                    >
                      Сбросить тему
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {/* Центр - Предпросмотр */}
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="bold">Предпросмотр</Text>
              <HStack>
                <IconButton
                  aria-label="Desktop"
                  icon={<FaDesktop />}
                  size="sm"
                  variant={previewMode === 'desktop' ? 'solid' : 'outline'}
                  onClick={() => setPreviewMode('desktop')}
                />
                <IconButton
                  aria-label="Tablet"
                  icon={<FaTablet />}
                  size="sm"
                  variant={previewMode === 'tablet' ? 'solid' : 'outline'}
                  onClick={() => setPreviewMode('tablet')}
                />
                <IconButton
                  aria-label="Mobile"
                  icon={<FaMobile />}
                  size="sm"
                  variant={previewMode === 'mobile' ? 'solid' : 'outline'}
                  onClick={() => setPreviewMode('mobile')}
                />
              </HStack>
            </HStack>
            <Box
              bg="white"
              borderRadius="md"
              overflow="auto"
              h="calc(100vh - 340px)"
              border="1px solid"
              borderColor="gray.200"
            >
              <Box
                mx="auto"
                w={
                  previewMode === 'desktop'
                    ? '100%'
                    : previewMode === 'tablet'
                    ? '768px'
                    : '375px'
                }
                bg="gray.50"
                minH="100%"
              >
                {/* Header Preview */}
                <Box bg={config.theme.primaryColor} color="white" p={4}>
                  <Text fontSize="xl" fontWeight="bold">
                    {config.logo || 'Мой Магазин'}
                  </Text>
                </Box>

                {/* Sections Preview */}
                {config.layout?.sections?.map((section) => (
                  <Box
                    key={section.id}
                    p={6}
                    bg={selectedSection === section.id ? 'blue.50' : 'white'}
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    cursor="pointer"
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <Text fontWeight="bold">Секция: {section.type}</Text>
                  </Box>
                ))}

                {(!config.layout?.sections || config.layout.sections.length === 0) && (
                  <Center p={10}>
                    <Text color="gray.400">Добавьте секции из левой панели</Text>
                  </Center>
                )}
              </Box>
            </Box>
          </CardBody>
        </Card>

        {/* Правая панель - Настройки */}
        <Card>
          <CardBody>
            <Text fontWeight="bold" mb={4}>
              Настройки секции
            </Text>
            {selectedSection ? (
              <VStack align="stretch" spacing={4}>
                <Text fontSize="sm" color="gray.600">
                  Выбрана секция: {selectedSection}
                </Text>
                {/* TODO: Добавить формы настройки для каждого типа секции */}
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.400">
                Выберите секцию для настройки
              </Text>
            )}
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
}
