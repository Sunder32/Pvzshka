import React, { useState, useMemo } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import ProductCard from './ProductCard'
import { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  columns?: number
  gap?: number
  cardHeight?: number
  useVirtualization?: boolean
  onCompare?: (productId: string) => void
  compareList?: string[]
  layout?: 'grid' | 'list'
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'new' | 'popular'
  className?: string
}

/**
 * ProductGrid - Оптимизированная сетка товаров с виртуализацией
 * 
 * Особенности:
 * - Виртуализация для больших списков (react-window)
 * - Адаптивное количество колонок
 * - Поддержка сортировки
 * - Layout: grid/list
 * - Сравнение товаров
 */
export default function ProductGrid({
  products,
  columns = 4,
  gap = 16,
  cardHeight = 450,
  useVirtualization = true,
  onCompare,
  compareList = [],
  layout = 'grid',
  sortBy,
  className = '',
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout)

  // Сортировка продуктов
  const sortedProducts = useMemo(() => {
    let sorted = [...products]

    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'new':
        sorted.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1
          if (!a.isNew && b.isNew) return 1
          return 0
        })
        break
      case 'popular':
        sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        break
      default:
        break
    }

    return sorted
  }, [products, sortBy])

  // Для маленьких списков (<50) или list view - обычный рендеринг
  if (!useVirtualization || sortedProducts.length < 50 || viewMode === 'list') {
    return (
      <div className={className}>
        {viewMode === 'grid' ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: `${gap}px`,
            }}
          >
            {sortedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < columns * 2} // Приоритет для первых 2 рядов
                onCompare={onCompare}
                isInCompare={compareList.includes(product.id)}
                layout="grid"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCompare={onCompare}
                isInCompare={compareList.includes(product.id)}
                layout="list"
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Виртуализированная сетка для больших списков
  const columnCount = columns
  const rowCount = Math.ceil(sortedProducts.length / columnCount)
  const columnWidth = typeof window !== 'undefined' 
    ? (window.innerWidth - gap * (columnCount + 1)) / columnCount 
    : 300

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex
    const product = sortedProducts[index]

    if (!product) return null

    return (
      <div style={{
        ...style,
        padding: `${gap / 2}px`,
      }}>
        <ProductCard
          product={product}
          priority={index < columnCount * 2}
          onCompare={onCompare}
          isInCompare={compareList.includes(product.id)}
          layout="grid"
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {typeof window !== 'undefined' && (
        <Grid
          columnCount={columnCount}
          columnWidth={columnWidth}
          height={600} // Высота viewport
          rowCount={rowCount}
          rowHeight={cardHeight}
          width={window.innerWidth - 64} // Отступы по бокам
        >
          {Cell}
        </Grid>
      )}
    </div>
  )
}

/**
 * ProductGridSkeleton - Skeleton loader для ProductGrid
 */
interface ProductGridSkeletonProps {
  columns?: number
  rows?: number
  gap?: number
}

export function ProductGridSkeleton({
  columns = 4,
  rows = 3,
  gap = 16,
}: ProductGridSkeletonProps) {
  return (
    <div
      className="grid animate-pulse"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: columns * rows }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {/* Skeleton Image */}
          <div className="aspect-square bg-gray-200" />

          {/* Skeleton Content */}
          <div className="p-4 space-y-3">
            {/* Rating */}
            <div className="h-4 bg-gray-200 rounded w-20" />

            {/* Title */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>

            {/* Price */}
            <div className="h-6 bg-gray-200 rounded w-24" />

            {/* Info */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * ProductGridHeader - Заголовок с сортировкой и переключением view
 */
interface ProductGridHeaderProps {
  total: number
  currentSort?: string
  onSortChange?: (sort: string) => void
  layout?: 'grid' | 'list'
  onLayoutChange?: (layout: 'grid' | 'list') => void
  showFilters?: boolean
  onToggleFilters?: () => void
}

export function ProductGridHeader({
  total,
  currentSort = 'popular',
  onSortChange,
  layout = 'grid',
  onLayoutChange,
  showFilters = false,
  onToggleFilters,
}: ProductGridHeaderProps) {
  const sortOptions = [
    { value: 'popular', label: 'Популярные' },
    { value: 'new', label: 'Новинки' },
    { value: 'price-asc', label: 'Цена: низкая → высокая' },
    { value: 'price-desc', label: 'Цена: высокая → низкая' },
    { value: 'rating', label: 'По рейтингу' },
  ]

  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Найдено: <span className="text-[#005BFF]">{total.toLocaleString('ru-RU')}</span> товаров
        </h2>

        {onToggleFilters && (
          <button
            onClick={onToggleFilters}
            className="lg:hidden px-4 py-2 bg-gray-100 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            {showFilters ? '✕ Скрыть фильтры' : '☰ Фильтры'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Сортировка */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Сортировка:</span>
          <select
            value={currentSort}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium 
                     focus:outline-none focus:ring-2 focus:ring-[#005BFF] focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Переключение layout */}
        {onLayoutChange && (
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onLayoutChange('grid')}
              className={`p-2 rounded transition-colors ${
                layout === 'grid'
                  ? 'bg-white text-[#005BFF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Сетка"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onLayoutChange('list')}
              className={`p-2 rounded transition-colors ${
                layout === 'list'
                  ? 'bg-white text-[#005BFF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Список"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
