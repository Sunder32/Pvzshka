'use client'

import { use, useState } from 'react'
import { useProductStore } from '@/store/products'
import { useCartStore } from '@/store/cart'
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { products } = useProductStore()
  const { addItem } = useCartStore()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const product = products.find(p => p.id === id)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Товар не найден</h1>
        <Link href="/catalog" className="text-blue-600 hover:text-blue-700">
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `${product.id}-${Date.now()}-${i}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0]
      })
    }
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Главная</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-blue-600">Каталог</Link>
            <span>/</span>
            <Link href={`/catalog?category=${product.category}`} className="hover:text-blue-600">
              {product.categoryName || product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Назад
        </button>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div>
            <div className="bg-white rounded-xl overflow-hidden mb-4 aspect-square flex items-center justify-center">
              <div className="text-8xl">
                {product.category === 'electronics' && '📱'}
                {product.category === 'clothing' && '👕'}
                {product.category === 'home' && '🏠'}
                {product.category === 'sports' && '⚽'}
                {product.category === 'beauty' && '💄'}
                {product.category === 'toys' && '🧸'}
                {product.category === 'books' && '📚'}
                {product.category === 'food' && '🍎'}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {product.brand && (
                <div className="text-blue-600 font-semibold mb-2">{product.brand}</div>
              )}
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
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
                  <span className="ml-2 text-gray-600">
                    {product.rating?.toFixed(1)} ({product.reviewCount} отзывов)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 mb-6">
              <div className="flex items-baseline gap-4 mb-2">
                <div className="text-4xl font-bold">₽{product.price.toLocaleString()}</div>
                {product.oldPrice && (
                  <>
                    <div className="text-2xl text-gray-400 line-through">
                      ₽{product.oldPrice.toLocaleString()}
                    </div>
                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      −{product.discount}%
                    </div>
                  </>
                )}
              </div>
              {product.stock && product.stock > 0 ? (
                <div className="text-green-600 font-semibold">В наличии: {product.stock} шт</div>
              ) : (
                <div className="text-red-600 font-semibold">Нет в наличии</div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Описание</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {product.inStock && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Количество:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-semibold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock || 999, parseInt(e.target.value) || 1)))}
                      className="w-20 h-10 text-center border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    В корзину
                  </button>
                  <button className="w-14 h-14 rounded-xl border-2 border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="w-14 h-14 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Быстрая доставка</div>
                  <div className="text-xs text-gray-600">От 1 дня в пункт выдачи</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Гарантия</div>
                  <div className="text-xs text-gray-600">Официальная гарантия</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Возврат 14 дней</div>
                  <div className="text-xs text-gray-600">Без лишних вопросов</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">Похожие товары</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relProduct => (
                <Link
                  key={relProduct.id}
                  href={`/product/${relProduct.id}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-4xl">
                    {relProduct.category === 'electronics' && '📱'}
                    {relProduct.category === 'clothing' && '👕'}
                    {relProduct.category === 'home' && '🏠'}
                    {relProduct.category === 'sports' && '⚽'}
                    {relProduct.category === 'beauty' && '💄'}
                    {relProduct.category === 'toys' && '🧸'}
                    {relProduct.category === 'books' && '📚'}
                    {relProduct.category === 'food' && '🍎'}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{relProduct.name}</h3>
                    <div className="text-xl font-bold text-blue-600">
                      ₽{relProduct.price.toLocaleString()}
                    </div>
                    {relProduct.rating && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {relProduct.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
