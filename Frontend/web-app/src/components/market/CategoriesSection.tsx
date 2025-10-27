'use client';

import React, { useEffect, useState } from 'react';
import { useConfig } from '@/lib/ConfigProvider';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  metadata?: { icon?: string };
}

export default function CategoriesSection() {
  const { config } = useConfig();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [config]);

  const loadCategories = async () => {
    if (!config) return;

    try {
      setLoading(true);
      const catalogUrl = process.env.NEXT_PUBLIC_CATALOG_SERVICE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${catalogUrl}/api/v1/categories?tenant_id=${config.tenantId}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!config || !config.homepage.categories.enabled) {
    return null;
  }

  const { categories: categoriesConfig } = config.homepage;
  const { branding } = config;

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{categoriesConfig.title}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="categories-section py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {categoriesConfig.title || 'Категории товаров'}
          </h2>
          <p className="text-xl text-gray-600">
            Выберите категорию для быстрого поиска
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalog?category=${category.slug}`}
              className="group"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl transition-colors"
                  style={{
                    backgroundColor: `${branding.primaryColor}20`,
                  }}
                >
                  {category.metadata?.icon || '📦'}
                </div>
                
                <h3 className="text-lg font-semibold text-center mb-2 group-hover:text-gray-900">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/catalog"
            className="inline-block px-8 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
            style={{
              backgroundColor: branding.primaryColor,
            }}
          >
            Смотреть все категории
          </Link>
        </div>
      </div>
    </section>
  );
}
