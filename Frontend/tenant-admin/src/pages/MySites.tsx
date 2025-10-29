import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiPower,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPlus,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

interface Site {
  id: string;
  siteName: string;
  domain: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'disabled';
  category: string;
  createdAt: string;
  lastModified: string;
  isEnabled: boolean;
  stats?: {
    products: number;
    orders: number;
    visitors: number;
  };
}

export default function MySites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDisableOpen, onOpen: onDisableOpen, onClose: onDisableClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      
      if (!user || !token) {
        throw new Error('Необходима авторизация');
      }
      
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
        body: JSON.stringify({
          query: `
            query MySites {
              mySites {
                id
                siteName
                domain
                category
                status
                isEnabled
                createdAt
                stats {
                  products
                  orders
                  visitors
                }
              }
            }
          `,
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Ошибка загрузки сайтов');
      }

      setSites(result.data?.mySites || []);
    } catch (error) {
      console.error('Error loading sites:', error);
      toast({
        title: 'Ошибка загрузки',
        description: error instanceof Error ? error.message : 'Не удалось загрузить список сайтов',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSite = async (site: Site) => {
    try {
      setActionLoading(true);
      
      if (!user || !token) {
        throw new Error('Необходима авторизация');
      }
      
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
        body: JSON.stringify({
          query: `
            mutation ToggleSite($id: ID!, $isEnabled: Boolean!) {
              toggleSite(id: $id, isEnabled: $isEnabled) {
                id
                isEnabled
              }
            }
          `,
          variables: {
            id: site.id,
            isEnabled: !site.isEnabled,
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Ошибка переключения статуса');
      }

      toast({
        title: site.isEnabled ? 'Сайт отключен' : 'Сайт включен',
        status: 'success',
        duration: 3000,
      });

      loadSites();
    } catch (error) {
      console.error('Error toggling site:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус сайта',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSite = async () => {
    if (!selectedSite) return;

    try {
      setActionLoading(true);
      
      if (!user || !token) {
        throw new Error('Необходима авторизация');
      }
      
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
        body: JSON.stringify({
          query: `
            mutation DeleteSite($id: ID!) {
              deleteSite(id: $id)
            }
          `,
          variables: {
            id: selectedSite.id,
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Ошибка удаления сайта');
      }

      toast({
        title: 'Сайт удален',
        description: 'Сайт был успешно удален',
        status: 'success',
        duration: 3000,
      });

      onDeleteClose();
      loadSites();
    } catch (error) {
      console.error('Error deleting site:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сайт',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: Site['status']) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: FiClock, text: 'На рассмотрении' },
      approved: { color: 'green', icon: FiCheckCircle, text: 'Одобрено' },
      rejected: { color: 'red', icon: FiXCircle, text: 'Отклонено' },
      active: { color: 'blue', icon: FiCheckCircle, text: 'Активен' },
      disabled: { color: 'gray', icon: FiAlertCircle, text: 'Отключен' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge colorScheme={config.color} fontSize="sm" px={2} py={1} borderRadius="md">
        <HStack spacing={1}>
          <Icon size={14} />
          <Text>{config.text}</Text>
        </HStack>
      </Badge>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Мои сайты</Heading>
            <Text color="gray.600" mt={1}>
              Управление вашими интернет-магазинами
            </Text>
          </Box>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => navigate('/site-request')}
          >
            Создать новый сайт
          </Button>
        </HStack>

        {sites.length === 0 ? (
          <Card>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Text fontSize="lg" color="gray.500">
                  У вас пока нет сайтов
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={() => navigate('/site-request')}
                  leftIcon={<FiPlus />}
                >
                  Создать первый сайт
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
            {sites.map((site) => (
              <Card key={site.id} shadow="md" _hover={{ shadow: 'lg' }}>
                <CardHeader pb={3}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1} flex={1}>
                      <Heading size="md">{site.siteName}</Heading>
                      <Text fontSize="sm" color="gray.500">
                        {site.domain}.yourplatform.com
                      </Text>
                    </VStack>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        {site.status === 'approved' || site.status === 'active' ? (
                          <>
                            <MenuItem
                              icon={<FiEdit />}
                              onClick={() => navigate(`/site-builder/${site.id}`)}
                            >
                              Редактировать
                            </MenuItem>
                            <MenuItem 
                              icon={<FiEye />}
                              onClick={() => window.open(`http://localhost:3003?site=${site.domain}`, '_blank')}
                            >
                              Открыть сайт
                            </MenuItem>
                            <Divider />
                          </>
                        ) : null}
                        <MenuItem
                          icon={<FiPower />}
                          onClick={() => {
                            setSelectedSite(site);
                            onDisableOpen();
                          }}
                          isDisabled={site.status !== 'active' && site.status !== 'approved'}
                        >
                          {site.isEnabled ? 'Отключить' : 'Включить'}
                        </MenuItem>
                        <MenuItem
                          icon={<FiTrash2 />}
                          color="red.500"
                          onClick={() => {
                            setSelectedSite(site);
                            onDeleteOpen();
                          }}
                        >
                          Удалить
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </CardHeader>

                <CardBody pt={0}>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      {getStatusBadge(site.status)}
                      <HStack spacing={2}>
                        <Text fontSize="sm" color="gray.500">Статус:</Text>
                        <Switch
                          isChecked={site.isEnabled}
                          onChange={() => handleToggleSite(site)}
                          isDisabled={
                            site.status !== 'active' && 
                            site.status !== 'approved' || 
                            actionLoading
                          }
                          colorScheme="blue"
                        />
                      </HStack>
                    </HStack>

                    <Divider />

                    {site.status === 'pending' && (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box flex={1}>
                          <AlertTitle fontSize="sm">Ожидание проверки</AlertTitle>
                          <AlertDescription fontSize="xs">
                            Ваша заявка рассматривается администраторами
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {site.status === 'rejected' && (
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Box flex={1}>
                          <AlertTitle fontSize="sm">Заявка отклонена</AlertTitle>
                          <AlertDescription fontSize="xs">
                            Свяжитесь с поддержкой для уточнения причин
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {(site.status === 'active' || site.status === 'approved') && site.stats && (
                      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        <Stat size="sm">
                          <StatLabel fontSize="xs">Товары</StatLabel>
                          <StatNumber fontSize="lg">{site.stats.products}</StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel fontSize="xs">Заказы</StatLabel>
                          <StatNumber fontSize="lg">{site.stats.orders}</StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel fontSize="xs">Визиты</StatLabel>
                          <StatNumber fontSize="lg">{site.stats.visitors}</StatNumber>
                        </Stat>
                      </Grid>
                    )}

                    <VStack align="stretch" spacing={1}>
                      <Text fontSize="xs" color="gray.500">
                        Создан: {new Date(site.createdAt).toLocaleDateString('ru-RU')}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Изменен: {new Date(site.lastModified).toLocaleDateString('ru-RU')}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )}
      </VStack>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Удалить сайт?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text>
                Вы уверены, что хотите удалить сайт <strong>{selectedSite?.siteName}</strong>?
              </Text>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box flex={1}>
                  <AlertTitle fontSize="sm">Внимание!</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Это действие необратимо. Все данные сайта будут удалены.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Отмена
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteSite}
              isLoading={actionLoading}
            >
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Disable Modal */}
      <Modal isOpen={isDisableOpen} onClose={onDisableClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedSite?.isEnabled ? 'Отключить сайт?' : 'Включить сайт?'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text>
                {selectedSite?.isEnabled
                  ? 'Сайт будет недоступен для посетителей, но вы сможете продолжить его редактирование.'
                  : 'Сайт снова станет доступен для посетителей.'}
              </Text>
              <Alert status={selectedSite?.isEnabled ? 'warning' : 'info'} borderRadius="md">
                <AlertIcon />
                <Box flex={1}>
                  <AlertDescription fontSize="sm">
                    {selectedSite?.isEnabled
                      ? 'Посетители увидят страницу "Сайт временно недоступен"'
                      : 'Сайт станет полностью функциональным'}
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDisableClose}>
              Отмена
            </Button>
            <Button
              colorScheme={selectedSite?.isEnabled ? 'orange' : 'green'}
              onClick={() => {
                if (selectedSite) {
                  handleToggleSite(selectedSite);
                  onDisableClose();
                }
              }}
              isLoading={actionLoading}
            >
              {selectedSite?.isEnabled ? 'Отключить' : 'Включить'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
