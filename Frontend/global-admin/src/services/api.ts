// API клиент для Global Admin
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CONFIG_SERVICE_URL = import.meta.env.VITE_GRAPHQL_URL?.replace('/graphql', '') || 'http://localhost:4000';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const configClient = axios.create({
  baseURL: CONFIG_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authClient = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к запросам
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Типы
export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'inactive';
  customDomain?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName?: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  monthlyRevenue: number;
}

// API методы для Tenants
export const tenantsAPI = {
  // Получить все tenants
  getAll: async (): Promise<Tenant[]> => {
    try {
      const response = await authClient.get('/api/tenants');
      return response.data.tenants; // auth-api возвращает {tenants: [...]}
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  // Получить один tenant
  getById: async (id: string): Promise<Tenant> => {
    const response = await authClient.get(`/api/tenants/${id}`);
    return response.data.tenant;
  },

  // Создать tenant
  create: async (data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> => {
    const response = await authClient.post('/api/tenants', data);
    return response.data.tenant; // auth-api возвращает {tenant: {...}}
  },

  // Обновить tenant
  update: async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    const response = await authClient.put(`/api/tenants/${id}`, data);
    return response.data.tenant;
  },

  // Удалить tenant
  delete: async (id: string): Promise<void> => {
    await authClient.delete(`/api/tenants/${id}`);
  },

  // Получить статистику
  getStats: async (): Promise<Stats> => {
    const response = await authClient.get('/api/tenants/stats');
    return response.data;
  },
};

// API методы для Support Tickets
export const ticketsAPI = {
  // Получить все тикеты
  getAll: async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get('/tickets');
    return response.data;
  },

  // Получить тикеты по tenant
  getByTenant: async (tenantId: string): Promise<SupportTicket[]> => {
    const response = await apiClient.get(`/tickets?tenantId=${tenantId}`);
    return response.data;
  },

  // Создать тикет
  create: async (data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  // Обновить статус тикета
  updateStatus: async (id: string, status: SupportTicket['status']): Promise<SupportTicket> => {
    const response = await apiClient.patch(`/tickets/${id}/status`, { status });
    return response.data;
  },

  // Удалить тикет
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tickets/${id}`);
  },
};

// Config Service API
export const configAPI = {
  // Получить конфиг tenant
  get: async (tenantId: string) => {
    const response = await configClient.get(`/api/config/${tenantId}`);
    return response.data;
  },

  // Обновить конфиг
  update: async (tenantId: string, config: any) => {
    const response = await configClient.put(`/api/config/${tenantId}`, config);
    return response.data;
  },
};

export default apiClient;
