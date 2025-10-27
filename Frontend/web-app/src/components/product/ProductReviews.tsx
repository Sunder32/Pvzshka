'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Review } from '@/types'

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      product_id: productId,
      user_id: '1',
      user_name: 'Алексей П.',
      user_avatar: '/avatars/user1.jpg',
      rating: 5,
      title: 'Отличный товар!',
      comment: 'Очень доволен покупкой. Качество на высоте, доставка быстрая. Рекомендую!',
      helpful_count: 12,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      product_id: productId,
      user_id: '2',
      user_name: 'Мария К.',
      rating: 4,
      comment: 'Хороший продукт, но цена немного завышена. В целом рекомендую к покупке.',
      helpful_count: 5,
      created_at: '2024-01-10T14:20:00Z'
    }
  ])

  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit review to API
    console.log('Submitting review:', newReview)
  }

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="flex items-start gap-8 p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600">{reviews.length} отзывов</div>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = reviews.filter(r => r.rating === rating).length
            const percentage = (count / reviews.length) * 100

            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm w-12">{rating} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Form */}
      <div className="border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Оставить отзыв</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ваша оценка</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating })}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= newReview.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Заголовок</label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Краткое резюме вашего опыта"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Отзыв</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Поделитесь своими впечатлениями о товаре"
              required
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Отправить отзыв
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Отзывы покупателей</h3>
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {review.user_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{review.user_name}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>
                {review.title && (
                  <h4 className="font-semibold mb-2">{review.title}</h4>
                )}
                <p className="text-gray-700 mb-3">{review.comment}</p>
                <div className="flex items-center gap-4 text-sm">
                  <button className="text-gray-600 hover:text-blue-600">
                    👍 Полезно ({review.helpful_count})
                  </button>
                  <button className="text-gray-600 hover:text-blue-600">
                    Ответить
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
