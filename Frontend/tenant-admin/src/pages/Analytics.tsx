import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
} from '@chakra-ui/react'

export default function Analytics() {
  const monthlyStats = [
    { month: 'Январь', revenue: 450000, orders: 123 },
    { month: 'Февраль', revenue: 520000, orders: 145 },
    { month: 'Март', revenue: 680000, orders: 189 },
  ]

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 45, revenue: 4499550 },
    { name: 'MacBook Pro 16"', sales: 23, revenue: 5749770 },
    { name: 'AirPods Pro 2', sales: 78, revenue: 1949220 },
  ]

  return (
    <Box>
      <Heading mb={6}>Аналитика</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Общая выручка</StatLabel>
              <StatNumber>₽1,650,000</StatNumber>
              <StatHelpText>За последние 3 месяца</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Всего заказов</StatLabel>
              <StatNumber>457</StatNumber>
              <StatHelpText>За последние 3 месяца</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Средний чек</StatLabel>
              <StatNumber>₽3,609</StatNumber>
              <StatHelpText>За последние 3 месяца</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Выручка по месяцам</Heading>
          </CardHeader>
          <CardBody>
            {monthlyStats.map((stat) => (
              <Box
                key={stat.month}
                p={4}
                borderBottom="1px"
                borderColor="gray.200"
                _last={{ borderBottom: 'none' }}
              >
                <Text fontWeight="bold">{stat.month}</Text>
                <Text>Выручка: ₽{stat.revenue.toLocaleString()}</Text>
                <Text fontSize="sm" color="gray.600">
                  Заказов: {stat.orders}
                </Text>
              </Box>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Топ товаров</Heading>
          </CardHeader>
          <CardBody>
            {topProducts.map((product) => (
              <Box
                key={product.name}
                p={4}
                borderBottom="1px"
                borderColor="gray.200"
                _last={{ borderBottom: 'none' }}
              >
                <Text fontWeight="bold">{product.name}</Text>
                <Text>Продано: {product.sales} шт</Text>
                <Text fontSize="sm" color="gray.600">
                  Выручка: ₽{product.revenue.toLocaleString()}
                </Text>
              </Box>
            ))}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  )
}
