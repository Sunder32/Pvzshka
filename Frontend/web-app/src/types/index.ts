export interface Product {
  id: string
  name: string
  description: string
  price: number
  oldPrice?: number
  discount?: number
  images: string[]
  category: string
  categoryName?: string
  brand?: string
  rating?: number
  reviewCount?: number
  inStock: boolean
  stock?: number
  sku?: string
  attributes?: Record<string, any>
  tenant_id?: string
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: string
  count?: number
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  attributes?: Record<string, any>
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: 'customer' | 'admin' | 'tenant_admin'
  tenant_id?: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: CartItem[]
  total: number
  shipping_address: Address
  pickup_point?: PickupPoint
  payment_method: 'card' | 'cash' | 'online'
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
  updated_at: string
}

export interface Address {
  street: string
  city: string
  region: string
  postal_code: string
  country: string
}

export interface PickupPoint {
  id: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  working_hours: string
  phone?: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  rating: number
  title?: string
  comment: string
  images?: string[]
  helpful_count: number
  created_at: string
}

export interface TenantConfig {
  id: string
  name: string
  slug: string
  description?: string
  domain?: string
  logo?: string
  favicon?: string
  appleIcon?: string
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor?: string
  }
  settings: Record<string, any>
}
