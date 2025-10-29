'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import { X, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/store/cart'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addItem } = useCartStore()

  useEffect(() => {
    if (product) {
      setQuantity(1)
      setSelectedSize(null)
      setSelectedColor(null)
      setIsFavorite(false)
    }
  }, [product])

  if (!product) return null

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize || ''}-${selectedColor || ''}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[0] || '/placeholder.jpg',
      size: selectedSize || undefined,
      color: selectedColor || undefined
    })
    onClose()
  }

  const incrementQuantity = () => {
    if (quantity < (product.stock || 99)) {
      setQuantity(prev => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  // Mock размеры и цвета (в реальности из API)
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const availableColors = [
    { id: 'black', name: 'Черный', hex: '#000000' },
    { id: 'white', name: 'Белый', hex: '#FFFFFF' },
    { id: 'blue', name: 'Синий', hex: '#0066CC' },
    { id: 'red', name: 'Красный', hex: '#DC2626' }
  ]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Быстрый просмотр
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="grid md:grid-cols-2 gap-8 p-6">
                  {/* Left: Images */}
                  <div className="space-y-4">
                    {/* Main Swiper */}
                    <Swiper
                      modules={[Navigation, Pagination, Thumbs]}
                      navigation
                      pagination={{ clickable: true }}
                      thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                      className="rounded-xl overflow-hidden aspect-square bg-gray-100"
                    >
                      {product.images?.map((image, index) => (
                        <SwiperSlide key={index}>
                          <div className="relative w-full h-full">
                            <Image
                              src={image}
                              alt={`${product.name} - ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </SwiperSlide>
                      )) || (
                        <SwiperSlide>
                          <div className="relative w-full h-full">
                            <Image
                              src="/placeholder.jpg"
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </SwiperSlide>
                      )}
                    </Swiper>

                    {/* Thumbnails */}
                    {product.images && product.images.length > 1 && (
                      <Swiper
                        onSwiper={setThumbsSwiper}
                        modules={[Thumbs]}
                        spaceBetween={10}
                        slidesPerView={4}
                        watchSlidesProgress
                        className="!hidden md:!block"
                      >
                        {product.images.map((image, index) => (
                          <SwiperSlide key={index}>
                            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-colors">
                              <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )}
                  </div>

                  {/* Right: Product Info */}
                  <div className="flex flex-col">
                    {/* Product Name */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h2>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating?.toFixed(1)} ({product.reviewCount || 0} отзывов)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-3xl font-bold text-gray-900">
                        {product.price.toLocaleString()} ₽
                      </span>
                      {product.compareAtPrice && (
                        <>
                          <span className="text-lg text-gray-400 line-through">
                            {product.compareAtPrice.toLocaleString()} ₽
                          </span>
                          <span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-1 rounded">
                            -{discount}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-6">
                      {product.stock && product.stock > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">
                            В наличии{product.stock < 10 && ` (осталось ${product.stock} шт)`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-gray-700">Нет в наличии</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {product.description && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* Color Selection */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Цвет</h3>
                      <div className="flex items-center gap-2">
                        {availableColors.map(color => (
                          <button
                            key={color.id}
                            onClick={() => setSelectedColor(color.id)}
                            className={`
                              relative w-10 h-10 rounded-full border-2 transition-all
                              ${selectedColor === color.id
                                ? 'border-blue-600 scale-110'
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {selectedColor === color.id && color.hex === '#FFFFFF' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              </div>
                            )}
                            {selectedColor === color.id && color.hex !== '#FFFFFF' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size Selection */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Размер</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Таблица размеров
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {availableSizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`
                              px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                              ${selectedSize === size
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                              }
                            `}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Количество</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border-2 border-gray-200 rounded-lg">
                          <button
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={incrementQuantity}
                            disabled={quantity >= (product.stock || 99)}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <span className="text-sm text-gray-500">
                          Доступно: {product.stock || 0} шт
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={handleAddToCart}
                        disabled={!product.stock || product.stock === 0}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Добавить в корзину
                      </button>
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`
                          p-3 rounded-lg border-2 transition-all
                          ${isFavorite
                            ? 'border-red-500 bg-red-50 text-red-500'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }
                        `}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* View Full Details */}
                    <a
                      href={`/catalog/${product.id}`}
                      className="mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Посмотреть полное описание →
                    </a>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
