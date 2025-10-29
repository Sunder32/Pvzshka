import React, { useState, useRef, useEffect } from 'react'
import { XMarkIcon, HomeIcon, MagnifyingGlassIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/router'

/**
 * MobileBottomNav - Нижняя навигация для мобильных устройств
 * 
 * Особенности:
 * - Фиксированная позиция снизу
 * - Активная вкладка подсвечивается
 * - Smooth переходы
 * - Badge для уведомлений
 */
export function MobileBottomNav() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')

  const tabs = [
    { id: 'home', label: 'Главная', icon: HomeIcon, href: '/' },
    { id: 'catalog', label: 'Каталог', icon: MagnifyingGlassIcon, href: '/catalog' },
    { id: 'favorites', label: 'Избранное', icon: HeartIcon, href: '/favorites', badge: 3 },
    { id: 'profile', label: 'Профиль', icon: UserIcon, href: '/profile' },
  ]

  useEffect(() => {
    const currentTab = tabs.find(tab => router.pathname === tab.href)
    if (currentTab) setActiveTab(currentTab.id)
  }, [router.pathname])

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-[#005BFF]' : 'text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#CB11AB] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/**
 * SwipeableDrawer - Выдвижная панель с поддержкой жестов
 */
interface SwipeableDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  position?: 'left' | 'right' | 'bottom'
}

export function SwipeableDrawer({
  isOpen,
  onClose,
  children,
  position = 'bottom',
}: SwipeableDrawerProps) {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    startY.current = e.touches[0].clientY
    startX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    if (position === 'bottom') {
      const deltaY = e.touches[0].clientY - startY.current
      if (deltaY > 0) {
        setOffset(deltaY)
      }
    } else if (position === 'left') {
      const deltaX = e.touches[0].clientX - startX.current
      if (deltaX < 0) {
        setOffset(Math.abs(deltaX))
      }
    } else if (position === 'right') {
      const deltaX = e.touches[0].clientX - startX.current
      if (deltaX > 0) {
        setOffset(deltaX)
      }
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    // Если свайп больше 100px - закрываем
    if (offset > 100) {
      onClose()
    }
    setOffset(0)
  }

  const positionClasses = {
    bottom: `bottom-0 left-0 right-0 rounded-t-3xl ${isOpen ? 'translate-y-0' : 'translate-y-full'}`,
    left: `left-0 top-0 bottom-0 rounded-r-3xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`,
    right: `right-0 top-0 bottom-0 rounded-l-3xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`,
  }

  const transformStyle = position === 'bottom' 
    ? { transform: `translateY(${offset}px)` }
    : position === 'left'
      ? { transform: `translateX(-${offset}px)` }
      : { transform: `translateX(${offset}px)` }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bg-white shadow-2xl z-50 transition-transform duration-300 ${positionClasses[position]}`}
        style={isDragging ? transformStyle : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        {position === 'bottom' && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {children}
      </div>
    </>
  )
}

/**
 * PullToRefresh - Потянуть для обновления
 */
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop !== 0 || isRefreshing) return

    const deltaY = e.touches[0].clientY - startY.current
    if (deltaY > 0) {
      setPullDistance(Math.min(deltaY, threshold * 1.5))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullDistance(0)
  }

  const pullProgress = Math.min((pullDistance / threshold) * 100, 100)

  return (
    <div className="relative overflow-hidden">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
        style={{
          height: `${pullDistance}px`,
          opacity: pullProgress / 100,
        }}
      >
        {isRefreshing ? (
          <svg className="animate-spin h-6 w-6 text-[#005BFF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-[#005BFF] transition-transform"
            style={{ transform: `rotate(${pullProgress * 3.6}deg)` }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing ? 'transform 0.2s' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * MobileSearchOverlay - Полноэкранный поиск для мобильных
 */
interface MobileSearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <button onClick={onClose} className="p-2">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск товаров..."
          className="flex-1 text-lg outline-none"
        />
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {query ? (
          <div>
            <p className="text-gray-600">Результаты для "{query}"</p>
            {/* Результаты поиска */}
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-3">Популярные запросы</h3>
            <div className="flex flex-wrap gap-2">
              {['iPhone', 'Наушники', 'Ноутбук', 'Телевизор'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * InstallPWA - Кнопка установки PWA
 */
export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  if (!showInstall) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-[#005BFF] text-white rounded-xl p-4 shadow-2xl z-40 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-[#005BFF]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">Установить приложение</h3>
          <p className="text-sm text-white/90 mb-3">
            Добавьте на главный экран для быстрого доступа
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-[#005BFF] rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Установить
            </button>
            <button
              onClick={() => setShowInstall(false)}
              className="px-4 py-2 bg-white/20 rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
