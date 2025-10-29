import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  InputGroup,
  InputLeftElement,
  Select,
  Textarea,
} from '@chakra-ui/react'
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  ViewIcon,
  ViewOffIcon,
  DragHandleIcon,
  SettingsIcon,
  StarIcon,
  InfoIcon,
  PhoneIcon,
} from '@chakra-ui/icons'
import { useParams } from 'react-router-dom'

interface PageConfig {
  id: string
  name: string
  slug: string
  title: string
  description?: string
  isEnabled: boolean
  icon: string
  showInMenu: boolean
  menuOrder: number
  sections: PageSection[]
}

interface PageSection {
  id: string
  type: string
  config: any
  order: number
}

const defaultPages: PageConfig[] = [
  {
    id: 'catalog',
    name: 'Каталог',
    slug: '/catalog',
    title: 'Каталог товаров',
    description: 'Список всех товаров с фильтрами и сортировкой',
    isEnabled: true,
    icon: '📦',
    showInMenu: true,
    menuOrder: 1,
    sections: [],
  },
  {
    id: 'profile',
    name: 'Профиль',
    slug: '/profile',
    title: 'Личный кабинет',
    description: 'Управление профилем пользователя',
    isEnabled: true,
    icon: '👤',
    showInMenu: true,
    menuOrder: 2,
    sections: [],
  },
  {
    id: 'cart',
    name: 'Корзина',
    slug: '/cart',
    title: 'Корзина покупок',
    description: 'Товары добавленные в корзину',
    isEnabled: true,
    icon: '🛒',
    showInMenu: true,
    menuOrder: 3,
    sections: [],
  },
  {
    id: 'favorites',
    name: 'Избранное',
    slug: '/favorites',
    title: 'Избранные товары',
    description: 'Список избранных товаров',
    isEnabled: true,
    icon: '❤️',
    showInMenu: true,
    menuOrder: 4,
    sections: [],
  },
  {
    id: 'orders',
    name: 'Заказы',
    slug: '/orders',
    title: 'Мои заказы',
    description: 'История заказов пользователя',
    isEnabled: true,
    icon: '📋',
    showInMenu: true,
    menuOrder: 5,
    sections: [],
  },
  {
    id: 'about',
    name: 'О компании',
    slug: '/about',
    title: 'О нас',
    description: 'Информация о компании',
    isEnabled: true,
    icon: 'ℹ️',
    showInMenu: true,
    menuOrder: 6,
    sections: [],
  },
  {
    id: 'contacts',
    name: 'Контакты',
    slug: '/contacts',
    title: 'Контактная информация',
    description: 'Способы связи с нами',
    isEnabled: true,
    icon: '📞',
    showInMenu: true,
    menuOrder: 7,
    sections: [],
  },
]

