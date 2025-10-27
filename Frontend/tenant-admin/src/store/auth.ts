import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId?: string
  tenantName?: string
  subdomain?: string
  customDomain?: string
}

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

const API_URL = 'http://localhost:8080/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
          }

          const data = await response.json();
          
          set({ 
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              tenantId: data.user.tenant_id || '00000000-0000-0000-0000-000000000001',
              tenantName: data.user.tenant_name,
              subdomain: data.user.subdomain,
              customDomain: data.user.custom_domain,
            }, 
            token: data.token 
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null })
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'tenant-admin-auth',
    }
  )
)
