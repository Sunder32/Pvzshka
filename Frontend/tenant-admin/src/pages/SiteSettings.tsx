import { useState, useEffect } from 'react';
import { Box, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel, VStack, FormControl, FormLabel, Input, Button, useToast, Card, CardBody, Spinner, Center, HStack, Switch } from '@chakra-ui/react';
import { useAuthStore } from '../store/auth';

interface TenantConfig {
  tenantId: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
  homepage: {
    hero: { enabled: boolean; title: string; subtitle: string };
    featuredProducts: { enabled: boolean; title: string; limit: number };
    categories: { enabled: boolean; title: string };
  };
  features: {
    wishlist: boolean;
    reviews: boolean;
    chat: boolean;
  };
}

export default function SiteSettings() {
  const { token, user } = useAuthStore();
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user?.tenantId) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    if (!user?.tenantId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/sites/${user.tenantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const configData = data.config || data;
        // Преобразуем данные из БД (JSONB theme) в формат интерфейса
        setConfig({
          tenantId: user.tenantId,
          branding: {
            primaryColor: configData.theme?.primaryColor || '#6B46C1',
            secondaryColor: configData.theme?.secondaryColor || '#805AD5',
            logo: configData.logo || '',
          },
          homepage: {
            hero: { enabled: true, title: 'Welcome', subtitle: 'Shop now' },
            featuredProducts: { enabled: true, title: 'Featured', limit: 8 },
            categories: { enabled: true, title: 'Categories' },
          },
          features: {
            wishlist: true,
            reviews: true,
            chat: true,
          },
        });
      } else {
        // Если конфигурации нет, создаем дефолтную
        setConfig({
          tenantId: user.tenantId,
          branding: {
            primaryColor: '#6B46C1',
            secondaryColor: '#805AD5',
            logo: '',
          },
          homepage: {
            hero: { enabled: true, title: 'Welcome to our store', subtitle: 'Discover amazing products' },
            featuredProducts: { enabled: true, title: 'Featured Products', limit: 8 },
            categories: { enabled: true, title: 'Shop by Category' },
          },
          features: {
            wishlist: true,
            reviews: true,
            chat: true,
          },
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({ title: 'Failed to load settings', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config || !user?.tenantId) return;
    
    try {
      setSaving(true);
      const response = await fetch(`http://localhost:8080/api/sites/${user.tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          logo: config.branding.logo,
          theme: {
            primaryColor: config.branding.primaryColor,
            secondaryColor: config.branding.secondaryColor,
            fontFamily: 'Inter',
            borderRadius: 8,
          },
          layout: {},
          status: 'draft',
        }),
      });

      if (response.ok) {
        toast({ title: 'Settings saved successfully', status: 'success', duration: 3000 });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast({ title: 'Failed to save settings', status: 'error', duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Center h="400px"><Spinner size="xl" color="purple.500" thickness="4px" /></Center>;
  }

  if (!config) {
    return <Center h="400px"><Text>No configuration found</Text></Center>;
  }

  return (
    <Box>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Site Settings</Heading>
        <Text color="gray.600">Configure your store appearance and features</Text>
      </Box>

      <Tabs colorScheme="purple" variant="enclosed">
        <TabList>
          <Tab>Branding</Tab>
          <Tab>Homepage</Tab>
          <Tab>Features</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Primary Color</FormLabel>
                    <HStack>
                      <Input type="color" value={config.branding.primaryColor} onChange={(e) => setConfig({ ...config, branding: { ...config.branding, primaryColor: e.target.value } })} w="100px" />
                      <Input value={config.branding.primaryColor} onChange={(e) => setConfig({ ...config, branding: { ...config.branding, primaryColor: e.target.value } })} />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Secondary Color</FormLabel>
                    <HStack>
                      <Input type="color" value={config.branding.secondaryColor} onChange={(e) => setConfig({ ...config, branding: { ...config.branding, secondaryColor: e.target.value } })} w="100px" />
                      <Input value={config.branding.secondaryColor} onChange={(e) => setConfig({ ...config, branding: { ...config.branding, secondaryColor: e.target.value } })} />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Logo URL</FormLabel>
                    <Input value={config.branding.logo || ''} onChange={(e) => setConfig({ ...config, branding: { ...config.branding, logo: e.target.value } })} placeholder="https://example.com/logo.png" />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Card>
                <CardBody>
                  <FormControl display="flex" alignItems="center" mb={4}>
                    <FormLabel mb="0">Enable Hero Section</FormLabel>
                    <Switch isChecked={config.homepage.hero.enabled} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, hero: { ...config.homepage.hero, enabled: e.target.checked } } })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Hero Title</FormLabel>
                    <Input value={config.homepage.hero.title} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, hero: { ...config.homepage.hero, title: e.target.value } } })} />
                  </FormControl>
                  <FormControl mt={3}>
                    <FormLabel>Hero Subtitle</FormLabel>
                    <Input value={config.homepage.hero.subtitle} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, hero: { ...config.homepage.hero, subtitle: e.target.value } } })} />
                  </FormControl>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <FormControl display="flex" alignItems="center" mb={4}>
                    <FormLabel mb="0">Enable Featured Products</FormLabel>
                    <Switch isChecked={config.homepage.featuredProducts.enabled} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, featuredProducts: { ...config.homepage.featuredProducts, enabled: e.target.checked } } })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Section Title</FormLabel>
                    <Input value={config.homepage.featuredProducts.title} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, featuredProducts: { ...config.homepage.featuredProducts, title: e.target.value } } })} />
                  </FormControl>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Enable Categories Section</FormLabel>
                    <Switch isChecked={config.homepage.categories.enabled} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, categories: { ...config.homepage.categories, enabled: e.target.checked } } })} />
                  </FormControl>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          <TabPanel>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Enable Wishlist</FormLabel>
                    <Switch isChecked={config.features.wishlist} onChange={(e) => setConfig({ ...config, features: { ...config.features, wishlist: e.target.checked } })} />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Enable Reviews</FormLabel>
                    <Switch isChecked={config.features.reviews} onChange={(e) => setConfig({ ...config, features: { ...config.features, reviews: e.target.checked } })} />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Enable Live Chat</FormLabel>
                    <Switch isChecked={config.features.chat} onChange={(e) => setConfig({ ...config, features: { ...config.features, chat: e.target.checked } })} />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Box mt={6}>
        <Button colorScheme="purple" size="lg" onClick={saveConfig} isLoading={saving} loadingText="Saving...">Save Changes</Button>
      </Box>
    </Box>
  );
}