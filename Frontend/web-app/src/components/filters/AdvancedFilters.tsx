'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/Slider'
import { Checkbox } from '@/components/ui/Checkbox'
import { ChevronDown, ChevronUp, X, Search } from 'lucide-react'

interface FilterOption {
  id: string
  label: string
  count?: number
  color?: string
}

interface FilterCategory {
  id: string
  name: string
  type: 'checkbox' | 'range' | 'color' | 'size'
  options?: FilterOption[]
  min?: number
  max?: number
  defaultExpanded?: boolean
}

interface AdvancedFiltersProps {
  categories: FilterCategory[]
  onFilterChange: (filters: Record<string, any>) => void
  activeFilters: Record<string, any>
}

export default function AdvancedFilters({
  categories,
  onFilterChange,
  activeFilters
}: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(activeFilters)

  useEffect(() => {
    // Разворачиваем секции по умолчанию
    const defaults: Record<string, boolean> = {}
    categories.forEach(cat => {
      defaults[cat.id] = cat.defaultExpanded ?? true
    })
    setExpandedSections(defaults)
  }, [categories])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleCheckboxChange = (categoryId: string, optionId: string, checked: boolean) => {
    const current = localFilters[categoryId] || []
    const updated = checked
      ? [...current, optionId]
      : current.filter((id: string) => id !== optionId)

    const newFilters = { ...localFilters, [categoryId]: updated }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleRangeChange = (categoryId: string, value: [number, number]) => {
    const newFilters = { ...localFilters, [categoryId]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleColorSelect = (categoryId: string, colorId: string) => {
    const current = localFilters[categoryId] || []
    const updated = current.includes(colorId)
      ? current.filter((id: string) => id !== colorId)
      : [...current, colorId]

    const newFilters = { ...localFilters, [categoryId]: updated }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    onFilterChange({})
  }

  const clearCategoryFilter = (categoryId: string) => {
    const newFilters = { ...localFilters }
    delete newFilters[categoryId]
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(v => {
      if (Array.isArray(v)) return v.length > 0
      if (Array.isArray(v) && v.length === 2) return true
      return false
    }).length
  }

  const filterOptions = (options: FilterOption[], categoryId: string) => {
    const searchTerm = searchTerms[categoryId]?.toLowerCase() || ''
    if (!searchTerm) return options
    return options.filter(opt => opt.label.toLowerCase().includes(searchTerm))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Сбросить ({getActiveFilterCount()})
          </button>
        )}
      </div>

      {/* Filter Categories */}
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            {/* Category Header */}
            <button
              onClick={() => toggleSection(category.id)}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{category.name}</span>
                {localFilters[category.id] && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {Array.isArray(localFilters[category.id])
                      ? localFilters[category.id].length
                      : '1'}
                  </span>
                )}
              </div>
              {expandedSections[category.id] ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Category Content */}
            {expandedSections[category.id] && (
              <div className="mt-3 space-y-2">
                {/* Search within category */}
                {category.options && category.options.length > 10 && (
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Поиск в ${category.name.toLowerCase()}...`}
                      value={searchTerms[category.id] || ''}
                      onChange={(e) => setSearchTerms({ ...searchTerms, [category.id]: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                )}

                {/* Checkbox List */}
                {category.type === 'checkbox' && category.options && (
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {filterOptions(category.options, category.id).map(option => (
                      <label
                        key={option.id}
                        className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox
                            checked={(localFilters[category.id] || []).includes(option.id)}
                            onChange={(checked) => handleCheckboxChange(category.id, option.id, checked)}
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">
                            {option.label}
                          </span>
                        </div>
                        {option.count !== undefined && (
                          <span className="text-xs text-gray-400 ml-2">
                            ({option.count})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {/* Color Picker */}
                {category.type === 'color' && category.options && (
                  <div className="grid grid-cols-6 gap-2">
                    {category.options.map(option => (
                      <button
                        key={option.id}
                        onClick={() => handleColorSelect(category.id, option.id)}
                        className={`
                          relative w-10 h-10 rounded-lg border-2 transition-all
                          ${(localFilters[category.id] || []).includes(option.id)
                            ? 'border-blue-600 scale-110 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        style={{ backgroundColor: option.color }}
                        title={option.label}
                      >
                        {(localFilters[category.id] || []).includes(option.id) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Size Selector */}
                {category.type === 'size' && category.options && (
                  <div className="grid grid-cols-4 gap-2">
                    {category.options.map(option => (
                      <button
                        key={option.id}
                        onClick={() => handleCheckboxChange(category.id, option.id, !(localFilters[category.id] || []).includes(option.id))}
                        className={`
                          px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                          ${(localFilters[category.id] || []).includes(option.id)
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Price Range Slider */}
                {category.type === 'range' && category.min !== undefined && category.max !== undefined && (
                  <div className="px-2">
                    <Slider
                      min={category.min}
                      max={category.max}
                      step={100}
                      value={localFilters[category.id] || [category.min, category.max]}
                      onChange={(values) => handleRangeChange(category.id, values as [number, number])}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">От</span>
                        <input
                          type="number"
                          value={(localFilters[category.id] || [category.min, category.max])[0]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || (category.min ?? 0)
                            const current = localFilters[category.id] || [category.min ?? 0, category.max ?? 0]
                            handleRangeChange(category.id, [val, current[1]])
                          }}
                          className="w-24 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                        <span className="text-sm text-gray-400">₽</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">До</span>
                        <input
                          type="number"
                          value={(localFilters[category.id] || [category.min, category.max])[1]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || (category.max ?? 0)
                            const current = localFilters[category.id] || [category.min ?? 0, category.max ?? 0]
                            handleRangeChange(category.id, [current[0], val])
                          }}
                          className="w-24 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                        <span className="text-sm text-gray-400">₽</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clear Category Filter */}
                {localFilters[category.id] && (
                  <button
                    onClick={() => clearCategoryFilter(category.id)}
                    className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                  >
                    Сбросить
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}
