import { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Input, Modal, Form, Select, message, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'

const { Search } = Input

interface User {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'tenant_admin' | 'tenant_user' | 'admin' | 'customer'
  tenantId?: string
  tenantName?: string
  status: 'active' | 'inactive'
  createdAt: string
}

const API_URL = 'http://localhost:8080/api';

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
      message.error('Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colors: Record<string, string> = {
          super_admin: 'red',
          tenant_admin: 'blue',
          tenant_user: 'green',
        }
        const labels: Record<string, string> = {
          super_admin: 'Супер Админ',
          tenant_admin: 'Админ Тенанта',
          tenant_user: 'Пользователь',
        }
        return <Tag color={colors[role]}>{labels[role]}</Tag>
      },
    },
    {
      title: 'Тенант',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (name?: string) => name || '-',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'success',
          inactive: 'default',
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Редактировать
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Удалить
          </Button>
        </Space>
      ),
    },
  ]

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Удалить пользователя?',
      content: 'Это действие нельзя отменить',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: () => {
        setUsers(users.filter((u) => u.id !== id))
        message.success('Пользователь удален')
      },
    })
  }

  const handleSubmit = async (values: any) => {
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...values } : u))
      )
      message.success('Пользователь обновлен')
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setUsers([...users, newUser])
      message.success('Пользователь создан')
    }
    setIsModalOpen(false)
    form.resetFields()
    setEditingUser(null)
  }

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1>Управление пользователями</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null)
              form.resetFields()
              setIsModalOpen(true)
            }}
          >
            Добавить пользователя
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Поиск по email или имени"
            prefix={<SearchOutlined />}
            style={{ width: 400 }}
          />
        </div>

        <Table dataSource={users} columns={columns} rowKey="id" />

      <Modal
        title={editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
          setEditingUser(null)
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Неверный формат email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Имя"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select>
              <Select.Option value="super_admin">Супер Админ</Select.Option>
              <Select.Option value="tenant_admin">Админ Тенанта</Select.Option>
              <Select.Option value="tenant_user">Пользователь</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Статус"
            rules={[{ required: true, message: 'Выберите статус' }]}
          >
            <Select>
              <Select.Option value="active">Активен</Select.Option>
              <Select.Option value="inactive">Неактивен</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Обновить' : 'Создать'}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </Spin>
  )
}
