import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  variant?: string
  size?: string
  color?: string
  variantId?: string
}

interface CartStore {
  items: CartItem[]
  loading: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  loadCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
}

const API_URL = 'http://localhost:8080/api';

// Helper to get auth token
const getAuthToken = () => {
  const authStore = localStorage.getItem('marketplace-auth');
  if (!authStore) return null;
  try {
    const parsed = JSON.parse(authStore);
    return parsed.state?.token;
  } catch {
    return null;
  }
};

// Helper for authenticated API calls
const fetchAPI = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      
      loadCart: async () => {
        const token = getAuthToken();
        if (!token) {
          // User not logged in, use local storage only
          return;
        }

        try {
          set({ loading: true });
          const data = await fetchAPI(`${API_URL}/cart`);
          
          // Transform backend data to match CartItem interface
          const items = data.items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            image: item.images?.[0],
          }));

          set({ items, loading: false });
        } catch (error) {
          console.error('Failed to load cart:', error);
          set({ loading: false });
        }
      },

      addItem: async (item) => {
        const token = getAuthToken();
        
        if (!token) {
          // Fallback to local storage if not authenticated
          const existingItem = get().items.find((i) => i.id === item.id);
          
          if (existingItem) {
            set({
              items: get().items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            });
          } else {
            set({
              items: [...get().items, { ...item, quantity: item.quantity || 1 }],
            });
          }
          return;
        }

        try {
          await fetchAPI(`${API_URL}/cart/items`, {
            method: 'POST',
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity || 1,
              price: item.price,
            }),
          });

          // Reload cart from server
          await get().loadCart();
        } catch (error) {
          console.error('Failed to add item to cart:', error);
          // Fallback to local update
          const existingItem = get().items.find((i) => i.id === item.id);
          if (existingItem) {
            set({
              items: get().items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            });
          } else {
            set({
              items: [...get().items, { ...item, quantity: item.quantity || 1 }],
            });
          }
        }
      },
      
      removeItem: async (id) => {
        const token = getAuthToken();
        
        if (!token) {
          set({
            items: get().items.filter((i) => i.id !== id),
          });
          return;
        }

        try {
          await fetchAPI(`${API_URL}/cart/items/${id}`, {
            method: 'DELETE',
          });

          set({
            items: get().items.filter((i) => i.id !== id),
          });
        } catch (error) {
          console.error('Failed to remove item from cart:', error);
          // Fallback to local update
          set({
            items: get().items.filter((i) => i.id !== id),
          });
        }
      },
      
      updateQuantity: async (id, quantity) => {
        const token = getAuthToken();

        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        if (!token) {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          });
          return;
        }

        try {
          await fetchAPI(`${API_URL}/cart/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
          });

          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          });
        } catch (error) {
          console.error('Failed to update cart item:', error);
          // Fallback to local update
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          });
        }
      },
      
      clearCart: async () => {
        const token = getAuthToken();

        if (!token) {
          set({ items: [] });
          return;
        }

        try {
          await fetchAPI(`${API_URL}/cart`, {
            method: 'DELETE',
          });

          set({ items: [] });
        } catch (error) {
          console.error('Failed to clear cart:', error);
          // Fallback to local update
          set({ items: [] });
        }
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'marketplace-cart',
    }
  )
)
