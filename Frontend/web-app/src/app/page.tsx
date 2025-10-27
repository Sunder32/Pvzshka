'use client'

import Link from 'next/link'
import { ShoppingBag, TrendingUp, Zap, Shield, Truck } from 'lucide-react'
import ProductCard from '@/components/catalog/ProductCard'
import { useProductStore } from '@/store/products'
import { useCartStore } from '@/store/cart'
import { useEffect } from 'react'

export default function HomePage() {
  const { products, fetchProducts } = useProductStore()
  const { loadCart } = useCartStore()

  useEffect(() => {
    fetchProducts()
    loadCart()
  }, [fetchProducts, loadCart])

  const featuredProducts = products.slice(0, 6)
  const categories = [
    {
      id: 'electronics',
      name: 'Электроника',
      icon: '📱',
      count: 245,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'clothing',
      name: 'Одежда',
      icon: '👕',
      count: 532,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'home',
      name: 'Для дома',
      icon: '🏠',
      count: 189,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'sports',
      name: 'Спорт',
      icon: '⚽',
      count: 156,
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'beauty',
      name: 'Красота',
      icon: '💄',
      count: 312,
      color: 'from-purple-500 to-fuchsia-500'
    },
    {
      id: 'toys',
      name: 'Игрушки',
      icon: '🧸',
      count: 278,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'books',
      name: 'Книги',
      icon: '📚',
      count: 891,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'food',
      name: 'Продукты',
      icon: '🍎',
      count: 425,
      color: 'from-red-500 to-pink-500'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Покупайте с умом,<br />доставляйте с комфортом
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Тысячи товаров с доставкой в удобные пункты выдачи по всей России
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/catalog"
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Перейти в каталог
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Узнать больше
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-square rounded-2xl bg-white/10 backdrop-blur-sm p-8">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="bg-white/20 rounded-xl backdrop-blur-sm"></div>
                  <div className="bg-white/20 rounded-xl backdrop-blur-sm"></div>
                  <div className="bg-white/20 rounded-xl backdrop-blur-sm"></div>
                  <div className="bg-white/20 rounded-xl backdrop-blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Бесплатная доставка</h3>
                <p className="text-sm text-gray-600">При заказе от 3000 ₽</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Гарантия качества</h3>
                <p className="text-sm text-gray-600">Только оригинальные товары</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Быстрая доставка</h3>
                <p className="text-sm text-gray-600">От 1 дня в пункт выдачи</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Выгодные цены</h3>
                <p className="text-sm text-gray-600">Регулярные акции и скидки</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Популярные категории</h2>
            <Link href="/catalog" className="text-blue-600 hover:text-blue-700 font-semibold">
              Все категории →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?category=${category.id}`}
                className={`group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br ${category.color}`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-1 text-center">
                    {category.name}
                  </h3>
                  <p className="text-sm text-white/90">{category.count} товаров</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Популярные товары</h2>
              <p className="text-gray-600">Самые покупаемые товары этого месяца</p>
            </div>
            <Link href="/catalog" className="text-blue-600 hover:text-blue-700 font-semibold">
              Смотреть все →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} viewMode="grid" />
            ))}
          </div>
        </div>
      </section>

      {/* Hot Deals */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                🔥 Горячие предложения
              </h2>
              <p className="text-gray-600">Специальные цены только сегодня</p>
            </div>
            <Link href="/catalog?filter=discounted" className="text-red-600 hover:text-red-700 font-semibold">
              Все акции →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.filter(p => p.discount).slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} viewMode="grid" />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Подпишитесь на рассылку</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Получайте первыми информацию о новинках, акциях и специальных предложениях
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Ваш email"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Подписаться
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Marketplace</h3>
              <p className="text-sm">
                Современный маркетплейс с удобной доставкой в пункты выдачи по всей России
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Покупателям</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/catalog" className="hover:text-white">Каталог</Link></li>
                <li><Link href="/about" className="hover:text-white">О компании</Link></li>
                <li><Link href="/delivery" className="hover:text-white">Доставка</Link></li>
                <li><Link href="/returns" className="hover:text-white">Возврат товара</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Продавцам</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/seller" className="hover:text-white">Начать продавать</Link></li>
                <li><Link href="/seller/pricing" className="hover:text-white">Тарифы</Link></li>
                <li><Link href="/seller/help" className="hover:text-white">Помощь продавцам</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 8 (800) 555-35-35</li>
                <li>📧 support@marketplace.ru</li>
                <li>📍 Москва, ул. Примерная, 123</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Marketplace. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
