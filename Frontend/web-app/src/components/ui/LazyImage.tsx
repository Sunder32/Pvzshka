import React, { useState, useEffect, useRef } from 'react'
import Image, { ImageProps } from 'next/image'

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
  src: string
  alt: string
  placeholderSrc?: string
  threshold?: number
  rootMargin?: string
  onLoadComplete?: () => void
  showPlaceholder?: boolean
}

/**
 * LazyImage - Компонент для ленивой загрузки изображений
 * 
 * Особенности:
 * - Использует Intersection Observer API для определения видимости
 * - Показывает blur placeholder до загрузки
 * - Поддерживает все стандартные пропсы Next.js Image
 * - Оптимизирует производительность при прокрутке длинных списков
 */
export default function LazyImage({
  src,
  alt,
  placeholderSrc,
  threshold = 0.1,
  rootMargin = '50px',
  onLoadComplete,
  showPlaceholder = true,
  className = '',
  ...props
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  const handleLoadComplete = () => {
    setIsLoaded(true)
    onLoadComplete?.()
  }

  // Base64 blur placeholder (1x1 gray pixel)
  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4='

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {showPlaceholder && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <svg
            className="w-12 h-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {isInView && (
        <Image
          src={src}
          alt={alt}
          onLoad={handleLoadComplete}
          placeholder="blur"
          blurDataURL={placeholderSrc || blurDataURL}
          className={`transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  )
}

/**
 * ProductImageGallery - Компонент галереи с ленивой загрузкой для страницы продукта
 */
interface ProductImageGalleryProps {
  images: string[]
  productName: string
  priority?: boolean
}

export function ProductImageGallery({
  images,
  productName,
  priority = false,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <svg
          className="w-24 h-24 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Главное изображение */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
        {priority ? (
          <Image
            src={images[selectedIndex]}
            alt={`${productName} - изображение ${selectedIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <LazyImage
            src={images[selectedIndex]}
            alt={`${productName} - изображение ${selectedIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-[#005BFF] ring-2 ring-[#005BFF]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <LazyImage
                src={image}
                alt={`${productName} - миниатюра ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
                showPlaceholder={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * GridImageLoader - Компонент для оптимизированной загрузки изображений в сетке товаров
 */
interface GridImageLoaderProps {
  src: string
  alt: string
  priority?: boolean
  onHover?: () => void
}

export function GridImageLoader({
  src,
  alt,
  priority = false,
  onHover,
}: GridImageLoaderProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative aspect-square overflow-hidden"
      onMouseEnter={() => {
        setIsHovered(true)
        onHover?.()
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {priority ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          priority
        />
      ) : (
        <LazyImage
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
      )}
    </div>
  )
}
