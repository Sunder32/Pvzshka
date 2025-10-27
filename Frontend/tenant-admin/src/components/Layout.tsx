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
} from '@chakra-ui/react'
import {
  HamburgerIcon,
  ViewIcon,
  SettingsIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons'
import { MdDashboard, MdShoppingCart, MdPeople, MdBarChart, MdBuild, MdSupport, MdLocalShipping, MdAssessment } from 'react-icons/md'
import { useAuthStore } from '../store/auth'

export default function Layout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const menuItems = [
    { icon: MdDashboard, label: 'Дашборд', path: '/' },
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
