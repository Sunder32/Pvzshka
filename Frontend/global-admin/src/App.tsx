import { Routes, Route, Navigate } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tenants from './pages/Tenants'
import TenantDetail from './pages/TenantDetail'
import Users from './pages/Users'
import Billing from './pages/Billing'
import AppGenerator from './pages/AppGenerator'
import SiteBuilder from './pages/SiteBuilder'
import SupportTickets from './pages/SupportTickets'
import Settings from './pages/Settings'
import { useAuthStore } from './store/auth'
import client from './lib/graphql'

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <ApolloProvider client={client}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/tenants/:id" element={<TenantDetail />} />
          <Route path="/site-builder" element={<SiteBuilder />} />
          <Route path="/support" element={<SupportTickets />} />
          <Route path="/users" element={<Users />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/app-generator" element={<AppGenerator />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ApolloProvider>
  )
}

export default App
