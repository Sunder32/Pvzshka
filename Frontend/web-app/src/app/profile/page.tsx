'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { User, Mail, Phone, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(formData)
    setEditing(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Профиль</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            {editing ? 'Отмена' : 'Редактировать'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Имя
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Телефон
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Сохранить изменения
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Имя
              </div>
              <div className="text-lg">{user?.name}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <div className="text-lg">{user?.email}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Телефон
              </div>
              <div className="text-lg">{user?.phone || 'Не указан'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
