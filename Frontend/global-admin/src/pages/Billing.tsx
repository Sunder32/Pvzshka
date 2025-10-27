import { Table, Card, Statistic, Row, Col, Tag, DatePicker, Select, Space } from 'antd'
import { DollarOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

interface Payment {
  id: string
  tenantName: string
  amount: number
  tier: string
  status: 'paid' | 'pending' | 'failed'
  paymentDate: string
  nextBillingDate: string
}

const mockPayments: Payment[] = [
  {
    id: '1',
    tenantName: 'Магазин электроники',
    amount: 29900,
    tier: 'premium',
    status: 'paid',
    paymentDate: '2024-01-01',
    nextBillingDate: '2024-02-01',
  },
  {
    id: '2',
    tenantName: 'Книжный магазин',
    amount: 14900,
    tier: 'standard',
    status: 'paid',
    paymentDate: '2024-01-05',
    nextBillingDate: '2024-02-05',
  },
  {
    id: '3',
    tenantName: 'Одежда и обувь',
    amount: 29900,
    tier: 'premium',
    status: 'pending',
    paymentDate: '2024-01-10',
    nextBillingDate: '2024-02-10',
  },
]

const mockStats = {
  totalRevenue: 2450000,
  monthlyRevenue: 450000,
  activeSubscriptions: 142,
  pendingPayments: 3,
}

export default function Billing() {
  const columns = [
    {
      title: 'Тенант',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`,
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
          paid: 'success',
          pending: 'warning',
          failed: 'error',
        }
        const labels: Record<string, string> = {
          paid: 'Оплачено',
          pending: 'Ожидает',
          failed: 'Неудача',
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
    {
      title: 'Дата платежа',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
    },
    {
      title: 'Следующий платеж',
      dataIndex: 'nextBillingDate',
      key: 'nextBillingDate',
    },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Биллинг и платежи</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Общая выручка"
              value={mockStats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Выручка за месяц"
              value={mockStats.monthlyRevenue}
              prefix={<CreditCardOutlined />}
              suffix="₽"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Активные подписки"
              value={mockStats.activeSubscriptions}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ожидают оплаты"
              value={mockStats.pendingPayments}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="История платежей">
        <Space style={{ marginBottom: 16 }}>
          <RangePicker placeholder={['Дата начала', 'Дата окончания']} />
          <Select placeholder="Тариф" style={{ width: 150 }}>
            <Select.Option value="all">Все</Select.Option>
            <Select.Option value="basic">Basic</Select.Option>
            <Select.Option value="standard">Standard</Select.Option>
            <Select.Option value="premium">Premium</Select.Option>
            <Select.Option value="enterprise">Enterprise</Select.Option>
          </Select>
          <Select placeholder="Статус" style={{ width: 150 }}>
            <Select.Option value="all">Все</Select.Option>
            <Select.Option value="paid">Оплачено</Select.Option>
            <Select.Option value="pending">Ожидает</Select.Option>
            <Select.Option value="failed">Неудача</Select.Option>
          </Select>
        </Space>

        <Table dataSource={mockPayments} columns={columns} rowKey="id" />
      </Card>
    </div>
  )
}
