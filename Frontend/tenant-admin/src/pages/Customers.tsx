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
  Input,
} from '@chakra-ui/react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  orders: number
  totalSpent: number
  status: 'active' | 'inactive'
  registeredAt: string
}

export default function Customers() {
  const customers: Customer[] = [
    {
      id: '1',
      name: 'Иван Петров',
      email: 'ivan@example.com',
      phone: '+7 (999) 123-45-67',
      orders: 12,
      totalSpent: 125000,
      status: 'active',
      registeredAt: '2023-06-15',
    },
    {
      id: '2',
      name: 'Мария Сидорова',
      email: 'maria@example.com',
      phone: '+7 (999) 234-56-78',
      orders: 8,
      totalSpent: 89000,
      status: 'active',
      registeredAt: '2023-08-22',
    },
    {
      id: '3',
      name: 'Петр Иванов',
      email: 'petr@example.com',
      phone: '+7 (999) 345-67-89',
      orders: 3,
      totalSpent: 45000,
      status: 'inactive',
      registeredAt: '2023-12-10',
    },
  ]

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Клиенты</Heading>
      </HStack>

      <HStack spacing={4} mb={4}>
        <Input placeholder="Поиск по имени или email" maxW="400px" />
      </HStack>

      <Card>
        <CardBody overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Имя</Th>
                <Th>Email</Th>
                <Th>Телефон</Th>
                <Th isNumeric>Заказов</Th>
                <Th isNumeric>Сумма покупок</Th>
                <Th>Статус</Th>
                <Th>Дата регистрации</Th>
              </Tr>
            </Thead>
            <Tbody>
              {customers.map((customer) => (
                <Tr key={customer.id}>
                  <Td fontWeight="medium">{customer.name}</Td>
                  <Td>{customer.email}</Td>
                  <Td>{customer.phone}</Td>
                  <Td isNumeric>{customer.orders}</Td>
                  <Td isNumeric fontWeight="bold">
                    ₽{customer.totalSpent.toLocaleString()}
                  </Td>
                  <Td>
                    <Badge colorScheme={customer.status === 'active' ? 'green' : 'gray'}>
                      {customer.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </Td>
                  <Td>{customer.registeredAt}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  )
}
