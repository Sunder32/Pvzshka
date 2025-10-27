'use client';

export function ProductGrid({ title = 'Товары' }: { title?: string }) {
  const products = [
    { id: '1', name: 'Товар 1', price: 1000, image: '/placeholder.jpg' },
    { id: '2', name: 'Товар 2', price: 2000, image: '/placeholder.jpg' },
    { id: '3', name: 'Товар 3', price: 3000, image: '/placeholder.jpg' },
    { id: '4', name: 'Товар 4', price: 4000, image: '/placeholder.jpg' },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-medium mb-2">{product.name}</h3>
              <p className="text-lg font-bold">{product.price} ₽</p>
              <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                В корзину
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