export default function PagesEditor() {
  const { siteId } = useParams()
  const toast = useToast()
  const [pages, setPages] = useState<PageConfig[]>(defaultPages)
  const [loading, setLoading] = useState(false)
  const [selectedPage, setSelectedPage] = useState<PageConfig | null>(null)
  const [sites, setSites] = useState<any[]>([])
  const [currentSiteId, setCurrentSiteId] = useState<string>('')

  useEffect(() => {
    loadSites()
  }, [])

  useEffect(() => {
    if (currentSiteId) {
      loadPages()
    }
  }, [currentSiteId])

  const loadSites = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/sites/my', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to load sites')
      
      const data = await response.json()
      setSites(data)
      
      // Если есть siteId в URL, используем его, иначе первый сайт
      if (siteId) {
        setCurrentSiteId(siteId)
      } else if (data.length > 0) {
        setCurrentSiteId(data[0].id.toString())
      }
    } catch (error) {
      console.error('Error loading sites:', error)
    }
  }

  const loadPages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:4000/api/config/${currentSiteId}`)
      if (!response.ok) throw new Error('Не удалось загрузить конфигурацию')
      
      const data = await response.json()
      if (data.pages && Array.isArray(data.pages)) {
        setPages(data.pages)
      }
    } catch (error) {
      console.error('Error loading pages:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить страницы',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const savePages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:4000/api/config/${currentSiteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages }),
      })

      if (!response.ok) throw new Error('Не удалось сохранить')

      toast({
        title: 'Сохранено',
        description: 'Настройки страниц успешно обновлены',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error saving pages:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePage = (pageId: string) => {
    setPages(pages.map(p => 
      p.id === pageId ? { ...p, isEnabled: !p.isEnabled } : p
    ))
  }

  const toggleMenuVisibility = (pageId: string) => {
    setPages(pages.map(p => 
      p.id === pageId ? { ...p, showInMenu: !p.showInMenu } : p
    ))
  }

  const updatePage = (pageId: string, updates: Partial<PageConfig>) => {
    setPages(pages.map(p => 
      p.id === pageId ? { ...p, ...updates } : p
    ))
  }

  const addCustomPage = () => {
    const newPage: PageConfig = {
      id: `custom-${Date.now()}`,
      name: 'Новая страница',
      slug: '/new-page',
      title: 'Новая страница',
      description: '',
      isEnabled: true,
      icon: '📄',
      showInMenu: true,
      menuOrder: pages.length + 1,
      sections: [],
    }
    setPages([...pages, newPage])
    setSelectedPage(newPage)
  }

  const deletePage = (pageId: string) => {
    if (window.confirm('Удалить страницу?')) {
      setPages(pages.filter(p => p.id !== pageId))
      if (selectedPage?.id === pageId) {
        setSelectedPage(null)
      }
    }
  }

  const getIconForPage = (iconString: string) => {
    const iconMap: { [key: string]: any } = {
      '📦': ViewIcon,
      '👤': SettingsIcon,
      '🛒': ViewIcon,
      '❤️': StarIcon,
      '📋': EditIcon,
      'ℹ️': InfoIcon,
      '📞': PhoneIcon,
    }
    return iconMap[iconString] || ViewIcon
  }

  return (
    <Box p={8}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading size="lg">Управление страницами</Heading>
          <HStack>
            {sites.length > 1 && (
              <Select
                value={currentSiteId}
                onChange={(e) => setCurrentSiteId(e.target.value)}
                width="300px"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name || `Сайт #${site.id}`}
                  </option>
                ))}
              </Select>
            )}
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={addCustomPage}
            >
              Добавить страницу
            </Button>
            <Button
              colorScheme="green"
              onClick={savePages}
              isLoading={loading}
            >
              Сохранить изменения
            </Button>
          </HStack>
        </HStack>

        <Text color="gray.600">
          Настройте, какие страницы доступны на вашем сайте и их отображение в меню
        </Text>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Список страниц</Tab>
            <Tab>Редактор {selectedPage && `(${selectedPage.name})`}</Tab>
          </TabList>

          <TabPanels>
            {/* Список страниц */}
            <TabPanel>
              <Accordion allowMultiple>
                {pages.map((page) => (
                  <AccordionItem key={page.id}>
                    <AccordionButton>
                      <HStack flex="1" spacing={4}>
                        <DragHandleIcon color="gray.400" />
                        <Text fontSize="2xl">{page.icon}</Text>
                        <VStack align="start" spacing={0} flex={1}>
                          <HStack>
                            <Text fontWeight="bold">{page.name}</Text>
                            {!page.isEnabled && (
                              <Badge colorScheme="red">Отключено</Badge>
                            )}
                            {page.showInMenu && (
                              <Badge colorScheme="green">В меню</Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {page.slug}
                          </Text>
                        </VStack>
                        <HStack>
                          <Tooltip label={page.isEnabled ? 'Отключить' : 'Включить'}>
                            <IconButton
                              aria-label="toggle"
                              icon={page.isEnabled ? <ViewIcon /> : <ViewOffIcon />}
                              size="sm"
                              colorScheme={page.isEnabled ? 'green' : 'gray'}
                              onClick={(e) => {
                                e.stopPropagation()
                                togglePage(page.id)
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Редактировать">
                            <IconButton
                              aria-label="edit"
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="blue"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPage(page)
                              }}
                            />
                          </Tooltip>
                          {page.id.startsWith('custom-') && (
                            <Tooltip label="Удалить">
                              <IconButton
                                aria-label="delete"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deletePage(page.id)
                                }}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </HStack>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <VStack align="stretch" spacing={4}>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">
                            Отображать в меню
                          </FormLabel>
                          <Switch
                            isChecked={page.showInMenu}
                            onChange={() => toggleMenuVisibility(page.id)}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Порядок в меню</FormLabel>
                          <Input
                            type="number"
                            value={page.menuOrder}
                            onChange={(e) =>
                              updatePage(page.id, { menuOrder: parseInt(e.target.value) })
                            }
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Описание</FormLabel>
                          <Text fontSize="sm" color="gray.600">
                            {page.description || 'Нет описания'}
                          </Text>
                        </FormControl>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabPanel>

            {/* Редактор страницы */}
            <TabPanel>
              {selectedPage ? (
                <Card>
                  <CardBody>
                    <VStack align="stretch" spacing={6}>
                      <Heading size="md">Редактирование: {selectedPage.name}</Heading>
                      
                      <FormControl>
                        <FormLabel>Название страницы</FormLabel>
                        <Input
                          value={selectedPage.name}
                          onChange={(e) =>
                            setSelectedPage({ ...selectedPage, name: e.target.value })
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>URL (slug)</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none" children="/" />
                          <Input
                            pl={8}
                            value={selectedPage.slug.replace('/', '')}
                            onChange={(e) =>
                              setSelectedPage({ ...selectedPage, slug: `/${e.target.value}` })
                            }
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Заголовок (H1)</FormLabel>
                        <Input
                          value={selectedPage.title}
                          onChange={(e) =>
                            setSelectedPage({ ...selectedPage, title: e.target.value })
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Описание</FormLabel>
                        <Textarea
                          value={selectedPage.description}
                          onChange={(e) =>
                            setSelectedPage({ ...selectedPage, description: e.target.value })
                          }
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Иконка (emoji)</FormLabel>
                        <Input
                          value={selectedPage.icon}
                          onChange={(e) =>
                            setSelectedPage({ ...selectedPage, icon: e.target.value })
                          }
                          maxLength={2}
                        />
                      </FormControl>

                      <HStack>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">Страница активна</FormLabel>
                          <Switch
                            isChecked={selectedPage.isEnabled}
                            onChange={(e) =>
                              setSelectedPage({ ...selectedPage, isEnabled: e.target.checked })
                            }
                          />
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">Показывать в меню</FormLabel>
                          <Switch
                            isChecked={selectedPage.showInMenu}
                            onChange={(e) =>
                              setSelectedPage({ ...selectedPage, showInMenu: e.target.checked })
                            }
                          />
                        </FormControl>
                      </HStack>

                      <Button
                        colorScheme="blue"
                        onClick={() => {
                          updatePage(selectedPage.id, selectedPage)
                          toast({
                            title: 'Изменения применены',
                            status: 'success',
                            duration: 2000,
                          })
                        }}
                      >
                        Применить изменения
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <Box textAlign="center" py={12} color="gray.500">
                  Выберите страницу для редактирования
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}
