'use client';

import React from 'react';
import { useConfig } from '@/lib/ConfigProvider';
import Link from 'next/link';
import Image from 'next/image';

export default function DynamicHeader() {
  const { config, loading } = useConfig();

  if (loading || !config) {
    return (
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-12 w-32 bg-gray-200 animate-pulse rounded" />
            <div className="h-10 w-64 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </header>
    );
  }

  const { branding, layout, features } = config;
  const headerStyle = layout.headerStyle || 'default';

  return (
    <header
      className={`header header-${headerStyle}`}
      style={{
        backgroundColor: 'white',
        borderBottom: `2px solid ${branding.primaryColor}`,
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className={`flex items-center ${headerStyle === 'centered' ? 'justify-center' : 'justify-between'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            {branding.logo ? (
              <Image
                src={branding.logo}
                alt={branding.name}
                width={48}
                height={48}
                className="object-contain"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {branding.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-2xl font-bold text-gray-900">
              {branding.name}
            </span>
          </Link>

          {/* Navigation */}
          {headerStyle !== 'minimal' && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Главная
              </Link>
              <Link
                href="/catalog"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Каталог
              </Link>
              {features.compare && (
                <Link
                  href="/compare"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Сравнение
                </Link>
              )}
              {features.wishlist && (
                <Link
                  href="/wishlist"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Избранное
                </Link>
              )}
              <Link
                href="/cart"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Корзина
              </Link>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
              style={{
                backgroundColor: branding.primaryColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = branding.secondaryColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = branding.primaryColor;
              }}
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
