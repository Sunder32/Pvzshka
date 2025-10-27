import {
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { FiShoppingCart, FiDollarSign, FiUsers, FiPackage, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

export default function Dashboard() {
  const stats = [
    {
      label: 'Всего товаров',
      value: '1,523',
      change: 12.5,
      isIncrease: true,
      icon: FiPackage,
      color: 'blue',
    },
    {
      label: 'Заказы за месяц',
      value: '456',
      change: 8.2,
      isIncrease: true,
      icon: FiShoppingCart,
      color: 'green',
    },
    {
      label: 'Выручка',
      value: '₽850,000',
      change: 15.3,
      isIncrease: true,
      icon: FiDollarSign,
      color: 'purple',
    },
    {
      label: 'Клиенты',
      value: '234',
      change: 3.1,
      isIncrease: false,
      icon: FiUsers,
      color: 'orange',
    },
  ]

  const recentOrders = [
    { 
      id: '1234', 
      customer: 'Иван Петров', 
      amount: 5600, 
      status: 'delivered',
      statusText: 'Доставлен',
      date: '15.01.2024'
    },
    { 
      id: '1235', 
      customer: 'Мария Сидорова', 
      amount: 3200, 
      status: 'shipping',
      statusText: 'В пути',
      date: '14.01.2024'
    },
    { 
      id: '1236', 
      customer: 'Петр Иванов', 
      amount: 8900, 
      status: 'processing',
      statusText: 'Обработка',
      date: '14.01.2024'
    },
    { 
      id: '1237', 
      customer: 'Анна Кузнецова', 
      amount: 4300, 
      status: 'pending',
      statusText: 'Ожидание',
      date: '13.01.2024'
    },
    { 
      id: '1238', 
      customer: 'Дмитрий Волков', 
      amount: 12500, 
      status: 'delivered',
      statusText: 'Доставлен',
      date: '13.01.2024'
    },
  ]

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 45, revenue: 6297000, progress: 90 },
    { name: 'Samsung Galaxy S24', sales: 38, revenue: 4559620, progress: 76 },
    { name: 'MacBook Pro 14"', sales: 23, revenue: 4599770, progress: 46 },
    { name: 'AirPods Pro', sales: 67, revenue: 1675700, progress: 100 },
    { name: 'Sony WH-1000XM5', sales: 31, revenue: 929690, progress: 62 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'green'
      case 'shipping':
        return 'blue'
      case 'processing':
        return 'yellow'
      case 'pending':
        return 'orange'
      default:
        return 'gray'
    }
  }

  return (
    <Box>
      <Heading mb={6}>Дашборд</Heading>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {stats.map((stat) => (
          <Card key={stat.label} borderTop="4px" borderColor={`${stat.color}.500`}>
            <CardBody>
              <Flex justify="space-between" align="start">
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm">{stat.label}</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold">{stat.value}</StatNumber>
                  <StatHelpText mb={0}>
                    <Icon 
                      as={stat.isIncrease ? FiTrendingUp : FiTrendingDown} 
                      color={stat.isIncrease ? 'green.500' : 'red.500'}
                      mr={1}
                    />
                    {stat.change}% за месяц
                  </StatHelpText>
                </Stat>
                <Icon as={stat.icon} boxSize={10} color={`${stat.color}.500`} opacity={0.3} />
              </Flex>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Top Products */}
        <Card>
          <CardHeader>
            <Heading size="md">Топ товары</Heading>
            <Text color="gray.600" fontSize="sm">По продажам за последний месяц</Text>
          </CardHeader>
          <CardBody>
            <Box>
              {topProducts.map((product, index) => (
                <Box key={product.name} mb={4}>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="semibold">{product.name}</Text>
                    <Text fontSize="sm" color="gray.600">{product.sales} продаж</Text>
                  </Flex>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="sm" color="gray.600">
                      ₽{product.revenue.toLocaleString('ru-RU')}
                    </Text>
                    <Text fontSize="sm" color="gray.600">{product.progress}%</Text>
                  </Flex>
                  <Progress 
                    value={product.progress} 
                    size="sm" 
                    colorScheme={index === 0 ? 'green' : index === 1 ? 'blue' : 'gray'} 
                    borderRadius="full"
                  />
                </Box>
              ))}
            </Box>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <Heading size="md">Быстрая статистика</Heading>
            <Text color="gray.600" fontSize="sm">Ключевые показатели</Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={2} spacing={4}>
              <Box p={4} bg="blue.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600" mb={1}>Средний чек</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">₽4,890</Text>
                <Text fontSize="xs" color="gray.500">+12% к прошлому месяцу</Text>
              </Box>
              <Box p={4} bg="green.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600" mb={1}>Конверсия</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">3.4%</Text>
                <Text fontSize="xs" color="gray.500">+0.8% к прошлому месяцу</Text>
              </Box>
              <Box p={4} bg="purple.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600" mb={1}>Повторные покупки</Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">28%</Text>
                <Text fontSize="xs" color="gray.500">+5% к прошлому месяцу</Text>
              </Box>
              <Box p={4} bg="orange.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600" mb={1}>Возвраты</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">2.1%</Text>
                <Text fontSize="xs" color="gray.500">-0.3% к прошлому месяцу</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <Heading size="md">Последние заказы</Heading>
          <Text color="gray.600" fontSize="sm">Недавняя активность</Text>
        </CardHeader>
        <CardBody overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID Заказа</Th>
                <Th>Клиент</Th>
                <Th>Дата</Th>
                <Th isNumeric>Сумма</Th>
                <Th>Статус</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentOrders.map((order) => (
                <Tr key={order.id} _hover={{ bg: 'gray.50' }} cursor="pointer">
                  <Td fontWeight="medium">#{order.id}</Td>
                  <Td>{order.customer}</Td>
                  <Td color="gray.600">{order.date}</Td>
                  <Td isNumeric fontWeight="semibold">₽{order.amount.toLocaleString('ru-RU')}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(order.status)} px={2} py={1} borderRadius="md">
                      {order.statusText}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  )
}
