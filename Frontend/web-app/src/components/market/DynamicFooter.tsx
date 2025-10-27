'use client';

import React from 'react';
import { useConfig } from '@/lib/ConfigProvider';
import Link from 'next/link';

export default function DynamicFooter() {
  const { config, loading } = useConfig();

  if (loading || !config) {
    return (
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="h-32 bg-gray-800 animate-pulse rounded" />
        </div>
      </footer>
    );
  }

  const { branding, layout, features } = config;
  const footerStyle = layout.footerStyle || 'default';

  return (
    <footer
      className={`footer footer-${footerStyle} bg-gray-900 text-white py-12`}
      style={{
        borderTop: `4px solid ${branding.primaryColor}`,
      }}
    >
      <div className="container mx-auto px-4">
        {footerStyle === 'default' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Информация о магазине */}
            <div>
              <h3 className="text-xl font-bold mb-4">{branding.name}</h3>
              <p className="text-gray-400">
                Ваш надежный онлайн-магазин с широким ассортиментом товаров
              </p>
            </div>

            {/* Навигация */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Навигация</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Главная
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="text-gray-400 hover:text-white transition-colors">
                    Каталог
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    О нас
                  </Link>
                </li>
                <li>
                  <Link href="/contacts" className="text-gray-400 hover:text-white transition-colors">
                    Контакты
                  </Link>
                </li>
              </ul>
            </div>

            {/* Покупателям */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Покупателям</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/delivery" className="text-gray-400 hover:text-white transition-colors">
                    Доставка
                  </Link>
                </li>
                <li>
                  <Link href="/payment" className="text-gray-400 hover:text-white transition-colors">
                    Оплата
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-400 hover:text-white transition-colors">
                    Возврат
                  </Link>
                </li>
                <li>
                  <Link href="/warranty" className="text-gray-400 hover:text-white transition-colors">
                    Гарантия
                  </Link>
                </li>
              </ul>
            </div>

            {/* Контакты */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@{config.subdomain}.shop</li>
                <li>Телефон: +7 (800) 123-45-67</li>
                <li>Время работы: Пн-Вс 9:00-21:00</li>
              </ul>
              
              {/* Social Share */}
              {features.socialShare && (
                <div className="mt-4 flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {branding.name}. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
