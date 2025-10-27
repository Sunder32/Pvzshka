import { useState, useEffect } from 'react';
import { Box, Button, Card, CardBody, CardHeader, Flex, Heading, Table, Thead, Tbody, Tr, Th, Td, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Select, Text, Tabs, TabList, TabPanels, Tab, TabPanel, HStack, VStack, Badge, Progress, Divider, useToast, Spinner, Center } from '@chakra-ui/react';
import { FiDownload, FiDollarSign, FiPackage, FiShoppingCart, FiUsers } from 'react-icons/fi';
import { reportsAPI, type ReportStats } from '../services/api';

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const statsData = await reportsAPI.getStats(selectedPeriod);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({ title: 'шибка загрузки отчетов', description: error instanceof Error ? error.message : 'еизвестная ошибка', status: 'error', duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (reportType: string) => {
    toast({ title: `кспорт отчета: ${reportType}`, description: 'айл будет загружен в формате Excel', status: 'success', duration: 3000 });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return <Center h="400px"><Spinner size="xl" color="purple.500" thickness="4px" /></Center>;
  }

  if (!stats) {
    return <Center h="400px"><Text color="gray.500">ет данных для отображения</Text></Center>;
  }

  const avgGrowth = stats.salesTrend.length > 1 ? ((stats.salesTrend[stats.salesTrend.length - 1].revenue - stats.salesTrend[0].revenue) / stats.salesTrend[0].revenue) * 100 : 0;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box><Heading size="lg" mb={2}>тчетность</Heading><Text color="gray.600">налитика и отчеты по продажам</Text></Box>
        <HStack spacing={4}>
          <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as any)} width="150px"><option value="day">ень</option><option value="week">еделя</option><option value="month">есяц</option><option value="year">од</option></Select>
          <Button leftIcon={<FiDownload />} colorScheme="purple" variant="outline" onClick={() => handleExport('се отчеты')}>кспорт</Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Card><CardBody><Stat><StatLabel fontSize="sm">бщая выручка</StatLabel><StatNumber fontSize="2xl"><Flex align="center"><FiDollarSign />{formatCurrency(stats.overview.totalRevenue)}</Flex></StatNumber><StatHelpText><StatArrow type={avgGrowth >= 0 ? 'increase' : 'decrease'} />{Math.abs(avgGrowth).toFixed(1)}% за период</StatHelpText></Stat></CardBody></Card>
        <Card><CardBody><Stat><StatLabel fontSize="sm">аказов</StatLabel><StatNumber fontSize="2xl"><Flex align="center"><FiShoppingCart />{stats.overview.totalOrders.toLocaleString('ru-RU')}</Flex></StatNumber><StatHelpText>сего продаж: {stats.overview.totalSales}</StatHelpText></Stat></CardBody></Card>
        <Card><CardBody><Stat><StatLabel fontSize="sm">Товаров продано</StatLabel><StatNumber fontSize="2xl"><Flex align="center"><FiPackage />{stats.overview.totalItemsSold.toLocaleString('ru-RU')}</Flex></StatNumber><StatHelpText>Средний чек: {formatCurrency(stats.overview.avgOrderValue)}</StatHelpText></Stat></CardBody></Card>
        <Card><CardBody><Stat><StatLabel fontSize="sm">атегорий</StatLabel><StatNumber fontSize="2xl"><Flex align="center"><FiUsers />{stats.overview.totalCategories}</Flex></StatNumber><StatHelpText>ктивных направлений</StatHelpText></Stat></CardBody></Card>
      </SimpleGrid>

      <Tabs colorScheme="purple" variant="enclosed">
        <TabList><Tab>📊 Топ товары</Tab><Tab>📂 о категориям</Tab><Tab>📈 инамика продаж</Tab></TabList>
        <TabPanels>
          <TabPanel><Card><CardHeader><Flex justify="space-between" align="center"><Heading size="md">Топ товары по выручке</Heading><Button leftIcon={<FiDownload />} colorScheme="purple" size="sm" variant="outline" onClick={() => handleExport('Топ товары')}>кспорт</Button></Flex></CardHeader><CardBody><Box overflowX="auto"><Table variant="simple"><Thead><Tr><Th>Товар</Th><Th isNumeric>родано</Th><Th isNumeric>ыручка</Th><Th isNumeric>родаж</Th></Tr></Thead><Tbody>{stats.topProducts.map((product, index) => (<Tr key={index}><Td fontWeight="medium">{product.productName}</Td><Td isNumeric>{product.totalQuantity}</Td><Td isNumeric color="green.600" fontWeight="medium">{formatCurrency(product.totalRevenue)}</Td><Td isNumeric>{product.salesCount}</Td></Tr>))}</Tbody></Table></Box></CardBody></Card></TabPanel>
          <TabPanel><Card><CardHeader><Flex justify="space-between" align="center"><Heading size="md">родажи по категориям</Heading><Button leftIcon={<FiDownload />} colorScheme="purple" size="sm" variant="outline" onClick={() => handleExport('атегории')}>кспорт</Button></Flex></CardHeader><CardBody><VStack spacing={4} align="stretch">{stats.categories.map((cat) => { const percentage = (cat.totalRevenue / stats.overview.totalRevenue) * 100; return (<Box key={cat.category}><Flex justify="space-between" mb={2}><Text fontWeight="medium">{cat.category}</Text><HStack><Text color="green.600" fontWeight="medium">{formatCurrency(cat.totalRevenue)}</Text><Badge colorScheme="purple">{percentage.toFixed(1)}%</Badge></HStack></Flex><Progress value={percentage} colorScheme="purple" size="sm" borderRadius="md" /><Text fontSize="sm" color="gray.600" mt={1}>родаж: {cat.salesCount} | Товаров: {cat.totalQuantity}</Text><Divider mt={3} /></Box>);})}</VStack></CardBody></Card></TabPanel>
          <TabPanel><Card><CardHeader><Flex justify="space-between" align="center"><Heading size="md">инамика продаж (последние 30 дней)</Heading><Button leftIcon={<FiDownload />} colorScheme="purple" size="sm" variant="outline" onClick={() => handleExport('инамика')}>кспорт</Button></Flex></CardHeader><CardBody><Box overflowX="auto"><Table variant="simple" size="sm"><Thead><Tr><Th>ата</Th><Th isNumeric>родаж</Th><Th isNumeric>Товаров</Th><Th isNumeric>ыручка</Th></Tr></Thead><Tbody>{stats.salesTrend.map((day) => (<Tr key={day.date}><Td>{formatDate(day.date)}</Td><Td isNumeric>{day.salesCount}</Td><Td isNumeric>{day.itemsSold}</Td><Td isNumeric color="green.600" fontWeight="medium">{formatCurrency(day.revenue)}</Td></Tr>))}</Tbody></Table></Box></CardBody></Card></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
