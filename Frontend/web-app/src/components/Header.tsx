'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User, Search, ShoppingBag, Heart, MapPin } from 'lucide-react'
import Cart from './Cart'
import SmartSearch from './search/SmartSearch'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items } = useCartStore()

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center gap-6">
              <Link href="/delivery" className="flex items-center gap-1 hover:text-blue-100 transition-colors">
                <MapPin className="w-4 h-4" />
                <span>Пункты выдачи</span>
              </Link>
              <Link href="/about" className="hover:text-blue-100 transition-colors">
                О компании
              </Link>
              <Link href="/help" className="hover:text-blue-100 transition-colors">
                Помощь
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span>📞 8 (800) 555-35-35</span>
              <span className="text-blue-200">|</span>
              <span>Бесплатная доставка от 3000 ₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="hidden md:block">
              <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Marketplace
              </div>
              <div className="text-xs text-gray-500">Миллион товаров для вас</div>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <SmartSearch />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Search className="w-6 h-6 text-gray-700" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Heart className="w-6 h-6 text-gray-700" />
              <span className="text-sm font-medium">Избранное</span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-xl transition-colors group"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-xs text-gray-500">Корзина</div>
                <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {totalItems} товара
                </div>
              </div>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs text-gray-500">Привет</div>
                    <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border py-2 hidden group-hover:block">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold">Личный кабинет</div>
                    <div className="text-sm text-gray-500">Настройки профиля</div>
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold">Мои заказы</div>
                    <div className="text-sm text-gray-500">История покупок</div>
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold">Избранное</div>
                    <div className="text-sm text-gray-500">Сохранённые товары</div>
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition-colors font-semibold"
                  >
                    Выйти
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">Войти</span>
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Category Navigation */}
        <nav className="hidden md:flex items-center gap-1 pb-4 overflow-x-auto">
          {[
            { name: 'Электроника', icon: '📱', href: '/catalog?category=electronics' },
            { name: 'Одежда', icon: '👕', href: '/catalog?category=clothing' },
            { name: 'Для дома', icon: '🏠', href: '/catalog?category=home' },
            { name: 'Спорт', icon: '⚽', href: '/catalog?category=sports' },
            { name: 'Красота', icon: '💄', href: '/catalog?category=beauty' },
            { name: 'Игрушки', icon: '🧸', href: '/catalog?category=toys' },
            { name: 'Книги', icon: '📚', href: '/catalog?category=books' },
            { name: 'Продукты', icon: '🍎', href: '/catalog?category=food' },
          ].map(cat => (
            <Link
              key={cat.name}
              href={cat.href}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              href="/catalog"
              className="block px-4 py-3 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Каталог
            </Link>
            <Link
              href="/delivery"
              className="block px-4 py-3 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Доставка
            </Link>
            <Link
              href="/about"
              className="block px-4 py-3 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              О нас
            </Link>
            <Link
              href="/help"
              className="block px-4 py-3 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Помощь
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
