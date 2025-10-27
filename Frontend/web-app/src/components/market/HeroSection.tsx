'use client';

import React from 'react';
import { useConfig } from '@/lib/ConfigProvider';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const { config } = useConfig();

  if (!config || !config.homepage.hero.enabled) {
    return null;
  }

  const { hero } = config.homepage;
  const { branding } = config;

  return (
    <section
      className="hero-section relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
      }}
    >
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-white space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              {hero.title || `Добро пожаловать в ${branding.name}`}
            </h1>
            
            <p className="text-xl md:text-2xl opacity-90">
              {hero.subtitle || 'Широкий ассортимент качественных товаров по выгодным ценам'}
            </p>

            {hero.cta && (
              <div className="pt-4">
                <Link
                  href={hero.cta.link || '/catalog'}
                  className="inline-block px-8 py-4 bg-white rounded-lg font-semibold text-lg transition-transform hover:scale-105"
                  style={{ color: branding.primaryColor }}
                >
                  {hero.cta.text || 'Перейти в каталог'}
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="pt-8 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-sm opacity-75">Товаров</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm opacity-75">Клиентов</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm opacity-75">Поддержка</div>
              </div>
            </div>
          </div>

          {/* Image */}
          {hero.image && (
            <div className="relative h-96 lg:h-[500px]">
              <Image
                src={hero.image}
                alt={hero.title || branding.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
