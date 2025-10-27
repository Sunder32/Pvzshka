'use client';

export function HeroBanner() {
  return (
    <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
      <div className="px-8 py-16 text-white">
        <h1 className="text-4xl font-bold mb-4">Скидки до 50%</h1>
        <p className="text-xl mb-6">На все категории товаров</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100">
          Перейти к покупкам
        </button>
      </div>
    </div>
  );
}
