'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { debounce } from '@/lib/utils'

interface SearchSuggestion {
  id: string
  type: 'product' | 'category' | 'brand'
  title: string
  subtitle?: string
  image?: string
  category?: string
  price?: number
}

export default function SmartSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trending, setTrending] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Загрузка истории поиска из localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentSearches')
    if (recent) {
      setRecentSearches(JSON.parse(recent).slice(0, 5))
    }

    // Загрузка популярных запросов
    fetchTrendingSearches()
  }, [])

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchTrendingSearches = async () => {
    try {
      // Mock данные - заменить на API
      setTrending([
        'iPhone 15 Pro',
        'Наушники AirPods',
        'Ноутбук MacBook',
        'Умные часы',
        'Беспроводная мышь'
      ])
    } catch (error) {
      console.error('Error fetching trending:', error)
    }
  }

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      // TODO: Заменить на реальный API запрос
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          type: 'product',
          title: `${searchQuery} iPhone 15 Pro`,
          subtitle: 'Смартфоны',
          image: '/products/iphone.jpg',
          price: 89990
        },
        {
          id: '2',
          type: 'category',
          title: `${searchQuery} в категории Электроника`,
          subtitle: '1234 товара'
        },
        {
          id: '3',
          type: 'brand',
          title: `Бренд: ${searchQuery}`,
          subtitle: '567 товаров'
        }
      ]

      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced поиск с задержкой 300ms
  const debouncedFetch = useCallback(
    debounce((value: string) => fetchSuggestions(value), 300),
    []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedFetch(value)
  }

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Сохранить в историю
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))

    // Переход на страницу результатов
    router.push(`/catalog?q=${encodeURIComponent(searchQuery)}`)
    setIsOpen(false)
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/catalog/${suggestion.id}`)
    } else {
      handleSearch(suggestion.title)
    }
  }

  const clearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const removeRecentItem = (item: string) => {
    const updated = recentSearches.filter(s => s !== item)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Поле ввода */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Поиск товаров, брендов, категорий..."
            className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown с результатами */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
          {/* Результаты поиска */}
          {query && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2 font-medium">Результаты</div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  {suggestion.image && (
                    <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded">
                      <Image
                        src={suggestion.image}
                        alt={suggestion.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  {!suggestion.image && (
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {highlightQuery(suggestion.title, query)}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-gray-500">{suggestion.subtitle}</div>
                    )}
                  </div>
                  {suggestion.price && (
                    <div className="text-sm font-semibold text-gray-900">
                      {suggestion.price.toLocaleString()} ₽
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* История поиска */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs text-gray-500 font-medium">Недавние запросы</div>
                <button
                  onClick={clearRecent}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Очистить
                </button>
              </div>
              {recentSearches.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg group"
                >
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <button
                    onClick={() => handleSearch(item)}
                    className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900"
                  >
                    {item}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRecentItem(item)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Популярные запросы */}
          {!query && trending.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2 font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Популярные запросы
              </div>
              {trending.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(item)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                >
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {item}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Пустое состояние при поиске */}
          {query && !loading && suggestions.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Ничего не найдено по запросу "{query}"</p>
              <p className="text-gray-400 text-xs mt-1">Попробуйте изменить запрос</p>
            </div>
          )}

          {/* Загрузка */}
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-3">Поиск...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Утилита для подсветки совпадений
function highlightQuery(text: string, query: string) {
  if (!query) return text

  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}
