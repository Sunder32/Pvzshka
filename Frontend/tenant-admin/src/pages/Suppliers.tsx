import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useDisclosure,
  useToast,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  HStack,
  VStack,
  Text,
  Link,
  Spinner,
} from '@chakra-ui/react'
import { FiEdit, FiTrash2, FiPlus, FiMail, FiPhone, FiGlobe, FiUser } from 'react-icons/fi'
import { suppliersAPI, type Supplier, type SupplierStats } from '../services/api'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [stats, setStats] = useState<SupplierStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState<Partial<Supplier>>({})
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Загрузка поставщиков
  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const data = await suppliersAPI.getAll()
      setSuppliers(data)
      
      const statsData = await suppliersAPI.getStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading suppliers:', error)
      toast({
        title: 'Ошибка загрузки поставщиков',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData(supplier)
    onOpen()
  }

  const handleDelete = async (id: string) => {
    try {
      await suppliersAPI.delete(id)
      toast({
        title: 'Поставщик удален',
        status: 'success',
        duration: 3000,
      })
      await loadSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast({
        title: 'Ошибка удаления поставщика',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, formData)
        toast({
          title: 'Поставщик обновлен',
          status: 'success',
          duration: 3000,
        })
      } else {
        await suppliersAPI.create(formData as any)
        toast({
          title: 'Поставщик создан',
          status: 'success',
          duration: 3000,
        })
      }
      onClose()
      setFormData({})
      setEditingSupplier(null)
      await loadSuppliers()
    } catch (error) {
      console.error('Error saving supplier:', error)
      toast({
        title: 'Ошибка сохранения поставщика',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingSupplier(null)
    setFormData({})
    onOpen()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'inactive':
        return 'gray'
      case 'suspended':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен'
      case 'inactive':
        return 'Неактивен'
      case 'suspended':
        return 'Приостановлен'
      default:
        return status
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" mb={2}>Поставщики</Heading>
          <Text color="gray.600">Управление поставщиками товаров</Text>
        </Box>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={() => {
            setEditingSupplier(null)
            setFormData({})
            onOpen()
          }}
        >
          Добавить поставщика
        </Button>
      </Flex>

      {stats && (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Всего поставщиков</StatLabel>
                <StatNumber>🏢 {stats.totalSuppliers}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Активных</StatLabel>
                <StatNumber color="green.500">✅ {stats.activeSuppliers}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Всего товаров</StatLabel>
                <StatNumber>📦 {stats.totalProducts}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      <Card>
        <CardHeader>
          <Input placeholder="Поиск поставщиков..." size="md" maxW="400px" />
        </CardHeader>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Поставщик</Th>
                  <Th>Название</Th>
                  <Th>Контакты</Th>
                  <Th>Адрес</Th>
                  <Th>Товаров</Th>
                  <Th>Статус</Th>
                  <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8}>
                      <Spinner />
                    </Td>
                  </Tr>
                ) : suppliers.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" color="gray.500" py={8}>
                      Нет поставщиков. Добавьте первого!
                    </Td>
                  </Tr>
                ) : (
                  suppliers.map((supplier) => (
                    <Tr key={supplier.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="600">{supplier.name}</Text>
                          {supplier.contact_person && (
                            <Flex align="center" fontSize="sm" color="gray.600">
                              <FiUser style={{ marginRight: 4 }} />
                              {supplier.contact_person}
                            </Flex>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1} fontSize="sm">
                          {supplier.email && (
                            <Flex align="center">
                              <FiMail style={{ marginRight: 4 }} />
                              {supplier.email}
                            </Flex>
                          )}
                          {supplier.phone && (
                            <Flex align="center">
                              <FiPhone style={{ marginRight: 4 }} />
                              {supplier.phone}
                            </Flex>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {supplier.address || '-'}
                        </Text>
                      </Td>
                      <Td>{supplier.products_count}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(supplier.status)}>
                          {getStatusLabel(supplier.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit"
                            icon={<FiEdit />}
                            size="sm"
                            onClick={() => handleEdit(supplier)}
                          />
                          <IconButton
                            aria-label="Delete"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(supplier.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingSupplier ? 'Редактировать поставщика' : 'Добавить поставщика'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Название компании</FormLabel>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Контактное лицо</FormLabel>
                <Input
                  value={formData.contact_person || ''}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Телефон</FormLabel>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Адрес</FormLabel>
                <Textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  placeholder="Москва, ул. Ленина, д. 10"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Описание</FormLabel>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Информация о поставщике"
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Количество товаров</FormLabel>
                  <Input
                    type="number"
                    value={formData.products_count || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, products_count: parseInt(e.target.value) || 0 })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Статус</FormLabel>
                  <Select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="active">Активен</option>
                    <option value="inactive">Неактивен</option>
                    <option value="suspended">Приостановлен</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {editingSupplier ? 'Сохранить' : 'Добавить'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
