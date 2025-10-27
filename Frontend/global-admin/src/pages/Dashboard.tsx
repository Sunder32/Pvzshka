import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Spin } from 'antd'
import {
  ShopOutlined,
  UserOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import { Line, Bar } from 'recharts'
import { tenantsAPI, type Stats, type Tenant } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
  })
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [statsData, tenantsData] = await Promise.all([
          tenantsAPI.getStats(),
          tenantsAPI.getAll()
        ])
        setStats(statsData)
        // Берём только последние 5 tenant'ов
        setRecentTenants(tenantsData.slice(0, 5))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Поддомен',
      dataIndex: 'subdomain',
      key: 'subdomain',
    },
    {
      title: 'Тариф',
      dataIndex: 'tier',
      key: 'tier',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ]

  return (
    <Spin spinning={loading}>
      <div>
        <h1 style={{ marginBottom: 24 }}>Дашборд</h1>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Всего тенантов"
                value={stats.totalTenants}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Активные тенанты"
                value={stats.activeTenants}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего пользователей"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Выручка за месяц"
              value={stats.monthlyRevenue}
              prefix={<DollarOutlined />}
              suffix="₽"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Недавно созданные тенанты">
            <Table
              dataSource={recentTenants}
              columns={columns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
      </div>
    </Spin>
  )
}
