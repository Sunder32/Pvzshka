import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon, TagIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types'
import ProductCard from '../product/ProductCard'

interface SmartCartProps {
  isOpen: boolean
  onClose: () => void
  recommendedProducts?: Product[]
  frequentlyBoughtTogether?: Product[]
}

/**
 * SmartCart - Умная корзина с рекомендациями и апселом
 * 
 * Особенности:
 * - Кросс-селл (часто покупают вместе)
 * - Апселл (более дорогие альтернативы)
 * - Расчет экономии и скидок
 * - Прогресс до бесплатной доставки
 * - Промокоды
 * - Сохранение на потом
 */
export default function SmartCart({
  isOpen,
  onClose,
  recommendedProducts = [],
  frequentlyBoughtTogether = [],
}: SmartCartProps) {
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [savedForLater, setSavedForLater] = useState<string[]>([])

  const { items, updateQuantity, removeItem, clearCart } = useCartStore()

  // Расчеты
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0
  const deliveryFee = subtotal >= 3000 ? 0 : 300
  const total = subtotal - promoDiscount + deliveryFee

  const freeDeliveryProgress = subtotal >= 3000 ? 100 : (subtotal / 3000) * 100
  const freeDeliveryRemaining = Math.max(0, 3000 - subtotal)

  // Применить промокод
  const applyPromoCode = () => {
    // Моковые промокоды (в реальности - запрос к API)
    const promoCodes: Record<string, number> = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'VIP30': 30,
    }

    const discount = promoCodes[promoCode.toUpperCase()]
    if (discount) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount })
      setPromoCode('')
    } else {
      alert('Промокод не найден')
    }
  }

  // Сохранить на потом
  const saveForLater = (itemId: string) => {
    setSavedForLater([...savedForLater, itemId])
    removeItem(itemId)
  }

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Корзина</h2>
            <p className="text-sm text-gray-600 mt-1">
              {items.length} {items.length === 1 ? 'товар' : 'товара'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Progress to free delivery */}
        {freeDeliveryRemaining > 0 && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                🚚 До бесплатной доставки: <span className="font-bold text-[#005BFF]">
                  {formatPrice(freeDeliveryRemaining)}
                </span>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#005BFF] h-2 rounded-full transition-all duration-500"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Корзина пуста</h3>
              <p className="text-gray-600 mb-6">Добавьте товары, чтобы начать покупки</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#005BFF] text-white rounded-lg font-semibold hover:bg-[#0047CC] transition-colors"
              >
                Продолжить покупки
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-gray-50 rounded-lg p-4">
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                    <Image
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">{item.name}</h4>
                    
                    {/* Size & Color */}
                    {(item.size || item.color) && (
                      <div className="flex gap-2 text-xs text-gray-600 mb-2">
                        {item.size && <span>Размер: {item.size}</span>}
                        {item.color && <span>Цвет: {item.color}</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="px-3 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-xs text-gray-500">{formatPrice(item.price)} / шт</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-3 text-xs">
                      <button
                        onClick={() => saveForLater(item.id)}
                        className="text-[#005BFF] hover:underline"
                      >
                        💾 Сохранить на потом
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:underline"
                      >
                        <TrashIcon className="w-4 h-4 inline mr-1" />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Frequently Bought Together */}
              {frequentlyBoughtTogether.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TagIcon className="w-5 h-5 text-[#005BFF]" />
                    Часто покупают вместе
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {frequentlyBoughtTogether.slice(0, 4).map((product) => (
                      <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="relative aspect-square mb-2 rounded overflow-hidden">
                          <Image
                            src={product.images[0] || '/placeholder-product.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h4 className="text-xs font-medium line-clamp-2 mb-2">{product.name}</h4>
                        <p className="font-bold text-sm mb-2">{formatPrice(product.price)}</p>
                        <button className="w-full py-1.5 bg-[#005BFF] text-white text-xs font-semibold rounded hover:bg-[#0047CC] transition-colors">
                          + Добавить
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Промокод</h3>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">{appliedPromo.code}</p>
                        <p className="text-xs text-green-700">Скидка {appliedPromo.discount}%</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAppliedPromo(null)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Введите промокод"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005BFF]"
                    />
                    <button
                      onClick={applyPromoCode}
                      disabled={!promoCode}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Применить
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            {/* Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Товары ({items.length}):</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Скидка по промокоду:</span>
                  <span className="font-semibold">-{formatPrice(promoDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <TruckIcon className="w-4 h-4" />
                  Доставка:
                </span>
                <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                  {deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                <span>Итого:</span>
                <span className="text-[#005BFF]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout">
              <button className="w-full py-4 bg-[#005BFF] text-white rounded-xl font-bold text-lg hover:bg-[#0047CC] transition-all hover:shadow-lg">
                Оформить заказ
              </button>
            </Link>

            <button
              onClick={clearCart}
              className="w-full mt-2 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Очистить корзину
            </button>
          </div>
        )}
      </div>
    </>
  )
}
