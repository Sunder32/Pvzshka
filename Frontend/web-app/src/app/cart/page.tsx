'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Корзина пуста</h1>
          <p className="text-gray-600 mb-6">Добавьте товары из каталога</p>
          <Link
            href="/catalog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Корзина ({getTotalItems()} товаров)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-6 flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <Link href={`/catalog/${item.productId}`} className="font-semibold hover:text-blue-600 mb-2 block">
                    {item.name}
                  </Link>
                  {item.variant && (
                    <p className="text-sm text-gray-600 mb-2">{item.variant}</p>
                  )}
                  <p className="text-xl font-bold text-blue-600">{item.price.toLocaleString('ru-RU')} ₽</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 border rounded hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border rounded hover:bg-gray-50 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">Итого:</p>
                    <p className="text-lg font-bold">
                      {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => clearCart()}
              className="text-gray-600 hover:text-red-600 transition-colors text-sm"
            >
              Очистить корзину
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Итого</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Товары ({getTotalItems()} шт.):</span>
                  <span className="font-semibold">{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Доставка:</span>
                  <span className="font-semibold text-green-600">Бесплатно</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold">К оплате:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {getTotalPrice().toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold mb-3"
              >
                Оформить заказ
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/catalog"
                className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-semibold"
              >
                Продолжить покупки
              </Link>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Бесплатная доставка от 3000 ₽</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Возврат в течение 14 дней</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Гарантия качества</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
