import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      login: async (email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
          })
          
          const { user, token } = response.data
          set({ user, token })
        } catch (error) {
          throw new Error('Ошибка входа')
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password,
          })
          
          const { user, token } = response.data
          set({ user, token })
        } catch (error) {
          throw new Error('Ошибка регистрации')
        }
      },
      
      logout: () => {
        set({ user: null, token: null })
      },
      
      get isAuthenticated() {
        return !!get().token
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
