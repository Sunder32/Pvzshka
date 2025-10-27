'use client';

import React, { useEffect, useState } from 'react';
import { useConfig } from '@/lib/ConfigProvider';
import ProductCard from '@/components/catalog/ProductCard';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  category_name?: string;
  inventory: number;
}

export default function FeaturedProducts() {
  const { config } = useConfig();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [config]);

  const loadProducts = async () => {
    if (!config) return;

    try {
      setLoading(true);
      const catalogUrl = process.env.NEXT_PUBLIC_CATALOG_SERVICE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${catalogUrl}/api/v1/products?tenant_id=${config.tenantId}&is_featured=true&limit=8`
      );
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!config || !config.homepage.featuredProducts.enabled) {
    return null;
  }

  const { featuredProducts } = config.homepage;
  const { branding } = config;

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: branding.primaryColor }}>
              {featuredProducts.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: branding.primaryColor }}>
            {featuredProducts.title}
          </h2>
          <p className="text-lg text-gray-600">Специально отобранные товары для вас</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                name: product.title,
                description: product.description || '',
                price: product.price,
                oldPrice: product.compare_at_price,
                images: product.images || [],
                category: product.category_name || 'general',
                rating: 4.5,
                inStock: product.inventory > 0
              }} 
              viewMode="grid" 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
