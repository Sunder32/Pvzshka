'use client'

import { useEffect, useRef, useState } from 'react'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  className?: string
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  className = ''
}: SliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100
  }

  const getValue = (percentage: number) => {
    const val = min + (percentage / 100) * (max - min)
    const stepped = Math.round(val / step) * step
    return Math.max(min, Math.min(max, stepped))
  }

  const handleMouseDown = (thumb: 'min' | 'max') => {
    setIsDragging(thumb)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = ((e.clientX - rect.left) / rect.width) * 100
    const newValue = getValue(Math.max(0, Math.min(100, percentage)))

    if (isDragging === 'min' && newValue < value[1]) {
      onChange([newValue, value[1]])
    } else if (isDragging === 'max' && newValue > value[0]) {
      onChange([value[0], newValue])
    }
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !sliderRef.current) return

    const touch = e.touches[0]
    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = ((touch.clientX - rect.left) / rect.width) * 100
    const newValue = getValue(Math.max(0, Math.min(100, percentage)))

    if (isDragging === 'min' && newValue < value[1]) {
      onChange([newValue, value[1]])
    } else if (isDragging === 'max' && newValue > value[0]) {
      onChange([value[0], newValue])
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, value])

  const minPercentage = getPercentage(value[0])
  const maxPercentage = getPercentage(value[1])

  return (
    <div className={`relative py-4 ${className}`}>
      {/* Track */}
      <div
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
      >
        {/* Active Range */}
        <div
          className="absolute h-full bg-blue-600 rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`
          }}
        />

        {/* Min Thumb */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-5 bg-white border-2 border-blue-600 rounded-full
            cursor-grab active:cursor-grabbing
            transition-shadow hover:shadow-md
            ${isDragging === 'min' ? 'scale-125 shadow-lg' : ''}
          `}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={() => handleMouseDown('min')}
          onTouchStart={() => handleMouseDown('min')}
        >
          {/* Tooltip */}
          {isDragging === 'min' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {value[0].toLocaleString()} ₽
            </div>
          )}
        </div>

        {/* Max Thumb */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-5 bg-white border-2 border-blue-600 rounded-full
            cursor-grab active:cursor-grabbing
            transition-shadow hover:shadow-md
            ${isDragging === 'max' ? 'scale-125 shadow-lg' : ''}
          `}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={() => handleMouseDown('max')}
          onTouchStart={() => handleMouseDown('max')}
        >
          {/* Tooltip */}
          {isDragging === 'max' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {value[1].toLocaleString()} ₽
            </div>
          )}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">{min.toLocaleString()} ₽</span>
        <span className="text-xs text-gray-500">{max.toLocaleString()} ₽</span>
      </div>
    </div>
  )
}
