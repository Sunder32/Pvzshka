'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Eye } from 'lucide-react'

interface Order {
  id: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: number
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>([
    {
      id: '12345',
      date: '2024-01-20',
      status: 'delivered',
      total: 25990,
      items: 2,
    },
    {
      id: '12346',
      date: '2024-01-18',
      status: 'shipped',
      total: 15490,
      items: 1,
    },
    {
      id: '12347',
      date: '2024-01-15',
      status: 'processing',
      total: 8900,
      items: 3,
    },
  ])

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const statusLabels: Record<Order['status'], string> = {
    pending: 'Ожидает',
    processing: 'Обработка',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменен',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-medium mb-2">У вас пока нет заказов</h2>
          <Link href="/catalog" className="text-blue-600 hover:underline">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-bold">Заказ #{order.id}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Дата: {new Date(order.date).toLocaleDateString('ru-RU')}</p>
                    <p>Товаров: {order.items}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Сумма</div>
                    <div className="text-xl font-bold">₽{order.total.toLocaleString()}</div>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
