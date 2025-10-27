'use client'

import { useState } from 'react'
import { MapPin, Clock, Phone, Navigation } from 'lucide-react'
import { PickupPoint } from '@/types'

interface PickupPointSelectorProps {
  selectedPoint: PickupPoint | null
  onSelectPoint: (point: PickupPoint) => void
}

const mockPickupPoints: PickupPoint[] = [
  {
    id: '1',
    name: 'ПВЗ на Тверской',
    address: 'г. Москва, ул. Тверская, д. 12',
    coordinates: { lat: 55.764523, lng: 37.605226 },
    working_hours: 'Пн-Вс: 09:00 - 21:00',
    phone: '+7 (495) 123-45-67'
  },
  {
    id: '2',
    name: 'ПВЗ в ТЦ Европейский',
    address: 'г. Москва, пл. Киевского Вокзала, д. 2',
    coordinates: { lat: 55.743634, lng: 37.565948 },
    working_hours: 'Пн-Вс: 10:00 - 22:00',
    phone: '+7 (495) 234-56-78'
  },
  {
    id: '3',
    name: 'ПВЗ на Арбате',
    address: 'г. Москва, ул. Арбат, д. 25',
    coordinates: { lat: 55.751426, lng: 37.593087 },
    working_hours: 'Пн-Пт: 10:00 - 20:00, Сб-Вс: 11:00 - 19:00',
    phone: '+7 (495) 345-67-89'
  },
  {
    id: '4',
    name: 'ПВЗ в Отрадном',
    address: 'г. Москва, ул. Декабристов, д. 8',
    coordinates: { lat: 55.863607, lng: 37.602879 },
    working_hours: 'Пн-Вс: 09:00 - 21:00',
    phone: '+7 (495) 456-78-90'
  },
  {
    id: '5',
    name: 'ПВЗ у метро Сокол',
    address: 'г. Москва, Ленинградский проспект, д. 74',
    coordinates: { lat: 55.805517, lng: 37.514961 },
    working_hours: 'Пн-Вс: 08:00 - 22:00',
    phone: '+7 (495) 567-89-01'
  }
]

export default function PickupPointSelector({ selectedPoint, onSelectPoint }: PickupPointSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showMap, setShowMap] = useState(false)

  const filteredPoints = mockPickupPoints.filter(point =>
    point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    point.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Поиск пункта выдачи..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setShowMap(!showMap)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Navigation className="w-5 h-5" />
          {showMap ? 'Список' : 'На карте'}
        </button>
      </div>

      {showMap ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Карта пунктов выдачи</p>
          <p className="text-sm text-gray-500">(интеграция с картами будет добавлена)</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredPoints.map((point) => (
            <label
              key={point.id}
              className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedPoint?.id === point.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="pickup-point"
                checked={selectedPoint?.id === point.id}
                onChange={() => onSelectPoint(point)}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <MapPin className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  selectedPoint?.id === point.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{point.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{point.address}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{point.working_hours}</span>
                    </div>
                    {point.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{point.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedPoint?.id === point.id && (
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {filteredPoints.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Пункты выдачи не найдены
        </div>
      )}

      {selectedPoint && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Выбран пункт выдачи: <strong>{selectedPoint.name}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
