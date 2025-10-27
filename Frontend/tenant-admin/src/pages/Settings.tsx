import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  Button,
  VStack,
  HStack,
  useToast,
  Divider,
} from '@chakra-ui/react'

export default function Settings() {
  const toast = useToast()

  const handleSave = () => {
    toast({
      title: 'Настройки сохранены',
      status: 'success',
      duration: 3000,
    })
  }

  return (
    <Box>
      <Heading mb={6}>Настройки магазина</Heading>

      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <Heading size="md">Основная информация</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Название магазина</FormLabel>
                <Input defaultValue="Мой Магазин" />
              </FormControl>

              <FormControl>
                <FormLabel>Описание</FormLabel>
                <Textarea defaultValue="Лучший магазин электроники" rows={3} />
              </FormControl>

              <FormControl>
                <FormLabel>Email для связи</FormLabel>
                <Input type="email" defaultValue="info@example.com" />
              </FormControl>

              <FormControl>
                <FormLabel>Телефон</FormLabel>
                <Input defaultValue="+7 (999) 123-45-67" />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Интеграции</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>API ключ YooKassa</FormLabel>
                <Input type="password" placeholder="••••••••••••••••" />
              </FormControl>

              <FormControl>
                <FormLabel>Shop ID YooKassa</FormLabel>
                <Input placeholder="123456" />
              </FormControl>

              <Divider />

              <FormControl>
                <FormLabel>API ключ CDEK</FormLabel>
                <Input type="password" placeholder="••••••••••••••••" />
              </FormControl>

              <FormControl>
                <FormLabel>API ключ Boxberry</FormLabel>
                <Input type="password" placeholder="••••••••••••••••" />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Уведомления</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Email уведомления о заказах</FormLabel>
                <Switch defaultChecked />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">SMS уведомления клиентам</FormLabel>
                <Switch defaultChecked />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Push уведомления</FormLabel>
                <Switch defaultChecked />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Витрина</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Магазин открыт</FormLabel>
                <Switch defaultChecked />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Показывать распроданные товары</FormLabel>
                <Switch />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Разрешить отзывы</FormLabel>
                <Switch defaultChecked />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <HStack justify="flex-end">
          <Button colorScheme="brand" onClick={handleSave}>
            Сохранить настройки
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
