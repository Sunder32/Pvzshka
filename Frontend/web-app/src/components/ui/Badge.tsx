import React from 'react'

export type BadgeVariant = 
  | 'discount'
  | 'new'
  | 'top'
  | 'limited'
  | 'exclusive'
  | 'bestseller'
  | 'gift'
  | 'sale'
  | 'preorder'
  | 'custom'

interface BadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  value?: string | number
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  className?: string
}

/**
 * Badge - Универсальный компонент для отображения меток на карточках товаров
 * 
 * Варианты:
 * - discount: Скидка (фиолетовый, как WB)
 * - new: Новинка (синий, как Ozon)
 * - top: Топ продаж (градиент золото-оранж)
 * - limited: Ограниченное предложение (красный с пульсацией)
 * - exclusive: Эксклюзив (черный)
 * - bestseller: Хит продаж (зеленый)
 * - gift: Подарок (розовый)
 * - sale: Распродажа (красный)
 * - preorder: Предзаказ (серый)
 * - custom: Пользовательский текст
 */
export default function Badge({
  variant,
  children,
  value,
  animated = false,
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded',
    md: 'text-xs px-2 py-1 rounded-md',
    lg: 'text-sm px-3 py-1.5 rounded-lg',
  }

  const variantConfig: Record<BadgeVariant, { 
    bg: string
    text: string
    label?: string
    emoji?: string
  }> = {
    discount: {
      bg: 'bg-[#CB11AB]',
      text: 'text-white',
      emoji: value ? `-${value}%` : '',
    },
    new: {
      bg: 'bg-[#005BFF]',
      text: 'text-white',
      label: 'Новинка',
    },
    top: {
      bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      text: 'text-white',
      emoji: '⭐',
      label: 'Топ',
    },
    limited: {
      bg: 'bg-red-600',
      text: 'text-white',
      emoji: '🔥',
      label: 'Осталось мало',
    },
    exclusive: {
      bg: 'bg-black',
      text: 'text-white',
      emoji: '💎',
      label: 'Эксклюзив',
    },
    bestseller: {
      bg: 'bg-green-600',
      text: 'text-white',
      emoji: '🏆',
      label: 'Хит продаж',
    },
    gift: {
      bg: 'bg-pink-500',
      text: 'text-white',
      emoji: '🎁',
      label: 'Подарок',
    },
    sale: {
      bg: 'bg-red-500',
      text: 'text-white',
      emoji: '🛍️',
      label: 'Распродажа',
    },
    preorder: {
      bg: 'bg-gray-600',
      text: 'text-white',
      emoji: '📦',
      label: 'Предзаказ',
    },
    custom: {
      bg: 'bg-gray-700',
      text: 'text-white',
    },
  }

  const config = variantConfig[variant]
  const displayText = children || `${config.emoji || ''} ${config.label || value || ''}`.trim()

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-bold shadow-lg
        ${config.bg} ${config.text} ${sizeClasses[size]}
        ${animated ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {displayText}
    </span>
  )
}

/**
 * BadgeGroup - Группа бейджей для карточки товара
 */
interface BadgeGroupProps {
  badges: Array<{
    variant: BadgeVariant
    value?: string | number
    show?: boolean
  }>
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BadgeGroup({
  badges,
  position = 'top-left',
  size = 'md',
  className = '',
}: BadgeGroupProps) {
  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  }

  const visibleBadges = badges.filter(badge => badge.show !== false)

  if (visibleBadges.length === 0) return null

  return (
    <div
      className={`
        absolute ${positionClasses[position]} flex flex-col gap-1.5 z-10
        ${className}
      `}
    >
      {visibleBadges.map((badge, index) => (
        <Badge
          key={index}
          variant={badge.variant}
          value={badge.value}
          size={size}
          animated={badge.variant === 'limited'}
        />
      ))}
    </div>
  )
}

/**
 * StockBadge - Специальный бейдж для индикации остатков
 */
interface StockBadgeProps {
  stock: number
  lowStockThreshold?: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function StockBadge({
  stock,
  lowStockThreshold = 10,
  size = 'md',
  showIcon = true,
}: StockBadgeProps) {
  if (stock === 0) {
    return (
      <Badge variant="custom" size={size} className="bg-gray-400">
        {showIcon && '❌'} Нет в наличии
      </Badge>
    )
  }

  if (stock <= lowStockThreshold) {
    return (
      <Badge variant="limited" size={size} animated>
        Осталось {stock} шт
      </Badge>
    )
  }

  return (
    <Badge variant="custom" size={size} className="bg-green-600">
      {showIcon && '✓'} В наличии
    </Badge>
  )
}

/**
 * DeliveryBadge - Бейдж для информации о доставке
 */
interface DeliveryBadgeProps {
  type: 'fast' | 'today' | 'tomorrow' | 'free' | 'pvz'
  size?: 'sm' | 'md' | 'lg'
}

export function DeliveryBadge({ type, size = 'sm' }: DeliveryBadgeProps) {
  const deliveryConfig = {
    fast: { emoji: '⚡', text: 'Быстрая доставка', bg: 'bg-orange-500' },
    today: { emoji: '🚀', text: 'Доставка сегодня', bg: 'bg-blue-600' },
    tomorrow: { emoji: '📦', text: 'Доставка завтра', bg: 'bg-green-600' },
    free: { emoji: '🎉', text: 'Бесплатная доставка', bg: 'bg-purple-600' },
    pvz: { emoji: '🏪', text: 'В ПВЗ через 2 дня', bg: 'bg-gray-600' },
  }

  const config = deliveryConfig[type]

  return (
    <Badge variant="custom" size={size} className={config.bg}>
      {config.emoji} {config.text}
    </Badge>
  )
}

/**
 * PriceBadge - Бейдж для отображения скидки с процентом и старой ценой
 */
interface PriceBadgeProps {
  originalPrice: number
  currentPrice: number
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
}

export function PriceBadge({
  originalPrice,
  currentPrice,
  size = 'md',
  showPercentage = true,
}: PriceBadgeProps) {
  const discountPercentage = Math.round(
    ((originalPrice - currentPrice) / originalPrice) * 100
  )

  if (discountPercentage <= 0) return null

  return (
    <Badge variant="discount" size={size} value={discountPercentage}>
      {showPercentage ? `-${discountPercentage}%` : 'Скидка'}
    </Badge>
  )
}

/**
 * TimerBadge - Бейдж с таймером обратного отсчета для лимитированных предложений
 */
interface TimerBadgeProps {
  endTime: Date
  size?: 'sm' | 'md' | 'lg'
  onExpire?: () => void
}

export function TimerBadge({ endTime, size = 'md', onExpire }: TimerBadgeProps) {
  const [timeLeft, setTimeLeft] = React.useState('')

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = endTime.getTime() - now

      if (distance < 0) {
        onExpire?.()
        return 'Истекло'
      }

      const hours = Math.floor(distance / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [endTime, onExpire])

  return (
    <Badge variant="limited" size={size} animated>
      ⏰ {timeLeft}
    </Badge>
  )
}
