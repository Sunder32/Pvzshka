// API клиент для Tenant Admin
import axios from 'axios';

const CONFIG_SERVICE_URL = import.meta.env.VITE_CONFIG_SERVICE_URL || 'http://localhost:4000';

const configClient = axios.create({
  baseURL: CONFIG_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типы
export interface Supplier {
  id: string;
  tenant_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  products_count: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  totalProducts: number;
}

// Получить текущий tenant_id (временно хардкод, потом из авторизации)
const getTenantId = (): string => {
  // TODO: Получать из localStorage или контекста авторизации
  return '87b9f436-d30d-406e-be1d-8f1123d77d90'; // electronics tenant
};

// API методы для Suppliers
export const suppliersAPI = {
  // Получить всех поставщиков
  getAll: async (): Promise<Supplier[]> => {
    const tenantId = getTenantId();
    const response = await configClient.get(`/api/suppliers?tenant_id=${tenantId}`);
    return response.data.data;
  },

  // Получить статистику
  getStats: async (): Promise<SupplierStats> => {
    const tenantId = getTenantId();
    const response = await configClient.get(`/api/suppliers/stats?tenant_id=${tenantId}`);
    return response.data.data;
  },

  // Получить одного поставщика
  getById: async (id: string): Promise<Supplier> => {
    const tenantId = getTenantId();
    const response = await configClient.get(`/api/suppliers/${id}?tenant_id=${tenantId}`);
    return response.data.data;
  },

  // Создать поставщика
  create: async (data: Omit<Supplier, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Supplier> => {
    const tenantId = getTenantId();
    const response = await configClient.post('/api/suppliers', {
      ...data,
      tenant_id: tenantId,
    });
    return response.data.data;
  },

  // Обновить поставщика
  update: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const tenantId = getTenantId();
    const response = await configClient.put(`/api/suppliers/${id}`, {
      ...data,
      tenant_id: tenantId,
    });
    return response.data.data;
  },

  // Удалить поставщика
  delete: async (id: string): Promise<void> => {
    const tenantId = getTenantId();
    await configClient.delete(`/api/suppliers/${id}?tenant_id=${tenantId}`);
  },
};

// Reports API
export interface SalesReport {
  id: string;
  tenant_id: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sale_date: string;
  category?: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportStats {
  overview: {
    totalOrders: number;
    totalSales: number;
    totalItemsSold: number;
    totalRevenue: number;
    avgOrderValue: number;
    totalCategories: number;
  };
  topProducts: {
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
    salesCount: number;
  }[];
  categories: {
    category: string;
    salesCount: number;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  salesTrend: {
    date: string;
    salesCount: number;
    itemsSold: number;
    revenue: number;
  }[];
}

export interface RevenueData {
  period: string;
  salesCount: number;
  itemsSold: number;
  revenue: number;
}

export const reportsAPI = {
  getAll: async (params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    start_date?: string;
    end_date?: string;
    category?: string;
  }): Promise<SalesReport[]> => {
    const tenantId = getTenantId();
    const queryParams = new URLSearchParams({ tenant_id: tenantId, ...params } as any);
    const response = await fetch(`${CONFIG_SERVICE_URL}/api/reports?${queryParams}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  getStats: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ReportStats> => {
    const tenantId = getTenantId();
    const response = await fetch(
      `${CONFIG_SERVICE_URL}/api/reports/stats?tenant_id=${tenantId}&period=${period}`
    );
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  getRevenue: async (groupBy: 'day' | 'week' | 'month' = 'day'): Promise<RevenueData[]> => {
    const tenantId = getTenantId();
    const response = await fetch(
      `${CONFIG_SERVICE_URL}/api/reports/revenue?tenant_id=${tenantId}&group_by=${groupBy}`
    );
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },
};

export default configClient;
