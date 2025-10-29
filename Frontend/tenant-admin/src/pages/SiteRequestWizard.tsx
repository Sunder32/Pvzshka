import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  Progress,
  Select,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

interface SiteRequestForm {
  siteName: string;
  domain: string;
  description: string;
  category: string;
  email: string;
  phone: string;
  expectedProducts: string;
  businessType: string;
  tags: string[];
}

export default function SiteRequestWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const { user, token } = useAuthStore();

  const [formData, setFormData] = useState<SiteRequestForm>({
    siteName: '',
    domain: '',
    description: '',
    category: '',
    email: '',
    phone: '',
    expectedProducts: '',
    businessType: '',
    tags: [],
  });

  const handleInputChange = (field: keyof SiteRequestForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!user || !token) {
        throw new Error('Необходима авторизация');
      }
      
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
        body: JSON.stringify({
          query: `
            mutation CreateSiteRequest($input: CreateSiteRequestInput!) {
              createSiteRequest(input: $input) {
                id
                siteName
                status
                createdAt
              }
            }
          `,
          variables: {
            input: {
              siteName: formData.siteName,
              domain: formData.domain,
              description: formData.description,
              category: formData.category,
              email: formData.email,
              phone: formData.phone,
              expectedProducts: formData.expectedProducts,
              businessType: formData.businessType,
              tags: formData.tags,
            },
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Ошибка при отправке заявки');
      }

      toast({
        title: 'Заявка отправлена!',
        description: 'Ваша заявка на создание сайта отправлена на рассмотрение администраторам. Мы свяжемся с вами в ближайшее время.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/my-sites');
    } catch (error) {
      console.error('Error submitting site request:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить заявку. Попробуйте позже.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = formData.siteName && formData.domain && formData.category;
  const canProceedToStep3 = formData.email && formData.phone;
  const canSubmit = formData.description && formData.businessType;

  return (
    <Box maxW="800px" mx="auto" p={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Создание нового сайта</Heading>
          <Text color="gray.600">
            Заполните форму для создания нового интернет-магазина
          </Text>
        </Box>

        <Progress value={(step / 3) * 100} size="sm" colorScheme="blue" />

        <Card>
          <CardBody>
            {step === 1 && (
              <VStack spacing={4} align="stretch">
                <Heading size="md">Шаг 1: Основная информация</Heading>

                <FormControl isRequired>
                  <FormLabel>Название сайта</FormLabel>
                  <Input
                    placeholder="Мой Магазин"
                    value={formData.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Желаемый домен</FormLabel>
                  <Input
                    placeholder="mystore"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Будет доступен по адресу: {formData.domain || 'mystore'}.yourplatform.com
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Категория товаров</FormLabel>
                  <Select
                    placeholder="Выберите категорию"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="electronics">Электроника</option>
                    <option value="clothing">Одежда и обувь</option>
                    <option value="food">Продукты питания</option>
                    <option value="beauty">Красота и здоровье</option>
                    <option value="home">Товары для дома</option>
                    <option value="sports">Спорт и отдых</option>
                    <option value="books">Книги</option>
                    <option value="other">Другое</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Теги (например: эко, премиум, handmade)</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Добавьте тег"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button onClick={addTag} colorScheme="blue" variant="outline">
                      Добавить
                    </Button>
                  </HStack>
                  <HStack mt={2} flexWrap="wrap">
                    {formData.tags.map((tag) => (
                      <Tag key={tag} size="md" colorScheme="blue" borderRadius="full">
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => removeTag(tag)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>

                <Button
                  colorScheme="blue"
                  onClick={() => setStep(2)}
                  isDisabled={!canProceedToStep2}
                  size="lg"
                  mt={4}
                >
                  Далее →
                </Button>
              </VStack>
            )}

            {step === 2 && (
              <VStack spacing={4} align="stretch">
                <Heading size="md">Шаг 2: Контактная информация</Heading>

                <FormControl isRequired>
                  <FormLabel>Email для связи</FormLabel>
                  <Input
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Телефон</FormLabel>
                  <Input
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Ожидаемое количество товаров</FormLabel>
                  <Select
                    placeholder="Выберите диапазон"
                    value={formData.expectedProducts}
                    onChange={(e) => handleInputChange('expectedProducts', e.target.value)}
                  >
                    <option value="0-100">До 100 товаров</option>
                    <option value="100-500">100-500 товаров</option>
                    <option value="500-1000">500-1000 товаров</option>
                    <option value="1000+">Более 1000 товаров</option>
                  </Select>
                </FormControl>

                <HStack spacing={4} mt={4}>
                  <Button variant="outline" onClick={() => setStep(1)} size="lg">
                    ← Назад
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => setStep(3)}
                    isDisabled={!canProceedToStep3}
                    flex={1}
                    size="lg"
                  >
                    Далее →
                  </Button>
                </HStack>
              </VStack>
            )}

            {step === 3 && (
              <VStack spacing={4} align="stretch">
                <Heading size="md">Шаг 3: Дополнительная информация</Heading>

                <FormControl isRequired>
                  <FormLabel>Тип бизнеса</FormLabel>
                  <Select
                    placeholder="Выберите тип"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                  >
                    <option value="retail">Розничная торговля</option>
                    <option value="wholesale">Оптовая торговля</option>
                    <option value="manufacturer">Производитель</option>
                    <option value="dropshipping">Дропшиппинг</option>
                    <option value="services">Услуги</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Описание бизнеса</FormLabel>
                  <Textarea
                    placeholder="Расскажите о вашем бизнесе, целевой аудитории и особенностях..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Минимум 50 символов ({formData.description.length}/50)
                  </Text>
                </FormControl>

                <Box bg="blue.50" p={4} borderRadius="md">
                  <Heading size="sm" mb={2}>Что дальше?</Heading>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm">✅ Ваша заявка будет рассмотрена администраторами</Text>
                    <Text fontSize="sm">✅ Мы свяжемся с вами в течение 24 часов</Text>
                    <Text fontSize="sm">✅ После одобрения вы получите доступ к конструктору сайта</Text>
                  </VStack>
                </Box>

                <HStack spacing={4} mt={4}>
                  <Button variant="outline" onClick={() => setStep(2)} size="lg">
                    ← Назад
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={handleSubmit}
                    isLoading={loading}
                    isDisabled={!canSubmit || formData.description.length < 50}
                    flex={1}
                    size="lg"
                  >
                    Отправить заявку
                  </Button>
                </HStack>
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
