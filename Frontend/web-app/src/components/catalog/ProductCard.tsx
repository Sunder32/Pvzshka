'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
  viewMode: 'grid' | 'list'
}

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { addItem } = useCartStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '/placeholder.jpg'
    })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsFavorite(!isFavorite)
  }

  if (viewMode === 'list') {
    return (
      <Link href={`/catalog/${product.id}`} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex gap-4 p-4">
          <div className="relative w-48 h-48 flex-shrink-0">
            <Image
              src={product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating?.toFixed(1)} ({product.reviewCount || 0} отзывов)
              </span>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
            <div className="mt-auto flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{product.price.toLocaleString('ru-RU')} ₽</p>
                {product.oldPrice && (
                  <p className="text-sm text-gray-500 line-through">{product.oldPrice.toLocaleString('ru-RU')} ₽</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-lg border ${isFavorite ? 'bg-red-50 border-red-500 text-red-500' : 'hover:bg-gray-50'}`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  В корзину
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/product/${product.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group border border-gray-100">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-purple-50 transition-all">
        <div className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform">
          {product.category === 'electronics' && '📱'}
          {product.category === 'clothing' && '👕'}
          {product.category === 'home' && '🏠'}
          {product.category === 'sports' && '⚽'}
          {product.category === 'beauty' && '💄'}
          {product.category === 'toys' && '🧸'}
          {product.category === 'books' && '📚'}
          {product.category === 'food' && '🍎'}
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount && product.discount > 0 && (
            <div className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
              −{product.discount}%
            </div>
          )}
          {product.inStock === false && (
            <div className="px-3 py-1 bg-gray-800 text-white text-sm font-bold rounded-full">
              Нет в наличии
            </div>
          )}
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <div className="text-xs font-semibold text-blue-600 mb-1">{product.brand}</div>
        )}
        
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {product.rating.toFixed(1)}
            </span>
            {product.reviewCount && (
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₽{product.price.toLocaleString('ru-RU')}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₽{product.oldPrice.toLocaleString('ru-RU')}
              </span>
            )}
          </div>
        </div>

        {/* Stock */}
        {product.stock !== undefined && product.stock > 0 && (
          <div className="text-xs text-green-600 mb-3">
            ✓ В наличии: {product.stock} шт
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.inStock === false}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:shadow-lg"
        >
          <ShoppingCart className="w-4 h-4" />
          {product.inStock === false ? 'Нет в наличии' : 'В корзину'}
        </button>
      </div>
    </Link>
  )
}
