import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useColorModeValue,
  Select,
  Badge,
  Button,
} from '@chakra-ui/react'
import {
  HamburgerIcon,
  ViewIcon,
  SettingsIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons'
import { MdDashboard, MdShoppingCart, MdPeople, MdBarChart, MdBuild, MdSupport, MdLocalShipping, MdAssessment, MdStore, MdAddCircle } from 'react-icons/md'
import { useAuthStore } from '../store/auth'
import { useSiteStore } from '../store/site'
import { useEffect } from 'react'

export default function Layout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { activeSite, sites, setActiveSite } = useSiteStore()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Load sites on mount
  useEffect(() => {
    const loadSites = async () => {
      if (!user) return
      
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
            'x-user-role': user.role,
          },
          body: JSON.stringify({
            query: `
              query MySites {
                mySites {
                  id
                  siteName
                  domain
                  category
                  isEnabled
                }
              }
            `,
          }),
        })

        const { data } = await response.json()
        if (data?.mySites) {
          const { setSites } = useSiteStore.getState()
          setSites(data.mySites)
        }
      } catch (error) {
        console.error('Error loading sites:', error)
      }
    }

    loadSites()
  }, [user])

  const menuItems = [
    { icon: MdDashboard, label: 'Дашборд', path: '/' },
    { icon: MdStore, label: 'Мои сайты', path: '/my-sites' },
    { icon: MdAddCircle, label: 'Создать сайт', path: '/site-request' },
    { icon: ViewIcon, label: 'Товары', path: '/products' },
    { icon: MdShoppingCart, label: 'Заказы', path: '/orders' },
    { icon: MdPeople, label: 'Клиенты', path: '/customers' },
    { icon: MdBarChart, label: 'Аналитика', path: '/analytics' },
    { icon: MdBuild, label: 'Конструктор сайта', path: '/site-builder' },
    { icon: MdLocalShipping, label: 'Поставщики', path: '/suppliers' },
    { icon: MdAssessment, label: 'Отчетность', path: '/reports' },
    { icon: SettingsIcon, label: 'Настройки сайта', path: '/site-settings' },
    { icon: MdSupport, label: 'Поддержка', path: '/support' },
    { icon: SettingsIcon, label: 'Настройки', path: '/settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = () => (
    <VStack spacing={1} align="stretch">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path
        
        return (
          <Box
            key={item.path}
            px={4}
            py={3}
            cursor="pointer"
            borderRadius="md"
            bg={isActive ? 'brand.500' : 'transparent'}
            color={isActive ? 'white' : 'gray.600'}
            _hover={{ bg: isActive ? 'brand.600' : 'gray.100' }}
            onClick={() => {
              navigate(item.path)
              onClose()
            }}
          >
            <HStack>
              <Icon />
              <Text fontWeight={isActive ? 'bold' : 'normal'}>{item.label}</Text>
            </HStack>
          </Box>
        )
      })}
    </VStack>
  )

  return (
    <Flex h="100vh" direction="column">
      {/* Header */}
      <Flex
        as="header"
        align="center"
        justify="space-between"
        px={6}
        py={4}
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <HStack spacing={4}>
          <IconButton
            aria-label="Меню"
            icon={<HamburgerIcon />}
            onClick={onOpen}
            display={{ base: 'flex', md: 'none' }}
          />
          <Text fontSize="xl" fontWeight="bold" color="brand.500">
            Админ-панель
          </Text>
        </HStack>

        {/* Site Selector */}
        <HStack spacing={4} flex={1} maxW="400px" mx={6} display={{ base: 'none', md: 'flex' }}>
          {sites.length > 0 ? (
            <Box flex={1}>
              <Select
                value={activeSite?.id || ''}
                onChange={(e) => {
                  const site = sites.find(s => s.id === e.target.value)
                  if (site) setActiveSite(site)
                }}
                size="sm"
                borderRadius="md"
              >
                {sites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.siteName} ({site.domain})
                  </option>
                ))}
              </Select>
            </Box>
          ) : (
            <Badge colorScheme="orange" fontSize="sm">
              Нет активных сайтов
            </Badge>
          )}
          
          {/* Open Site Button */}
          {activeSite && (
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<ExternalLinkIcon />}
              onClick={() => {
                const siteUrl = `http://localhost:3003?site=${activeSite.domain}`;
                window.open(siteUrl, '_blank');
              }}
            >
              Открыть сайт
            </Button>
          )}
        </HStack>

        <Menu>
          <MenuButton>
            <HStack spacing={2} cursor="pointer">
              <Avatar size="sm" name={user?.name} />
              <Text display={{ base: 'none', md: 'block' }}>{user?.name}</Text>
              <ChevronDownIcon />
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={handleLogout}>Выйти</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Flex flex={1} overflow="hidden">
        {/* Desktop Sidebar */}
        <Box
          w="250px"
          bg={bgColor}
          borderRight="1px"
          borderColor={borderColor}
          p={4}
          display={{ base: 'none', md: 'block' }}
          overflowY="auto"
        >
          <Sidebar />
        </Box>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody pt={10}>
              <Sidebar />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        <Box flex={1} overflow="auto" bg={useColorModeValue('gray.50', 'gray.900')} p={6}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}
