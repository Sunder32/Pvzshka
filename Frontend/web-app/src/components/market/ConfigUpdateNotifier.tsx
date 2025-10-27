'use client';

import React, { useEffect, useState } from 'react';
import { useConfig } from '@/lib/ConfigProvider';

export default function ConfigUpdateNotifier() {
  const { config, checkForUpdates } = useConfig();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Проверяем обновления каждые 30 секунд
    const interval = setInterval(async () => {
      const hasUpdates = await checkForUpdates();
      if (hasUpdates) {
        setShowNotification(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification || !config) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 shadow-lg"
      style={{
        backgroundColor: config.branding.primaryColor,
      }}
    >
      <div className="container mx-auto flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-semibold">Доступно обновление</p>
            <p className="text-sm opacity-90">
              Конфигурация магазина была обновлена. Обновите страницу для применения изменений.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Обновить
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
