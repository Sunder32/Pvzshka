'use client'

import { useState, useMemo } from 'react'
import { Search, Grid as GridIcon, List, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '@/components/catalog/ProductCard'
import { useProductStore } from '@/store/products'

type ViewMode = 'grid' | 'list'
type SortBy = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'new'

const categories = [
  { id: 'all', name: 'Все категории', icon: '🏪' },
  { id: 'electronics', name: 'Электроника', icon: '📱' },
  { id: 'clothing', name: 'Одежда', icon: '👕' },
  { id: 'home', name: 'Для дома', icon: '🏠' },
  { id: 'sports', name: 'Спорт', icon: '⚽' },
  { id: 'beauty', name: 'Красота', icon: '💄' },
  { id: 'toys', name: 'Игрушки', icon: '🧸' },
  { id: 'books', name: 'Книги', icon: '📚' },
  { id: 'food', name: 'Продукты', icon: '🍎' }
]

const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Xiaomi', 'Dyson', 'LEGO', 'Dior', 'Zara']

export default function CatalogPage() {
  const { products } = useProductStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 })
  const [minRating, setMinRating] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('popular')
  const [showFilters, setShowFilters] = useState(false)

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesBrand = selectedBrands.length === 0 || (product.brand && selectedBrands.includes(product.brand))
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max
      const matchesRating = !product.rating || product.rating >= minRating

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating
    })

    // Сортировка
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'new':
        result.reverse()
        break
      default:
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    }

    return result
  }, [products, searchQuery, selectedCategory, selectedBrands, priceRange, minRating, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedBrands([])
    setPriceRange({ min: 0, max: 500000 })
    setMinRating(0)
  }

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    (priceRange.min > 0 || priceRange.max < 500000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Каталог товаров</h1>
          <p className="text-gray-600">Найдено {filteredAndSortedProducts.length} товаров</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Фильтры</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Сбросить ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Категории</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Цена</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">От</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">До</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 500000 }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="500000"
                    />
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Бренды</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Рейтинг</h3>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        minRating === rating
                          ? 'bg-blue-100 text-blue-700 font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-yellow-500">★</span>
                      <span>{rating}+ и выше</span>
                    </button>
                  ))}
                  {minRating > 0 && (
                    <button
                      onClick={() => setMinRating(0)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                    >
                      Любой рейтинг
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Фильтры
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                >
                  <option value="popular">По популярности</option>
                  <option value="price-asc">Цена: по возрастанию</option>
                  <option value="price-desc">Цена: по убыванию</option>
                  <option value="rating">По рейтингу</option>
                  <option value="new">Новинки</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title="Сетка"
                >
                  <GridIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title="Список"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры фильтрации</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Сбросить все фильтры
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredAndSortedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
