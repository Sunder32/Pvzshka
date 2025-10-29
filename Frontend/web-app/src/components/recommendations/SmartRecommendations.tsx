import React, { useEffect, useState } from 'react'
import { Product } from '@/types'
import ProductCard from '../product/ProductCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface RecommendationsProps {
  userId?: string
  currentProductId?: string
  categoryId?: string
  maxItems?: number
  title?: string
  algorithm?: 'collaborative' | 'content-based' | 'hybrid' | 'trending' | 'personalized'
  autoPlay?: boolean
}

/**
 * SmartRecommendations - Компонент умных рекомендаций на основе ML
 * 
 * Алгоритмы:
 * - collaborative: Коллаборативная фильтрация (как на Amazon)
 * - content-based: На основе содержания (похожие товары)
 * - hybrid: Гибридный подход
 * - trending: Популярные товары
 * - personalized: Персонализированные на основе истории
 * 
 * Особенности:
 * - Адаптивная карусель (Swiper)
 * - Lazy loading изображений
 * - A/B тестирование алгоритмов
 * - Метрики кликов для оптимизации
 */
export default function SmartRecommendations({
  userId,
  currentProductId,
  categoryId,
  maxItems = 12,
  title,
  algorithm = 'hybrid',
  autoPlay = false,
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [userId, currentProductId, categoryId, algorithm])

  const fetchRecommendations = async () => {
    setIsLoading(true)
    
    try {
      // В реальности - запрос к ML API
      // const response = await fetch('/api/recommendations', {
      //   method: 'POST',
      //   body: JSON.stringify({ userId, currentProductId, categoryId, algorithm, maxItems })
      // })
      // const data = await response.json()
      
      // Мок-данные для демонстрации
      const mockProducts: Product[] = [
        {
          id: `rec-${Math.random()}`,
          name: 'Рекомендованный товар 1',
          description: 'Подобран специально для вас',
          price: 1999,
          compareAtPrice: 2999,
          images: ['/placeholder-product.jpg'],
          category: categoryId || 'electronics',
          inStock: true,
          rating: 4.5,
          reviewCount: 128,
          isNew: true,
        },
        // ... больше продуктов
      ]

      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 500))
      setRecommendations(mockProducts)
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Трекинг кликов для оптимизации ML
  const trackClick = (productId: string, position: number) => {
    // Отправка метрики
    // analytics.track('recommendation_click', {
    //   userId,
    //   productId,
    //   algorithm,
    //   position,
    //   timestamp: new Date().toISOString()
    // })
    console.log('Recommendation clicked:', { productId, position, algorithm })
  }

  const getTitleByAlgorithm = () => {
    if (title) return title

    const titles = {
      collaborative: '👥 Покупатели также смотрят',
      'content-based': '🔍 Похожие товары',
      hybrid: '⭐ Рекомендуем для вас',
      trending: '🔥 Популярное сейчас',
      personalized: '✨ Специально для вас',
    }

    return titles[algorithm] || 'Вам может понравиться'
  }

  if (isLoading) {
    return <RecommendationsSkeleton title={getTitleByAlgorithm()} />
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{getTitleByAlgorithm()}</h2>
        <button className="text-[#005BFF] font-semibold hover:underline">
          Смотреть все →
        </button>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={16}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={autoPlay ? { delay: 3000, disableOnInteraction: false } : false}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="recommendations-swiper"
      >
        {recommendations.map((product, index) => (
          <SwiperSlide key={product.id}>
            <div onClick={() => trackClick(product.id, index)}>
              <ProductCard product={product} priority={index < 4} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

/**
 * PersonalizedHomepage - Персонализированная главная страница
 */
export function PersonalizedHomepage({ userId }: { userId?: string }) {
  return (
    <div className="space-y-12">
      {/* Продолжить покупки */}
      {userId && (
        <SmartRecommendations
          userId={userId}
          title="🛒 Продолжить покупки"
          algorithm="personalized"
          maxItems={8}
        />
      )}

      {/* Популярное */}
      <SmartRecommendations
        title="🔥 Популярное сейчас"
        algorithm="trending"
        maxItems={12}
        autoPlay
      />

      {/* На основе истории */}
      {userId && (
        <SmartRecommendations
          userId={userId}
          title="✨ Подобрано для вас"
          algorithm="hybrid"
          maxItems={10}
        />
      )}

      {/* Новинки в любимых категориях */}
      {userId && (
        <SmartRecommendations
          userId={userId}
          title="🎁 Новинки в любимых категориях"
          algorithm="content-based"
          maxItems={10}
        />
      )}
    </div>
  )
}

/**
 * RecommendationsSkeleton - Skeleton loader
 */
function RecommendationsSkeleton({ title }: { title: string }) {
  return (
    <section className="py-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * ViewedHistory - История просмотров
 */
interface ViewedHistoryProps {
  userId: string
  maxItems?: number
}

export function ViewedHistory({ userId, maxItems = 10 }: ViewedHistoryProps) {
  const [viewedProducts, setViewedProducts] = useState<Product[]>([])

  useEffect(() => {
    // Загрузка из localStorage или API
    const history = localStorage.getItem(`viewed_history_${userId}`)
    if (history) {
      const productIds = JSON.parse(history)
      // Fetch products by IDs
      // setViewedProducts(fetchedProducts)
    }
  }, [userId])

  if (viewedProducts.length === 0) return null

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">👁️ Вы смотрели</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {viewedProducts.slice(0, maxItems).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

/**
 * CategoryTrends - Тренды в категории
 */
interface CategoryTrendsProps {
  categoryId: string
  categoryName: string
  maxItems?: number
}

export function CategoryTrends({ categoryId, categoryName, maxItems = 8 }: CategoryTrendsProps) {
  return (
    <SmartRecommendations
      categoryId={categoryId}
      title={`📊 Популярное в категории "${categoryName}"`}
      algorithm="trending"
      maxItems={maxItems}
    />
  )
}

/**
 * CrossSell - Кросс-селл для страницы товара
 */
interface CrossSellProps {
  productId: string
  maxItems?: number
}

export function CrossSell({ productId, maxItems = 6 }: CrossSellProps) {
  return (
    <SmartRecommendations
      currentProductId={productId}
      title="🛍️ С этим товаром покупают"
      algorithm="collaborative"
      maxItems={maxItems}
    />
  )
}

/**
 * UpSell - Апселл (более дорогие альтернативы)
 */
interface UpSellProps {
  productId: string
  maxItems?: number
}

export function UpSell({ productId, maxItems = 4 }: UpSellProps) {
  return (
    <SmartRecommendations
      currentProductId={productId}
      title="⬆️ Более продвинутые модели"
      algorithm="content-based"
      maxItems={maxItems}
    />
  )
}
