'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Share2, Star, Truck, ShieldCheck, RotateCcw, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useProductStore } from '@/store/products'
import ProductReviews from '@/components/product/ProductReviews'
import RelatedProducts from '@/components/product/RelatedProducts'

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  
  const { products } = useProductStore()
  const { addItem } = useCartStore()
  
  const product = products.find(p => p.id === productId)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
        <Link href="/catalog" className="text-blue-600 hover:underline">
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[0] || '/placeholder.jpg'
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Ссылка скопирована в буфер обмена')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-blue-600">Главная</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/catalog" className="text-gray-600 hover:text-blue-600">Каталог</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/catalog?category=${product.category}`} className="text-gray-600 hover:text-blue-600">
              {product.categoryName || product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg p-6 mb-8">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={product.images?.[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
              {product.discount && (
                <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg text-lg font-semibold">
                  -{product.discount}%
                </span>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
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
                {product.sku && (
                  <p className="text-sm text-gray-500">Артикул: {product.sku}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-lg border ${
                    isFavorite ? 'bg-red-50 border-red-500 text-red-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-lg border hover:bg-gray-50"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-blue-600">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {product.oldPrice.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
              {product.oldPrice && (
                <p className="text-sm text-green-600">
                  Вы экономите {(product.oldPrice - product.price).toLocaleString('ru-RU')} ₽
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <p className="text-green-600 font-semibold">✓ В наличии {product.stock && `(${product.stock} шт.)`}</p>
              ) : (
                <p className="text-red-600 font-semibold">Нет в наличии</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Количество:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border rounded-lg hover:bg-gray-50 flex items-center justify-center text-xl font-semibold"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 border rounded-lg text-center"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border rounded-lg hover:bg-gray-50 flex items-center justify-center text-xl font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 text-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
            >
              <ShoppingCart className="w-6 h-6" />
              Добавить в корзину
            </button>

            <button className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
              Купить в 1 клик
            </button>

            {/* Features */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Бесплатная доставка от 3000 ₽</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                <span>Возврат в течение 14 дней</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Гарантия производителя</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg mb-8">
          <div className="border-b">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === 'description'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                Описание
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === 'specifications'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                Характеристики
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                Отзывы ({product.reviewCount || 0})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                <h3 className="text-xl font-semibold mt-6 mb-3">Особенности</h3>
                <ul className="space-y-2">
                  <li>Высокое качество материалов</li>
                  <li>Современный дизайн</li>
                  <li>Удобство использования</li>
                  <li>Длительный срок службы</li>
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Бренд</span>
                    <span className="font-semibold">{product.brand || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Артикул</span>
                    <span className="font-semibold">{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Категория</span>
                    <span className="font-semibold">{product.categoryName || product.category}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} />
            )}
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts currentProductId={product.id} category={product.category} />
      </div>
    </div>
  )
}
