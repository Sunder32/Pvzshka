'use client';

export function CategoryList() {
  const categories = [
    { id: '1', name: 'Электроника', icon: '📱' },
    { id: '2', name: 'Одежда', icon: '👕' },
    { id: '3', name: 'Дом и сад', icon: '🏠' },
    { id: '4', name: 'Спорт', icon: '⚽' },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Категории</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-2">{category.icon}</div>
            <div className="font-medium">{category.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
