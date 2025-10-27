'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { MapPin, CreditCard, Package } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    deliveryMethod: 'pvz',
    pvzAddress: '',
    paymentMethod: 'online',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: API call to create order
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      clearCart()
      router.push('/orders')
    } catch (error) {
      console.error('Order creation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h1 className="text-2xl font-bold mb-4">Корзина пустая</h1>
        <button
          onClick={() => router.push('/catalog')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Перейти в каталог
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Контактные данные</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Имя</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Телефон</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Способ доставки
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="delivery"
                    value="pvz"
                    checked={formData.deliveryMethod === 'pvz'}
                    onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                  />
                  <div>
                    <div className="font-medium">Пункт выдачи</div>
                    <div className="text-sm text-gray-500">Бесплатно, 3-5 дней</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="delivery"
                    value="courier"
                    checked={formData.deliveryMethod === 'courier'}
                    onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                  />
                  <div>
                    <div className="font-medium">Курьер</div>
                    <div className="text-sm text-gray-500">₽300, 1-3 дня</div>
                  </div>
                </label>
              </div>

              {formData.deliveryMethod === 'pvz' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Адрес ПВЗ</label>
                  <select
                    required
                    value={formData.pvzAddress}
                    onChange={(e) => setFormData({ ...formData, pvzAddress: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Выберите пункт выдачи</option>
                    <option value="pvz1">CDEK - ул. Ленина, 10</option>
                    <option value="pvz2">Boxberry - пр. Мира, 25</option>
                    <option value="pvz3">PickPoint - ул. Гагарина, 5</option>
                  </select>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Способ оплаты
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  />
                  <div className="font-medium">Онлайн оплата</div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  />
                  <div className="font-medium">При получении</div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Оформление...' : 'Оформить заказ'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow sticky top-4">
            <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₽{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Товары</span>
                <span>₽{getTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Доставка</span>
                <span>{formData.deliveryMethod === 'courier' ? '₽300' : 'Бесплатно'}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                <span>Итого</span>
                <span>
                  ₽
                  {(
                    getTotalPrice() + (formData.deliveryMethod === 'courier' ? 300 : 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
