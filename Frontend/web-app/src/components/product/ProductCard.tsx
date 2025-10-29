import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  HeartIcon as HeartOutline,
  ShoppingCartIcon,
  EyeIcon,
  ScaleIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { Product } from '@/types'
import QuickViewModal from './QuickViewModal'
import { useCartStore } from '@/store/cart'

interface ProductCardProps {
  product: Product
  priority?: boolean
  onCompare?: (productId: string) => void
  isInCompare?: boolean
  layout?: 'grid' | 'list'
}

export default function ProductCard({ 
  product, 
  priority = false, 
  onCompare,
  isInCompare = false,
  layout = 'grid'
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  const addToCart = useCartStore((state: any) => state.addItem)

  // Показываем вторую картинку при наведении
  const displayImage = isHovering && product.images.length > 1 
    ? product.images[1] 
    : product.images[0]

  // Расчет скидки
  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : product.discount || 0

  // Быстрое добавление в корзину с анимацией
  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAddingToCart(true)
    
    addToCart({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]
    })

    // Анимация кнопки
    setTimeout(() => setIsAddingToCart(false), 1500)
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onCompare?.(product.id)
  }

  const openQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsQuickViewOpen(true)
  }

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (layout === 'list') {
    return <ProductCardList {...{ product, isFavorite, toggleFavorite, formatPrice, openQuickView, handleQuickAddToCart, isAddingToCart }} />
  }

  return (
    <>
      <Link href={`/product/${product.id}`}>
        <div 
          className="group relative bg-white rounded-xl border border-gray-200 hover:border-[#005BFF] 
                     hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Изображение продукта */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Image
              src={displayImage || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={priority}
            />

            {/* Бейджи */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
              {discountPercentage > 0 && (
                <span className="bg-[#CB11AB] text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                  -{discountPercentage}%
                </span>
              )}
              {product.isNew && (
                <span className="bg-[#005BFF] text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                  Новинка
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                  ⭐ Топ
                </span>
              )}
              {product.isLimitedOffer && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg animate-pulse">
                  🔥 Осталось мало
                </span>
              )}
            </div>

            {/* Действия при наведении */}
            <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300 ${
              isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              <button
                onClick={toggleFavorite}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white shadow-lg 
                         transition-all duration-200 hover:scale-110"
                title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
              >
                {isFavorite ? (
                  <HeartSolid className="w-5 h-5 text-[#CB11AB]" />
                ) : (
                  <HeartOutline className="w-5 h-5 text-gray-700" />
                )}
              </button>

              <button
                onClick={openQuickView}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white shadow-lg 
                         transition-all duration-200 hover:scale-110"
                title="Быстрый просмотр"
              >
                <EyeIcon className="w-5 h-5 text-gray-700" />
              </button>

              {onCompare && (
                <button
                  onClick={handleCompare}
                  className={`bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white shadow-lg 
                           transition-all duration-200 hover:scale-110 ${isInCompare ? 'ring-2 ring-[#005BFF]' : ''}`}
                  title={isInCompare ? "Убрать из сравнения" : "Добавить к сравнению"}
                >
                  <ScaleIcon className={`w-5 h-5 ${isInCompare ? 'text-[#005BFF]' : 'text-gray-700'}`} />
                </button>
              )}
            </div>

            {/* Варианты цветов (если есть) */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="absolute bottom-2 left-2 flex gap-1.5">
                {product.availableColors.slice(0, 4).map(color => (
                  <div
                    key={color.id}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.availableColors.length > 4 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white shadow-md flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-600">
                      +{product.availableColors.length - 4}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Быстрое добавление в корзину (только при наведении) */}
            <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
              isHovering ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}>
              <button
                onClick={handleQuickAddToCart}
                disabled={!product.inStock || isAddingToCart}
                className={`w-full py-3 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isAddingToCart 
                    ? 'bg-green-600 text-white' 
                    : product.inStock
                      ? 'bg-[#005BFF] text-white hover:bg-[#0047CC]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Добавлено!
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="w-5 h-5" />
                    {product.inStock ? 'В корзину' : 'Нет в наличии'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Информация о продукте */}
          <div className="p-4">
            {/* Рейтинг и отзывы */}
            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="text-sm font-semibold text-gray-900">{product.rating.toFixed(1)}</span>
                </div>
                {product.reviewCount && product.reviewCount > 0 && (
                  <span className="text-xs text-gray-500">({product.reviewCount})</span>
                )}
              </div>
            )}

            {/* Название */}
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 h-10 group-hover:text-[#005BFF] transition-colors">
              {product.name}
            </h3>

            {/* Размеры (если есть) */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="flex gap-1 mb-2 flex-wrap">
                {product.availableSizes.slice(0, 6).map(size => (
                  <span key={size} className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                    {size}
                  </span>
                ))}
              </div>
            )}

            {/* Цена */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Дополнительная информация */}
            <div className="flex flex-col gap-1.5 text-xs text-gray-600">
              {product.stock && product.stock > 0 && product.stock < 10 && (
                <div className="flex items-center gap-1.5 text-orange-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>Осталось {product.stock} шт</span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5">
                <TruckIcon className="w-4 h-4" />
                <span>Доставка завтра</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <MapPinIcon className="w-4 h-4" />
                <span>В ПВЗ через 2 дня</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  )
}

// Компонент для списочного отображения
function ProductCardList({ product, isFavorite, toggleFavorite, formatPrice, openQuickView, handleQuickAddToCart, isAddingToCart }: any) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="group flex gap-4 bg-white rounded-xl border border-gray-200 hover:border-[#005BFF] hover:shadow-lg transition-all duration-300 overflow-hidden p-4">
        {/* Изображение */}
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
          
          {/* Бейджи */}
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-[#005BFF] text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
              Новинка
            </span>
          )}
        </div>

        {/* Информация */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-[#005BFF] transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {product.description}
            </p>
            
            {/* Рейтинг */}
            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                </div>
                {product.reviewCount && (
                  <span className="text-xs text-gray-500">({product.reviewCount} отзывов)</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Цена */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Действия */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFavorite}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isFavorite ? (
                  <HeartSolid className="w-5 h-5 text-[#CB11AB]" />
                ) : (
                  <HeartOutline className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <button
                onClick={openQuickView}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <EyeIcon className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={handleQuickAddToCart}
                disabled={!product.inStock || isAddingToCart}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  isAddingToCart
                    ? 'bg-green-600 text-white'
                    : product.inStock
                      ? 'bg-[#005BFF] text-white hover:bg-[#0047CC]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {isAddingToCart ? 'Добавлено!' : 'В корзину'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
