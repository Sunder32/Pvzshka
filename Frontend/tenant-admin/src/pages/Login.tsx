import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await login(email, password)
      toast({
        title: 'Вход выполнен',
        status: 'success',
        duration: 3000,
      })
      navigate('/')
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: 'Проверьте email и пароль',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, brand.400, brand.600)"
    >
      <Card maxW="md" w="full" mx={4}>
        <CardBody>
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <VStack spacing={2} textAlign="center">
              <Heading size="lg">Админ-панель</Heading>
              <Text color="gray.600">Войдите в свой аккаунт</Text>
            </VStack>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Пароль</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="brand"
              w="full"
              isLoading={loading}
            >
              Войти
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}
