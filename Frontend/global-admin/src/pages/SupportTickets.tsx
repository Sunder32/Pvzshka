import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  Input as AntInput,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Timeline,
  Avatar,
  message,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { TextArea } = AntInput;
const { Title, Text, Paragraph } = Typography;

interface Ticket {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  author: string;
  authorType: 'tenant' | 'admin';
  message: string;
  createdAt: string;
}

const API_URL = 'http://localhost:8080/api';

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // Загрузка тикетов при монтировании
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('Требуется авторизация');
        return;
      }

      const response = await fetch(`${API_URL}/support/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // API возвращает {tickets: [...]}
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      } else {
        message.error('Не удалось загрузить заявки');
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      message.error('Ошибка загрузки заявок');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/support/tickets/${ticket.id}`, {
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
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error('Error loading ticket details:', error);
      message.error('Не удалось загрузить детали заявки');
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: Ticket['status']) => {
    // Обновление статуса локально
    setTickets(
      tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
    // TODO: Отправить обновление на сервер
    message.success('Статус обновлен');
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyMessage,
        }),
      });

      if (response.ok) {
        const newMessage: TicketMessage = {
          id: Date.now().toString(),
          author: 'Admin',
          authorType: 'admin',
          message: replyMessage,
          createdAt: new Date().toISOString(),
        };

        setTickets(
          tickets.map((t) =>
            t.id === selectedTicket.id
              ? {
                  ...t,
                  messages: [...(t.messages || []), newMessage],
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
        );

        if (selectedTicket) {
          setSelectedTicket({
            ...selectedTicket,
            messages: [...(selectedTicket.messages || []), newMessage],
          });
        }

        setReplyMessage('');
        message.success('Ответ отправлен');
      } else {
        message.error('Не удалось отправить ответ');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      message.error('Ошибка отправки ответа');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'default',
      medium: 'processing',
      high: 'warning',
      urgent: 'error',
    };
    return colors[priority as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'blue',
      'in-progress': 'orange',
      resolved: 'green',
      closed: 'default',
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

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: string) => `#${id}`,
    },
    {
      title: 'Тенант',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Тема',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string, record: Ticket) => (
        <div>
          <div style={{ fontWeight: 500 }}>{subject}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getCategoryLabel(record.category)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Назначено',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 120,
      render: (assignedTo?: string) => assignedTo || <Text type="secondary">Не назначено</Text>,
    },
    {
      title: 'Создано',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_: any, record: Ticket) => (
        <Space>
          <Button size="small" onClick={() => handleViewTicket(record)}>
            Открыть
          </Button>
          {record.status === 'open' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, 'in-progress')}
            >
              Взять в работу
            </Button>
          )}
          {record.status === 'in-progress' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, 'resolved')}
              style={{ backgroundColor: '#52c41a' }}
            >
              Решено
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Заявки в поддержку</Title>
      <Paragraph type="secondary">Управление заявками от тенантов</Paragraph>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего заявок"
              value={tickets.length}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Открытых"
              value={tickets.filter((t) => t.status === 'open').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="В работе"
              value={tickets.filter((t) => t.status === 'in-progress').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Решено"
              value={tickets.filter((t) => t.status === 'resolved').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Поиск по теме..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Select placeholder="Фильтр по статусу" style={{ width: 180 }} allowClear>
            <Select.Option value="open">Открытые</Select.Option>
            <Select.Option value="in-progress">В работе</Select.Option>
            <Select.Option value="resolved">Решенные</Select.Option>
            <Select.Option value="closed">Закрытые</Select.Option>
          </Select>
          <Select placeholder="Фильтр по приоритету" style={{ width: 180 }} allowClear>
            <Select.Option value="urgent">Срочные</Select.Option>
            <Select.Option value="high">Высокий</Select.Option>
            <Select.Option value="medium">Средний</Select.Option>
            <Select.Option value="low">Низкий</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Ticket Detail Modal */}
      <Modal
        title={
          <Space>
            <span>Заявка #{selectedTicket?.id}</span>
            <Tag color={getStatusColor(selectedTicket?.status || '')}>
              {selectedTicket?.status}
            </Tag>
            <Tag color={getPriorityColor(selectedTicket?.priority || '')}>
              {selectedTicket?.priority}
            </Tag>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedTicket && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>Тенант:</Text> {selectedTicket.tenantName}
              </Col>
              <Col span={12}>
                <Text strong>Категория:</Text> {getCategoryLabel(selectedTicket.category)}
              </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Тема:</Text>
              <div>{selectedTicket.subject}</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Text strong>Переписка:</Text>
              <Timeline
                style={{ marginTop: 16 }}
                items={selectedTicket.messages.map((msg) => ({
                  color: msg.authorType === 'admin' ? 'blue' : 'green',
                  children: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>
                          {msg.author}
                          <Badge
                            count={msg.authorType === 'admin' ? 'Поддержка' : 'Тенант'}
                            style={{
                              backgroundColor:
                                msg.authorType === 'admin' ? '#1890ff' : '#52c41a',
                              marginLeft: 8,
                            }}
                          />
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(msg.createdAt).toLocaleString('ru-RU')}
                        </Text>
                      </div>
                      <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                        {msg.message}
                      </Paragraph>
                    </div>
                  ),
                }))}
              />
            </div>

            <div>
              <Text strong>Ответить:</Text>
              <TextArea
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Напишите ваш ответ..."
                style={{ marginTop: 8, marginBottom: 8 }}
              />
              <Space>
                <Button type="primary" onClick={handleSendReply} disabled={!replyMessage.trim()}>
                  Отправить
                </Button>
                {selectedTicket.status === 'open' && (
                  <Button onClick={() => handleUpdateStatus(selectedTicket.id, 'in-progress')}>
                    Взять в работу
                  </Button>
                )}
                {selectedTicket.status === 'in-progress' && (
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#52c41a' }}
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                  >
                    Пометить как решенное
                  </Button>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
