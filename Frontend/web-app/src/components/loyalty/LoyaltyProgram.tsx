import React, { useState, useEffect } from 'react'
import { GiftIcon, StarIcon, TrophyIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface LoyaltyProgram {
  points: number
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  nextLevelPoints: number
  benefits: string[]
  cashbackPercent: number
}

/**
 * LoyaltyCard - Карта программы лояльности
 * 
 * Особенности:
 * - 4 уровня: Bronze, Silver, Gold, Platinum
 * - Прогресс до следующего уровня
 * - Кэшбэк и бонусы
 * - История операций
 */
export function LoyaltyCard() {
  const [loyalty, setLoyalty] = useState<LoyaltyProgram>({
    points: 2750,
    level: 'Silver',
    nextLevelPoints: 5000,
    benefits: [
      'Кэшбэк 5% на все покупки',
      'Бесплатная доставка от 2000₽',
      'Эксклюзивные предложения',
      'Приоритетная поддержка',
    ],
    cashbackPercent: 5,
  })

  const levelConfig = {
    Bronze: { color: 'from-amber-700 to-amber-500', icon: '🥉', minPoints: 0 },
    Silver: { color: 'from-gray-400 to-gray-300', icon: '🥈', minPoints: 1000 },
    Gold: { color: 'from-yellow-500 to-yellow-400', icon: '🥇', minPoints: 5000 },
    Platinum: { color: 'from-purple-600 to-purple-400', icon: '💎', minPoints: 10000 },
  }

  const progress = (loyalty.points / loyalty.nextLevelPoints) * 100
  const config = levelConfig[loyalty.level]

  return (
    <div className={`bg-gradient-to-br ${config.color} rounded-2xl p-6 text-white shadow-2xl`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{config.icon}</div>
          <div>
            <p className="text-sm opacity-90">Уровень лояльности</p>
            <h3 className="text-2xl font-bold">{loyalty.level}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Баллы</p>
          <p className="text-3xl font-bold">{loyalty.points.toLocaleString('ru-RU')}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>До уровня {Object.keys(levelConfig)[Object.keys(levelConfig).indexOf(loyalty.level) + 1]}</span>
          <span>{loyalty.nextLevelPoints - loyalty.points} баллов</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <p className="text-sm font-semibold mb-2">Ваши привилегии:</p>
        {loyalty.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <SparklesIcon className="w-4 h-4" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      {/* Cashback */}
      <div className="mt-6 pt-6 border-t border-white/30">
        <div className="flex items-center justify-between">
          <span className="text-sm">Кэшбэк на следующую покупку:</span>
          <span className="text-2xl font-bold">{loyalty.cashbackPercent}%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * PromoCodeInput - Компонент ввода промокода
 */
interface PromoCode {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minAmount?: number
  expiresAt?: Date
  description?: string
}

interface PromoCodeInputProps {
  onApply: (promo: PromoCode) => void
  currentTotal: number
}

export function PromoCodeInput({ onApply, currentTotal }: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Моковые промокоды (в реальности - API запрос)
  const mockPromoCodes: Record<string, PromoCode> = {
    'WELCOME10': {
      code: 'WELCOME10',
      discount: 10,
      type: 'percentage',
      description: 'Скидка 10% на первый заказ',
    },
    'SAVE500': {
      code: 'SAVE500',
      discount: 500,
      type: 'fixed',
      minAmount: 3000,
      description: 'Скидка 500₽ при заказе от 3000₽',
    },
    'VIP20': {
      code: 'VIP20',
      discount: 20,
      type: 'percentage',
      minAmount: 5000,
      description: 'VIP скидка 20% при заказе от 5000₽',
    },
  }

  const handleApply = async () => {
    setError('')
    setIsLoading(true)

    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 500))

    const promo = mockPromoCodes[code.toUpperCase()]

    if (!promo) {
      setError('Промокод не найден')
      setIsLoading(false)
      return
    }

    if (promo.minAmount && currentTotal < promo.minAmount) {
      setError(`Минимальная сумма заказа: ${promo.minAmount}₽`)
      setIsLoading(false)
      return
    }

    onApply(promo)
    setCode('')
    setIsLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError('')
          }}
          placeholder="Введите промокод"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005BFF] uppercase"
          disabled={isLoading}
        />
        <button
          onClick={handleApply}
          disabled={!code || isLoading}
          className="px-6 py-3 bg-[#005BFF] text-white rounded-lg font-semibold hover:bg-[#0047CC] 
                   disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            'Применить'
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * AvailablePromoCodes - Список доступных промокодов
 */
export function AvailablePromoCodes() {
  const promoCodes = [
    {
      code: 'WELCOME10',
      title: 'Скидка для новых клиентов',
      discount: '10%',
      minAmount: 0,
      expiresIn: '7 дней',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    },
    {
      code: 'SAVE500',
      title: 'Выгодная покупка',
      discount: '500₽',
      minAmount: 3000,
      expiresIn: '3 дня',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    },
    {
      code: 'FREESHIP',
      title: 'Бесплатная доставка',
      discount: 'Доставка',
      minAmount: 2000,
      expiresIn: '14 дней',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
    },
  ]

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    // TODO: Показать toast уведомление
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-gray-900 text-lg mb-4">🎁 Доступные промокоды</h3>
      {promoCodes.map((promo, index) => (
        <div
          key={index}
          className={`${promo.color} rounded-xl p-4 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow`}
          onClick={() => copyToClipboard(promo.code)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">{promo.title}</h4>
              <p className="text-sm opacity-90">
                {promo.minAmount > 0 ? `При заказе от ${promo.minAmount}₽` : 'Без минимальной суммы'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{promo.discount}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/30">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-white/20 rounded-full font-mono font-bold text-sm">
                {promo.code}
              </div>
              <button className="text-xs hover:underline">📋 Скопировать</button>
            </div>
            <div className="text-xs opacity-75">⏰ {promo.expiresIn}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * ReferralProgram - Реферальная программа
 */
export function ReferralProgram() {
  const [referralCode] = useState('REF-12345')
  const [referrals, setReferrals] = useState(8)
  const [earned, setEarned] = useState(4000)

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    // TODO: Toast notification
  }

  return (
    <div className="bg-gradient-to-br from-[#005BFF] to-[#0047CC] rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-6">
        <GiftIcon className="w-8 h-8" />
        <div>
          <h3 className="text-2xl font-bold">Приводи друзей</h3>
          <p className="text-sm opacity-90">Получай 500₽ за каждого</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm opacity-90 mb-1">Приглашено</p>
          <p className="text-3xl font-bold">{referrals}</p>
        </div>
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm opacity-90 mb-1">Заработано</p>
          <p className="text-3xl font-bold">{earned.toLocaleString()}₽</p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
        <p className="text-sm opacity-90 mb-2">Ваш реферальный код:</p>
        <div className="flex items-center justify-between">
          <code className="text-2xl font-bold font-mono">{referralCode}</code>
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-white text-[#005BFF] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            📋 Скопировать ссылку
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-6 pt-6 border-t border-white/30 space-y-2 text-sm">
        <p className="font-semibold mb-3">Как это работает:</p>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">1️⃣</span>
          <span>Поделитесь ссылкой с друзьями</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">2️⃣</span>
          <span>Друг регистрируется и делает первый заказ</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">3️⃣</span>
          <span>Вы оба получаете по 500₽ на счет</span>
        </div>
      </div>
    </div>
  )
}

/**
 * LoyaltyHistory - История начисления/списания баллов
 */
interface LoyaltyTransaction {
  id: string
  type: 'earn' | 'spend'
  points: number
  description: string
  date: Date
}

export function LoyaltyHistory() {
  const [transactions] = useState<LoyaltyTransaction[]>([
    {
      id: '1',
      type: 'earn',
      points: 250,
      description: 'Покупка #12345',
      date: new Date('2024-01-15'),
    },
    {
      id: '2',
      type: 'spend',
      points: -500,
      description: 'Оплата баллами',
      date: new Date('2024-01-10'),
    },
    {
      id: '3',
      type: 'earn',
      points: 100,
      description: 'Бонус за отзыв',
      date: new Date('2024-01-05'),
    },
  ])

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">История баллов</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'earn' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'earn' ? (
                  <TrophyIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <FireIcon className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-xs text-gray-500">
                  {transaction.date.toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
            <div className={`font-bold text-lg ${
              transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'earn' ? '+' : ''}{transaction.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
