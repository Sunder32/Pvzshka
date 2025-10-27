import { useParams } from 'react-router-dom'
import { Tabs, Card, Descriptions, Tag, Button, Space, Statistic, Row, Col } from 'antd'
import { EditOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons'

export default function TenantDetail() {
  const { id } = useParams()

  const mockTenant = {
    id,
    name: 'Магазин электроники',
    subdomain: 'electronics',
    customDomain: 'electronics.com',
    tier: 'premium',
    status: 'active',
    country: 'RU',
    createdAt: '2024-01-15',
    contactEmail: 'admin@electronics.com',
    contactPhone: '+7 (999) 123-45-67',
    stats: {
      totalProducts: 1523,
      totalOrders: 4567,
      monthlyRevenue: 850000,
      activeUsers: 234,
    },
  }

  const tabItems = [
    {
      key: 'overview',
      label: 'Обзор',
      children: (
        <div>
          <Card title="Информация о тенанте" style={{ marginBottom: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Название">{mockTenant.name}</Descriptions.Item>
              <Descriptions.Item label="Поддомен">
                {mockTenant.subdomain}.marketplace.com
              </Descriptions.Item>
              <Descriptions.Item label="Собственный домен">
                {mockTenant.customDomain || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Тариф">
                <Tag color="purple">{mockTenant.tier.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Tag color="success">{mockTenant.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Страна">{mockTenant.country}</Descriptions.Item>
              <Descriptions.Item label="Дата создания">
                {mockTenant.createdAt}
              </Descriptions.Item>
              <Descriptions.Item label="Email">{mockTenant.contactEmail}</Descriptions.Item>
              <Descriptions.Item label="Телефон">{mockTenant.contactPhone}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Статистика">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Statistic title="Товаров" value={mockTenant.stats.totalProducts} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Statistic title="Заказов" value={mockTenant.stats.totalOrders} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Statistic
                  title="Выручка за месяц"
                  value={mockTenant.stats.monthlyRevenue}
                  suffix="₽"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Statistic
                  title="Активные пользователи"
                  value={mockTenant.stats.activeUsers}
                />
              </Col>
            </Row>
          </Card>
        </div>
      ),
    },
    {
      key: 'settings',
      label: 'Настройки',
      children: (
        <Card>
          <p>Настройки тенанта (в разработке)</p>
        </Card>
      ),
    },
    {
      key: 'billing',
      label: 'Биллинг',
      children: (
        <Card>
          <p>История платежей и подписки (в разработке)</p>
        </Card>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>{mockTenant.name}</h1>
        <Space>
          <Button icon={<EditOutlined />}>Редактировать</Button>
          <Button icon={<CheckCircleOutlined />} type="primary">
            Активировать
          </Button>
          <Button icon={<StopOutlined />} danger>
            Приостановить
          </Button>
        </Space>
      </div>

      <Tabs items={tabItems} />
    </div>
  )
}
