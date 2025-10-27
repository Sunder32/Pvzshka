'use client';

export function ProductCarousel({ title = 'Рекомендуем' }: { title?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-none w-48 bg-white rounded-lg shadow">
            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
            <div className="p-3">
              <h3 className="font-medium text-sm mb-1">Товар {i}</h3>
              <p className="text-lg font-bold">{i * 1000} ₽</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
