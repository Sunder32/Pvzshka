import React, { useEffect, useState } from 'react'
import { ShieldCheckIcon, ExclamationTriangleIcon, BellAlertIcon } from '@heroicons/react/24/outline'

/**
 * FraudDetection - Система обнаружения мошенничества
 * 
 * Проверяет:
 * - Подозрительную активность (много заказов за короткое время)
 * - Необычные паттерны покупок
 * - Геолокация и IP
 * - Множественные попытки оплаты
 */
interface FraudCheck {
  score: number // 0-100, где 100 = высокий риск
  alerts: string[]
  isBlocked: boolean
  reason?: string
}

export function useFraudDetection(userId?: string) {
  const [fraudCheck, setFraudCheck] = useState<FraudCheck>({
    score: 0,
    alerts: [],
    isBlocked: false,
  })

  useEffect(() => {
    if (!userId) return

    // Симуляция проверки (в реальности - ML модель на бэкенде)
    const checkFraud = async () => {
      const checks: string[] = []
      let score = 0

      // 1. Проверка частоты заказов
      const recentOrders = getRecentOrders(userId)
      if (recentOrders > 5) {
        checks.push('Необычно высокая частота заказов')
        score += 30
      }

      // 2. Проверка геолокации
      const geoMismatch = await checkGeolocation()
      if (geoMismatch) {
        checks.push('Несоответствие геолокации')
        score += 25
      }

      // 3. Проверка способов оплаты
      const multiplePaymentAttempts = checkPaymentAttempts()
      if (multiplePaymentAttempts > 3) {
        checks.push('Множественные попытки оплаты')
        score += 20
      }

      // 4. Проверка устройства
      const suspiciousDevice = checkDeviceFingerprint()
      if (suspiciousDevice) {
        checks.push('Подозрительное устройство')
        score += 25
      }

      setFraudCheck({
        score,
        alerts: checks,
        isBlocked: score >= 70,
        reason: score >= 70 ? 'Подозрительная активность. Свяжитесь с поддержкой.' : undefined,
      })
    }

    checkFraud()
  }, [userId])

  return fraudCheck
}

// Helper functions (моки)
function getRecentOrders(userId: string): number {
  // Проверка количества заказов за последние 24 часа
  return Math.floor(Math.random() * 3)
}

async function checkGeolocation(): Promise<boolean> {
  // Сравнение IP геолокации с адресом доставки
  return false
}

function checkPaymentAttempts(): number {
  // Количество неудачных попыток оплаты
  return Math.floor(Math.random() * 2)
}

function checkDeviceFingerprint(): boolean {
  // Проверка fingerprint устройства
  return false
}

/**
 * SecurityBadge - Индикатор безопасности для checkout
 */
export function SecurityBadge() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
      <ShieldCheckIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-green-900">Безопасная оплата</p>
        <p className="text-xs text-green-700">
          256-bit SSL шифрование • PCI DSS сертификация
        </p>
      </div>
    </div>
  )
}

/**
 * RateLimiter - Ограничение частоты запросов
 */
export function useRateLimiter(action: string, maxAttempts: number = 5, windowMs: number = 60000) {
  const [attempts, setAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [resetTime, setResetTime] = useState<Date | null>(null)

  const checkLimit = () => {
    const key = `rate_limit_${action}`
    const data = localStorage.getItem(key)
    
    if (data) {
      const { count, timestamp } = JSON.parse(data)
      const now = Date.now()
      
      if (now - timestamp < windowMs) {
        if (count >= maxAttempts) {
          setIsBlocked(true)
          setResetTime(new Date(timestamp + windowMs))
          return false
        }
        
        localStorage.setItem(key, JSON.stringify({ count: count + 1, timestamp }))
        setAttempts(count + 1)
        return true
      }
    }
    
    // Reset
    localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: Date.now() }))
    setAttempts(1)
    setIsBlocked(false)
    return true
  }

  useEffect(() => {
    if (isBlocked && resetTime) {
      const timer = setTimeout(() => {
        setIsBlocked(false)
        setAttempts(0)
      }, resetTime.getTime() - Date.now())
      
      return () => clearTimeout(timer)
    }
  }, [isBlocked, resetTime])

  return { canProceed: checkLimit, attempts, isBlocked, resetTime }
}

