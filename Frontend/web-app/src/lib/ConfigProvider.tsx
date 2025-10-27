'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getConfigClient, TenantConfig } from './configClient';

interface ConfigContextValue {
  config: TenantConfig | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  checkForUpdates: () => Promise<boolean>;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

interface ConfigProviderProps {
  tenantId: string;
  children: React.ReactNode;
  initialConfig?: TenantConfig;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function ConfigProvider({
  tenantId,
  children,
  initialConfig,
  autoRefresh = false,
  refreshInterval = 60000, // 1 минута
}: ConfigProviderProps) {
  const [config, setConfig] = useState<TenantConfig | null>(initialConfig || null);
  const [loading, setLoading] = useState(!initialConfig);
  const [error, setError] = useState<Error | null>(null);

  const configClient = getConfigClient();

  const fetchConfig = useCallback(async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await configClient.getConfig(tenantId);
      setConfig(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('[ConfigProvider] Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId, configClient]);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (!tenantId || !config) return false;

    try {
      const hasUpdates = await configClient.checkForUpdates(tenantId, config.version);
      
      if (hasUpdates) {
        console.log('[ConfigProvider] Updates available, refetching config...');
        await fetchConfig();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('[ConfigProvider] Error checking for updates:', err);
      return false;
    }
  }, [tenantId, config, configClient, fetchConfig]);

  // Начальная загрузка конфига
  useEffect(() => {
    if (!initialConfig) {
      fetchConfig();
    }
  }, [initialConfig, fetchConfig]);

  // Автоматическая проверка обновлений
  useEffect(() => {
    if (!autoRefresh || !tenantId) return;

    const interval = setInterval(() => {
      checkForUpdates();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, tenantId, refreshInterval, checkForUpdates]);

  // Применение CSS переменных для темы
  useEffect(() => {
    if (!config) return;

    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', config.branding.primaryColor);
    root.style.setProperty('--secondary-color', config.branding.secondaryColor);
    root.style.setProperty('--accent-color', config.branding.accentColor);

    // Обновляем title и favicon
    document.title = config.seo.title || config.branding.name;
    
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon && config.branding.favicon) {
      favicon.href = config.branding.favicon;
    }

    console.log('[ConfigProvider] Theme applied:', config.branding.name);
  }, [config]);

  const value: ConfigContextValue = {
    config,
    loading,
    error,
    refetch: fetchConfig,
    checkForUpdates,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext);
  
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  
  return context;
}

// Hook для доступа к конкретным частям конфига
export function useBranding() {
  const { config } = useConfig();
  return config?.branding || null;
}

export function useFeatures() {
  const { config } = useConfig();
  return config?.features || null;
}

export function useLocale() {
  const { config } = useConfig();
  return config?.locale || null;
}

export function useHomepage() {
  const { config } = useConfig();
  return config?.homepage || null;
}

export function useIntegrations() {
  const { config } = useConfig();
  return config?.integrations || null;
}
