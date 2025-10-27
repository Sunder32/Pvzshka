'use client';

import { createContext, useContext, ReactNode } from 'react';
import { TenantConfig } from '@/lib/config';

const ThemeContext = createContext<TenantConfig | null>(null);

export function ThemeProvider({ 
  children, 
  config 
}: { 
  children: ReactNode;
  config: TenantConfig | null;
}) {
  return (
    <ThemeContext.Provider value={config}>
      <div 
        style={{
          '--color-primary': config?.theme?.primaryColor || '#0066cc',
          '--color-secondary': config?.theme?.secondaryColor || '#6c757d',
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
