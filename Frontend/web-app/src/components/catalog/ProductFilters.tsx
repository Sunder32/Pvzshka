'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useProductStore } from '@/store/products'

const categories = [
  { id: 'electronics', name: 'Электроника', count: 245 },
  { id: 'clothing', name: 'Одежда', count: 532 },
  { id: 'home', name: 'Для дома', count: 189 },
  { id: 'sports', name: 'Спорт', count: 156 },
  { id: 'books', name: 'Книги', count: 423 },
  { id: 'toys', name: 'Игрушки', count: 278 },
  { id: 'beauty', name: 'Красота', count: 334 },
  { id: 'food', name: 'Продукты', count: 567 },
]

const brands = [
  'Apple', 'Samsung', 'Xiaomi', 'LG', 'Sony', 'Nike', 'Adidas', 'Puma'
]

export default function ProductFilters() {
  const { filters, setFilters } = useProductStore()
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    brand: true,
    rating: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value)
    setFilters({
      ...filters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Фильтры</h2>

      {/* Categories */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Категории</span>
          {expandedSections.category ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.category && (
          <div className="space-y-2">
            {categories.map(category => (
              <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.category === category.id}
                  onChange={(e) => setFilters({ ...filters, category: e.target.checked ? category.id : undefined })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm flex-1">{category.name}</span>
                <span className="text-xs text-gray-500">{category.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Цена</span>
          {expandedSections.price ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="От"
                value={filters.minPrice || ''}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="До"
                value={filters.maxPrice || ''}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="space-y-2">
              {[
                { label: 'До 1000 ₽', min: 0, max: 1000 },
                { label: '1000 - 5000 ₽', min: 1000, max: 5000 },
                { label: '5000 - 10000 ₽', min: 5000, max: 10000 },
                { label: '10000 - 50000 ₽', min: 10000, max: 50000 },
                { label: 'Более 50000 ₽', min: 50000, max: undefined },
              ].map((range, index) => (
                <button
                  key={index}
                  onClick={() => setFilters({ ...filters, minPrice: range.min, maxPrice: range.max })}
                  className="w-full text-left text-sm px-3 py-2 hover:bg-gray-50 rounded"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Бренд</span>
          {expandedSections.brand ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.brand && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={filters.brands?.includes(brand)}
                  onChange={(e) => {
                    const newBrands = e.target.checked
                      ? [...(filters.brands || []), brand]
                      : (filters.brands || []).filter((b: string) => b !== brand)
                    setFilters({ ...filters, brands: newBrands })
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-medium">Рейтинг</span>
          {expandedSections.rating ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === rating}
                  onChange={() => setFilters({ ...filters, minRating: rating })}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm flex items-center gap-1">
                  {[...Array(rating)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                  и выше
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => setFilters({})}
        className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
      >
        Сбросить фильтры
      </button>
    </div>
  )
}
