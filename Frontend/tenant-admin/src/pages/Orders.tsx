import {
  Box,
  Card,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  IconButton,
  Select,
  Input,
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'

interface Order {
  id: string
  customer: string
  date: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: number
}

export default function Orders() {
  const orders: Order[] = [
    {
      id: '1234',
      customer: 'Иван Петров',
      date: '2024-01-15',
      total: 5600,
      status: 'delivered',
      items: 2,
    },
    {
      id: '1235',
      customer: 'Мария Сидорова',
      date: '2024-01-16',
      total: 3200,
      status: 'shipped',
      items: 1,
    },
    {
      id: '1236',
      customer: 'Петр Иванов',
      date: '2024-01-17',
      total: 8900,
      status: 'processing',
      items: 3,
    },
    {
      id: '1237',
      customer: 'Анна Смирнова',
      date: '2024-01-17',
      total: 12000,
      status: 'pending',
      items: 4,
    },
  ]

  const statusColors: Record<Order['status'], string> = {
    pending: 'yellow',
    processing: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
  }

  const statusLabels: Record<Order['status'], string> = {
    pending: 'Ожидает',
    processing: 'Обработка',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменен',
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Заказы</Heading>
      </HStack>

      <HStack spacing={4} mb={4}>
        <Input placeholder="Поиск по номеру заказа" maxW="300px" />
        <Select placeholder="Статус" maxW="200px">
          <option value="pending">Ожидает</option>
          <option value="processing">Обработка</option>
          <option value="shipped">Отправлен</option>
          <option value="delivered">Доставлен</option>
          <option value="cancelled">Отменен</option>
        </Select>
      </HStack>

      <Card>
        <CardBody overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>№ Заказа</Th>
                <Th>Клиент</Th>
                <Th>Дата</Th>
                <Th isNumeric>Товаров</Th>
                <Th isNumeric>Сумма</Th>
                <Th>Статус</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.id}>
                  <Td fontWeight="medium">#{order.id}</Td>
                  <Td>{order.customer}</Td>
                  <Td>{order.date}</Td>
                  <Td isNumeric>{order.items}</Td>
                  <Td isNumeric fontWeight="bold">
                    ₽{order.total.toLocaleString()}
                  </Td>
                  <Td>
                    <Badge colorScheme={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="Просмотр"
                      icon={<ViewIcon />}
                      size="sm"
                      colorScheme="brand"
                    />
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
