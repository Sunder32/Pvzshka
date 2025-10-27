import { useState } from 'react'
import {
  Box,
  Button,
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Image,
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  status: 'active' | 'draft'
  image?: string
}

export default function Products() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const toast = useToast()

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro',
      price: 99990,
      stock: 25,
      category: 'Смартфоны',
      status: 'active',
    },
    {
      id: '2',
      name: 'MacBook Pro 16"',
      price: 249990,
      stock: 10,
      category: 'Ноутбуки',
      status: 'active',
    },
    {
      id: '3',
      name: 'AirPods Pro 2',
      price: 24990,
      stock: 0,
      category: 'Аксессуары',
      status: 'draft',
    },
  ])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    onOpen()
  }

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
    toast({
      title: 'Товар удален',
      status: 'success',
      duration: 3000,
    })
  }

  const handleSave = () => {
    toast({
      title: editingProduct?.id ? 'Товар обновлен' : 'Товар создан',
      status: 'success',
      duration: 3000,
    })
    setEditingProduct(null)
    onClose()
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Товары</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="brand"
          onClick={() => {
            setEditingProduct(null)
            onOpen()
          }}
        >
          Добавить товар
        </Button>
      </HStack>

      <Card>
        <CardBody overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Название</Th>
                <Th>Категория</Th>
                <Th isNumeric>Цена</Th>
                <Th isNumeric>Остаток</Th>
                <Th>Статус</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.map((product) => (
                <Tr key={product.id}>
                  <Td fontWeight="medium">{product.name}</Td>
                  <Td>{product.category}</Td>
                  <Td isNumeric>₽{product.price.toLocaleString()}</Td>
                  <Td isNumeric>
                    <Badge colorScheme={product.stock > 0 ? 'green' : 'red'}>
                      {product.stock}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={product.status === 'active' ? 'green' : 'gray'}>
                      {product.status === 'active' ? 'Активен' : 'Черновик'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Редактировать"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEdit(product)}
                      />
                      <IconButton
                        aria-label="Удалить"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(product.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingProduct ? 'Редактировать товар' : 'Новый товар'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Название</FormLabel>
              <Input placeholder="Название товара" />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Описание</FormLabel>
              <Textarea placeholder="Описание товара" />
            </FormControl>

            <HStack spacing={4} mb={4}>
              <FormControl>
                <FormLabel>Цена</FormLabel>
                <Input type="number" placeholder="0" />
              </FormControl>

              <FormControl>
                <FormLabel>Остаток</FormLabel>
                <Input type="number" placeholder="0" />
              </FormControl>
            </HStack>

            <FormControl mb={4}>
              <FormLabel>Категория</FormLabel>
              <Select placeholder="Выберите категорию">
                <option>Смартфоны</option>
                <option>Ноутбуки</option>
                <option>Аксессуары</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Статус</FormLabel>
              <Select>
                <option value="active">Активен</option>
                <option value="draft">Черновик</option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button colorScheme="brand" onClick={handleSave}>
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