/**
 * DataValidator - Валидация данных для предотвращения XSS и инъекций
 */
export const DataValidator = {
  sanitizeHTML: (input: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    }
    return input.replace(/[&<>"'/]/g, (char) => map[char])
  },

  validateEmail: (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },

  validatePhone: (phone: string): boolean => {
    const re = /^[\d\s\-\+\(\)]+$/
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10
  },

  validateCreditCard: (cardNumber: string): boolean => {
    // Luhn algorithm
    const digits = cardNumber.replace(/\D/g, '')
    let sum = 0
    let isEven = false

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  },

  sanitizeSQL: (input: string): string => {
    // Remove SQL keywords and special characters
    return input.replace(/['";\\]/g, '')
  },
}

/**
 * PerformanceMonitor - Мониторинг производительности
 */
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Отправка метрики в аналитику
      if (renderTime > 1000) {
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`)
        
        // Send to analytics
        // analytics.track('slow_component', {
        //   component: componentName,
        //   renderTime,
        //   timestamp: new Date().toISOString()
        // })
      }
    }
  }, [componentName])
}

/**
 * ErrorBoundary - Границы ошибок для graceful degradation
 */
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Send to monitoring service (Sentry, Datadog, etc.)
    // errorReporter.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Что-то пошло не так</h2>
            <p className="text-gray-600 mb-6">
              Мы уже знаем о проблеме и работаем над её устранением.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#005BFF] text-white rounded-lg font-semibold hover:bg-[#0047CC] transition-colors"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * SessionMonitor - Мониторинг сессии пользователя
 */
export function useSessionMonitor() {
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const SESSION_DURATION = 30 * 60 * 1000 // 30 минут
    const WARNING_BEFORE = 5 * 60 * 1000 // Предупреждение за 5 минут

    let activityTimer: NodeJS.Timeout
    let warningTimer: NodeJS.Timeout

    const resetTimers = () => {
      const expiryTime = new Date(Date.now() + SESSION_DURATION)
      setSessionExpiry(expiryTime)
      setShowWarning(false)

      clearTimeout(activityTimer)
      clearTimeout(warningTimer)

      warningTimer = setTimeout(() => {
        setShowWarning(true)
      }, SESSION_DURATION - WARNING_BEFORE)

      activityTimer = setTimeout(() => {
        // Logout user
        // authService.logout()
        console.log('Session expired')
      }, SESSION_DURATION)
    }

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, resetTimers)
    })

    resetTimers()

    return () => {
      clearTimeout(activityTimer)
      clearTimeout(warningTimer)
      events.forEach(event => {
        window.removeEventListener(event, resetTimers)
      })
    }
  }, [])

  return { sessionExpiry, showWarning }
}

/**
 * SessionExpiryWarning - Предупреждение об истечении сессии
 */
export function SessionExpiryWarning({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = expiresAt.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft('Сессия истекла')
        return
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  return (
    <div className="fixed top-4 right-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 shadow-2xl z-50 max-w-sm animate-slide-down">
      <div className="flex items-start gap-3">
        <BellAlertIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1">Сессия скоро истечет</h4>
          <p className="text-sm text-gray-700 mb-3">
            Ваша сессия истечет через <span className="font-bold">{timeLeft}</span>
          </p>
          <button className="px-4 py-2 bg-[#005BFF] text-white rounded-lg font-semibold text-sm hover:bg-[#0047CC] transition-colors">
            Продлить сессию
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * ContentSecurityPolicy - CSP для предотвращения XSS
 */
export function setupCSP() {
  if (typeof document !== 'undefined') {
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.example.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim()
    
    document.head.appendChild(meta)
  }
}
