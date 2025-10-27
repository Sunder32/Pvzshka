import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  VStack,
  HStack,
  Input,
  Textarea,
  Select,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Text,
  Divider,
} from '@chakra-ui/react';
import { FaPlus, FaComments } from 'react-icons/fa';
import { useAuthStore } from '../store/auth';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  author: string;
  authorType: 'tenant' | 'admin';
  message: string;
  createdAt: string;
}

export default function Support() {
  const toast = useToast();
  const { token, user } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium' as const,
    description: '',
  });
  const [loading, setLoading] = useState(false);

  // Загрузка тикетов при монтировании
  useEffect(() => {
    if (token) {
      loadTickets();
    }
  }, [token]);

  const loadTickets = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/support/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // API возвращает {tickets: [...]}
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      setTickets([]);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: newTicket.subject,
          category: newTicket.category,
          priority: newTicket.priority,
          description: newTicket.description,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Заявка создана',
          description: 'Наша команда свяжется с вами в ближайшее время',
          status: 'success',
          duration: 5000,
        });
        setNewTicket({ subject: '', category: 'technical', priority: 'medium', description: '' });
        onClose();
        loadTickets();
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заявку',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Обновить детали тикета
        const detailsResponse = await fetch(`http://localhost:8080/api/support/tickets/${selectedTicket.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (detailsResponse.ok) {
          const data = await detailsResponse.json();
          const updatedTicket = {
            ...data.ticket,
            messages: Array.isArray(data.messages) ? data.messages : [],
          };
          setSelectedTicket(updatedTicket);
          loadTickets();
        }
        toast({
          title: 'Сообщение отправлено',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    try {
      const response = await fetch(`http://localhost:8080/api/support/tickets/${ticket.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // API возвращает {ticket: {...}, messages: [...]}
        const fullTicket = {
          ...data.ticket,
          messages: Array.isArray(data.messages) ? data.messages : [],
        };
        setSelectedTicket(fullTicket);
        onDetailOpen();
      }
    } catch (error) {
      console.error('Error loading ticket details:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'gray',
      medium: 'blue',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'blue',
      'in-progress': 'orange',
      resolved: 'green',
      closed: 'gray',
    };
    return colors[status as keyof typeof colors];
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technical: 'Техническая проблема',
      billing: 'Вопрос по оплате',
      feature: 'Запрос функционала',
      other: 'Другое',
    };
    return labels[category] || category;
  };

  return (
  <Box>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="lg">Техническая поддержка</Heading>
          <Text color="gray.600">Свяжитесь с нами для решения вопросов</Text>
        </Box>
        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={onOpen}>
          Создать заявку
        </Button>
      </HStack>

      <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={6}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">
              Открытых заявок
            </Text>
            <Heading size="lg" color="blue.500">
              {tickets.filter((t) => t.status === 'open').length}
            </Heading>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">
              В работе
            </Text>
            <Heading size="lg" color="orange.500">
              {tickets.filter((t) => t.status === 'in-progress').length}
            </Heading>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.600">
              Решено
            </Text>
            <Heading size="lg" color="green.500">
              {tickets.filter((t) => t.status === 'resolved').length}
            </Heading>
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <Heading size="md">Мои заявки</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>№</Th>
                <Th>Тема</Th>
                <Th>Категория</Th>
                <Th>Приоритет</Th>
                <Th>Статус</Th>
                <Th>Дата создания</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(Array.isArray(tickets) ? tickets : []).map((ticket) => (
                <Tr key={ticket.id}>
                  <Td>#{ticket.id}</Td>
                  <Td fontWeight="medium">{ticket.subject}</Td>
                  <Td>{getCategoryLabel(ticket.category)}</Td>
                  <Td>
                    <Badge colorScheme={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </Td>
                  <Td>{new Date(ticket.createdAt).toLocaleDateString('ru-RU')}</Td>
                  <Td>
                    <Button size="sm" onClick={() => handleViewTicket(ticket)}>
                      Открыть
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {(!tickets || tickets.length === 0) && (
            <Box textAlign="center" py={10}>
              <Text color="gray.400">У вас пока нет заявок</Text>
              <Button mt={4} colorScheme="blue" onClick={onOpen}>
                Создать первую заявку
              </Button>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Create Ticket Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Создать заявку в поддержку</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Тема обращения *
                </Text>
                <Input
                  placeholder="Краткое описание проблемы"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Категория *
                </Text>
                <Select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                >
                  <option value="technical">Техническая проблема</option>
                  <option value="billing">Вопрос по оплате</option>
                  <option value="feature">Запрос функционала</option>
                  <option value="other">Другое</option>
                </Select>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Приоритет *
                </Text>
                <Select
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, priority: e.target.value as any })
                  }
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочный</option>
                </Select>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Описание проблемы *
                </Text>
                <Textarea
                  placeholder="Подробно опишите вашу проблему или вопрос..."
                  rows={6}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateTicket}
              isLoading={loading}
              isDisabled={!newTicket.subject || !newTicket.description}
            >
              Отправить заявку
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Заявка #{selectedTicket?.id}: {selectedTicket?.subject}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTicket && (
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Badge colorScheme={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                  <Badge colorScheme={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                  <Text fontSize="sm" color="gray.600">
                    {getCategoryLabel(selectedTicket.category)}
                  </Text>
                </HStack>

                <Divider />

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Переписка:
                  </Text>
                  <VStack align="stretch" spacing={3}>
                    {(Array.isArray(selectedTicket?.messages) ? selectedTicket.messages : []).map((msg) => (
                      <Box
                        key={msg.id}
                        p={4}
                        bg={msg.authorType === 'tenant' ? 'blue.50' : 'gray.50'}
                        borderRadius="md"
                      >
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="bold" fontSize="sm">
                            {msg.author}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {new Date(msg.createdAt).toLocaleString('ru-RU')}
                          </Text>
                        </HStack>
                        <Text fontSize="sm">{msg.message}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Добавить сообщение:
                  </Text>
                  <Textarea 
                    placeholder="Напишите ваше сообщение..." 
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button 
                    mt={2} 
                    size="sm" 
                    colorScheme="blue" 
                    leftIcon={<FaComments />}
                    onClick={handleSendMessage}
                    isLoading={loading}
                    isDisabled={!newMessage.trim()}
                  >
                    Отправить
                  </Button>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
