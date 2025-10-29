import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Analytics from './pages/Analytics'
import SiteBuilder from './pages/SiteBuilder'
import PagesEditor from './pages/PagesEditor'
import Support from './pages/Support'
import Settings from './pages/Settings'
import Suppliers from './pages/Suppliers'
import Reports from './pages/Reports'
import SiteSettings from './pages/SiteSettings'
import SiteRequestWizard from './pages/SiteRequestWizard'
import MySites from './pages/MySites'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return user ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="my-sites" element={<MySites />} />
          <Route path="site-request" element={<SiteRequestWizard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="site-builder" element={<SiteBuilder />} />
          <Route path="site-builder/:siteId" element={<SiteBuilder />} />
          <Route path="pages-editor" element={<PagesEditor />} />
          <Route path="pages-editor/:siteId" element={<PagesEditor />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="site-settings" element={<SiteSettings />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
