import { useState } from 'react'
import { Layout as AntLayout, Menu, Avatar, Dropdown, theme } from 'antd'
import {
  DashboardOutlined,
  ShopOutlined,
  UserOutlined,
  CreditCardOutlined,
  AppstoreAddOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BuildOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
    },
    {
      key: '/tenants',
      icon: <ShopOutlined />,
      label: 'Тенанты',
    },
    {
      key: '/site-requests',
      icon: <AppstoreAddOutlined />,
      label: 'Заявки на сайты',
    },
    {
      key: '/site-builder',
      icon: <BuildOutlined />,
      label: 'Конструктор сайта',
    },
    {
      key: '/support',
      icon: <CustomerServiceOutlined />,
      label: 'Поддержка',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Пользователи',
    },
    {
      key: '/billing',
      icon: <CreditCardOutlined />,
      label: 'Биллинг',
    },
    {
      key: '/app-generator',
      icon: <AppstoreAddOutlined />,
      label: 'Генератор приложений',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выход',
      danger: true,
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 18 : 20,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'GA' : 'Global Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined
              style={{ fontSize: 18, cursor: 'pointer' }}
              onClick={() => setCollapsed(false)}
            />
          ) : (
            <MenuFoldOutlined
              style={{ fontSize: 18, cursor: 'pointer' }}
              onClick={() => setCollapsed(true)}
            />
          )}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span>{user?.name}</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
