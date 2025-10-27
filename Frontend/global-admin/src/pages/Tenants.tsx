import { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Input, Modal, Form, Select, message, Tabs, Card, Row, Col, Upload, DatePicker, Descriptions } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, LoginOutlined, EyeOutlined, UploadOutlined, LinkOutlined, GlobalOutlined } from '@ant-design/icons'
import type { TabsProps } from 'antd'
import { tenantsAPI, type Tenant, type SupportTicket } from '../services/api'

const { Search } = Input
const { TextArea} = Input

// Mock данные временно закомментированы - будут загружаться из API
const mockTickets: SupportTicket[] = []

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [form] = Form.useForm()
  const [ticketForm] = Form.useForm()

  // Загрузка данных при монтировании
  useEffect(() => {
    loadTenants()
    // loadTickets() // TODO: Когда будет ticket service
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)
      const data = await tenantsAPI.getAll()
      setTenants(data)
    } catch (error) {
      console.error('Error loading tenants:', error)
      message.error('Ошибка загрузки списка проектов')
    } finally {
      setLoading(false)
    }
  }

  // Columns for Tenants table
  const tenantColumns = [
    {
      title: 'Лого',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo: string | undefined, record: Tenant) => (
        <div style={{ width: 50, height: 50, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          {logo ? <img src={logo} alt={record.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '🏪'}
        </div>
      ),
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Tenant) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.subdomain}</div>
        </div>
      ),
    },
    {
      title: 'URL магазина',
      dataIndex: 'subdomain',
      key: 'subdomain',
      render: (subdomain: string, record: Tenant) => {
        const webAppUrl = `http://localhost:3003/market/${subdomain}`
        return (
          <div>
            <div>
              <a href={webAppUrl} target="_blank" rel="noopener noreferrer">
                <Tag icon={<LinkOutlined />} color="blue" style={{ cursor: 'pointer' }}>
                  creator/market/{subdomain}
                </Tag>
              </a>
            </div>
            {record.customDomain && (
              <div style={{ marginTop: 4 }}>
                <Tag color="purple">{record.customDomain}</Tag>
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: 'Страна',
      dataIndex: 'country',
      key: 'country',
      render: (country: string | undefined) => (
        <div style={{ fontSize: 12 }}>
          {country || 'RU'}
        </div>
      ),
    },
    {
      title: 'Тариф',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier: string) => {
        const colors: Record<string, string> = {
          basic: 'default',
          standard: 'blue',
          premium: 'purple',
          enterprise: 'gold',
        }
        return <Tag color={colors[tier]}>{tier.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'success',
          suspended: 'error',
          trial: 'warning',
        }
        const labels: Record<string, string> = {
          active: 'Активен',
          suspended: 'Приостановлен',
          trial: 'Пробный',
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
    {
      title: 'Создан',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 320,
      render: (_: any, record: Tenant) => {
        const webAppUrl = `http://localhost:3003/market/${record.subdomain}`
        return (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<GlobalOutlined />}
              onClick={() => window.open(webAppUrl, '_blank')}
            >
              Открыть
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<LoginOutlined />}
              onClick={() => handleConnectToTenant(record)}
            >
              Подключиться
            </Button>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Space>
        )
      },
    },
  ]

  // Columns for Support Tickets table
  const ticketColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Тема',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string, record: SupportTicket) => (
        <div>
          <div style={{ fontWeight: 600 }}>{subject}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {record.description.substring(0, 80)}...
          </div>
        </div>
      ),
    },
    {
      title: 'Проект',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors: Record<string, string> = {
          low: 'default',
          medium: 'blue',
          high: 'orange',
          critical: 'red',
        }
        const labels: Record<string, string> = {
          low: 'Низкий',
          medium: 'Средний',
          high: 'Высокий',
          critical: 'Критический',
        }
        return <Tag color={colors[priority]}>{labels[priority]}</Tag>
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          new: 'blue',
          'in-progress': 'orange',
          resolved: 'green',
          closed: 'default',
        }
        const labels: Record<string, string> = {
          new: 'Новая',
          'in-progress': 'В работе',
          resolved: 'Решена',
          closed: 'Закрыта',
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
    {
      title: 'Создана',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: SupportTicket) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewTicket(record)}
          >
            Открыть
          </Button>
        </Space>
      ),
    },
  ]

  const handleConnectToTenant = (tenant: Tenant) => {
    message.info(`Подключение к магазину "${tenant.name}"...`)
    // Redirect to tenant admin panel
    window.open(`http://localhost:3002?tenantId=${tenant.id}`, '_blank')
  }

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant)
    form.setFieldsValue(tenant)
    setIsModalOpen(true)
  }

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    ticketForm.setFieldsValue({
      status: ticket.status,
      priority: ticket.priority,
    })
    setIsTicketModalOpen(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      if (editingTenant) {
        // Обновление существующего tenant
        await tenantsAPI.update(editingTenant.id, values)
        message.success('Проект обновлен')
        await loadTenants() // Перезагрузка списка
      } else {
        // Создание нового tenant
        await tenantsAPI.create(values)
        message.success('Новый проект магазина создан!')
        await loadTenants() // Перезагрузка списка
      }
      setIsModalOpen(false)
      form.resetFields()
      setEditingTenant(null)
    } catch (error) {
      console.error('Error saving tenant:', error)
      message.error('Ошибка сохранения проекта')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Удалить проект магазина?',
      content: 'Все данные магазина будут удалены без возможности восстановления!',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          setLoading(true)
          await tenantsAPI.delete(id)
          message.success('Проект удален')
          await loadTenants()
        } catch (error) {
          console.error('Error deleting tenant:', error)
          message.error('Ошибка удаления проекта')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const handleUpdateTicket = (values: any) => {
    if (selectedTicket) {
      setTickets(
        tickets.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, ...values, updatedAt: new Date().toISOString() }
            : t
        )
      )
      message.success('Заявка обновлена')
      setIsTicketModalOpen(false)
      setSelectedTicket(null)
      ticketForm.resetFields()
    }
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'projects',
      label: (
        <span>
          <span style={{ fontSize: 18, marginRight: 8 }}>🏪</span>
          Список пространств
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={18}>
              <Card>
                <h2>Созданные проекты магазинов</h2>
                <div style={{ marginBottom: 16 }}>
                  <Search
                    placeholder="Поиск по названию, поддомену или email"
                    prefix={<SearchOutlined />}
                    style={{ width: '100%' }}
                  />
                </div>
                <Table 
                  dataSource={tenants} 
                  columns={tenantColumns} 
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Создать новый магазин" style={{ position: 'sticky', top: 20 }}>
                <Form
                  layout="vertical"
                  onFinish={async (values) => {
                    try {
                      setLoading(true);
                      const newTenant = await tenantsAPI.create({
                        name: values.name,
                        subdomain: values.subdomain,
                        tier: values.tier || 'starter',
                        status: 'active',
                        country: 'RU',
                      });
                      
                      setTenants([newTenant, ...tenants]);
                      message.success('Магазин успешно создан!');
                      form.resetFields();
                    } catch (error: any) {
                      console.error('Error creating tenant:', error);
                      if (error.response?.status === 409) {
                        message.error('Магазин с таким поддоменом уже существует');
                      } else {
                        message.error('Ошибка при создании магазина');
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                  form={form}
                >
                  <Form.Item
                    name="name"
                    label="Название магазина"
                    rules={[{ required: true, message: 'Введите название' }]}
                  >
                    <Input placeholder="Мой магазин" />
                  </Form.Item>

                  <Form.Item
                    name="subdomain"
                    label="URL (поддомен)"
                    rules={[
                      { required: true, message: 'Введите поддомен' },
                      { pattern: /^[a-z0-9-]+$/, message: 'Только буквы, цифры и дефис' },
                    ]}
                  >
                    <Input 
                      placeholder="myshop" 
                      addonBefore="creator/market/"
                    />
                  </Form.Item>

                  <Form.Item name="description" label="Описание">
                    <TextArea rows={3} placeholder="Краткое описание магазина" />
                  </Form.Item>

                  <Form.Item
                    name="adminEmail"
                    label="Email администратора"
                    rules={[
                      { required: true, message: 'Введите email' },
                      { type: 'email', message: 'Неверный формат email' },
                    ]}
                  >
                    <Input placeholder="admin@example.com" />
                  </Form.Item>

                  <Form.Item
                    name="adminPhone"
                    label="Телефон"
                    rules={[{ required: true, message: 'Введите телефон' }]}
                  >
                    <Input placeholder="+7 (999) 123-45-67" />
                  </Form.Item>

                  <Form.Item
                    name="tier"
                    label="Тарифный план"
                    rules={[{ required: true }]}
                    initialValue="starter"
                  >
                    <Select>
                      <Select.Option value="free">Free - Бесплатный</Select.Option>
                      <Select.Option value="starter">Starter - 990₽/мес</Select.Option>
                      <Select.Option value="professional">Professional - 2990₽/мес</Select.Option>
                      <Select.Option value="enterprise">Enterprise - Договорная</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="country"
                    label="Страна"
                    rules={[{ required: true }]}
                    initialValue="RU"
                  >
                    <Select>
                      <Select.Option value="RU">🇷🇺 Россия</Select.Option>
                      <Select.Option value="KZ">🇰🇿 Казахстан</Select.Option>
                      <Select.Option value="BY">🇧🇾 Беларусь</Select.Option>
                      <Select.Option value="UA">🇺🇦 Украина</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block size="large">
                      Создать магазин
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'support',
      label: (
        <span>
          <span style={{ fontSize: 18, marginRight: 8 }}>💬</span>
          Техподдержка
          <Tag color="red" style={{ marginLeft: 8 }}>
            {tickets.filter((t) => t.status === 'open').length}
          </Tag>
        </span>
      ),
      children: (
        <Card>
          <h2>Заявки в техническую поддержку</h2>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Search
                placeholder="Поиск по теме или проекту"
                prefix={<SearchOutlined />}
                style={{ width: 400 }}
              />
              <Select placeholder="Фильтр по статусу" style={{ width: 150 }} allowClear>
                <Select.Option value="new">Новые</Select.Option>
                <Select.Option value="in-progress">В работе</Select.Option>
                <Select.Option value="resolved">Решенные</Select.Option>
                <Select.Option value="closed">Закрытые</Select.Option>
              </Select>
              <Select placeholder="Приоритет" style={{ width: 150 }} allowClear>
                <Select.Option value="critical">Критический</Select.Option>
                <Select.Option value="high">Высокий</Select.Option>
                <Select.Option value="medium">Средний</Select.Option>
                <Select.Option value="low">Низкий</Select.Option>
              </Select>
            </Space>
          </div>
          <Table 
            dataSource={tickets} 
            columns={ticketColumns} 
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Управление проектами</h1>
        <p style={{ color: '#888', fontSize: 14 }}>
          Создавайте и управляйте проектами интернет-магазинов
        </p>
      </div>

      <Tabs defaultActiveKey="projects" items={tabItems} size="large" />

      {/* Edit Tenant Modal */}
      <Modal
        title="Редактировать проект"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
          setEditingTenant(null)
        }}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Название магазина"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="subdomain"
            label="Поддомен"
            rules={[{ required: true, message: 'Введите поддомен' }]}
          >
            <Input addonBefore="creator/market/" />
          </Form.Item>

          <Form.Item name="customDomain" label="Собственный домен">
            <Input placeholder="example.com" />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="adminEmail"
                label="Email администратора"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="adminPhone"
                label="Телефон"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tier"
                label="Тариф"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="free">Free</Select.Option>
                  <Select.Option value="starter">Starter</Select.Option>
                  <Select.Option value="professional">Professional</Select.Option>
                  <Select.Option value="enterprise">Enterprise</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Статус"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="active">Активен</Select.Option>
                  <Select.Option value="trial">Пробный</Select.Option>
                  <Select.Option value="suspended">Приостановлен</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="country"
            label="Страна"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="RU">Россия</Select.Option>
              <Select.Option value="KZ">Казахстан</Select.Option>
              <Select.Option value="BY">Беларусь</Select.Option>
              <Select.Option value="UA">Украина</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal
        title={`Заявка ${selectedTicket?.id}`}
        open={isTicketModalOpen}
        onCancel={() => {
          setIsTicketModalOpen(false)
          setSelectedTicket(null)
          ticketForm.resetFields()
        }}
        footer={null}
        width={700}
      >
        {selectedTicket && (
          <>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Проект">{selectedTicket.tenantName || selectedTicket.tenantId}</Descriptions.Item>
              <Descriptions.Item label="Тема">{selectedTicket.subject}</Descriptions.Item>
              <Descriptions.Item label="Описание">{selectedTicket.description}</Descriptions.Item>
              <Descriptions.Item label="Создана">
                {new Date(selectedTicket.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Обновлена">
                {new Date(selectedTicket.updatedAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              {selectedTicket.images && selectedTicket.images.length > 0 && (
                <Descriptions.Item label="Изображения">
                  <Space>
                    {selectedTicket.images.map((img, idx) => (
                      <Tag key={idx} icon={<UploadOutlined />}>{img}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Form form={ticketForm} onFinish={handleUpdateTicket} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
                    <Select>
                      <Select.Option value="new">Новая</Select.Option>
                      <Select.Option value="in-progress">В работе</Select.Option>
                      <Select.Option value="resolved">Решена</Select.Option>
                      <Select.Option value="closed">Закрыта</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="priority" label="Приоритет" rules={[{ required: true }]}>
                    <Select>
                      <Select.Option value="low">Низкий</Select.Option>
                      <Select.Option value="medium">Средний</Select.Option>
                      <Select.Option value="high">Высокий</Select.Option>
                      <Select.Option value="critical">Критический</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Обновить заявку
                  </Button>
                  <Button onClick={() => setIsTicketModalOpen(false)}>Отмена</Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  )
}
