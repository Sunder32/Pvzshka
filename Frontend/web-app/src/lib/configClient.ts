/**
 * Config Service Client for Next.js
 */

interface TenantConfig {
  tenantId: string;
  subdomain: string;
  name: string;
  status: string;
  tier: string;
  branding: {
    name: string;
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  layout: {
    headerStyle: string;
    footerStyle: string;
    productCardStyle: string;
  };
  features: {
    wishlist: boolean;
    compare: boolean;
    quickView: boolean;
    reviews: boolean;
    ratings: boolean;
    socialShare: boolean;
  };
  categories: string[];
  homepage: {
    hero: {
      enabled: boolean;
      title: string;
      subtitle: string;
      image: string;
      cta: {
        text: string;
        link: string;
      };
    };
    featuredProducts: {
      enabled: boolean;
      title: string;
      limit: number;
    };
    categories: {
      enabled: boolean;
      title: string;
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  integrations: {
    analytics: {
      googleAnalytics: string;
      yandexMetrika: string;
    };
    payment: {
      stripe: boolean;
      paypal: boolean;
      yookassa: boolean;
    };
    shipping: {
      cdek: boolean;
      russianPost: boolean;
      pickup: boolean;
    };
  };
  locale: {
    currency: string;
    language: string;
    timezone: string;
  };
  version: number;
  updatedAt: string;
  createdAt?: string;
}

interface ConfigResponse {
  success: boolean;
  data: TenantConfig;
  source: 'cache' | 'database';
  error?: string;
}

class ConfigServiceClient {
  private baseUrl: string;
  private cache: Map<string, { config: TenantConfig; timestamp: number }>;
  private cacheTTL: number;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_CONFIG_SERVICE_URL || 'http://localhost:4000';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 минут
  }

  /**
   * Получить конфигурацию магазина
   */
  async getConfig(tenantId: string, useCache = true): Promise<TenantConfig> {
    // Проверяем локальный кэш
    if (useCache) {
      const cached = this.cache.get(tenantId);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`[ConfigClient] Cache hit for tenant: ${tenantId}`);
        return cached.config;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/config/${tenantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // Next.js cache for 5 minutes
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ConfigResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch config');
      }

      // Обновляем локальный кэш
      this.cache.set(tenantId, {
        config: result.data,
        timestamp: Date.now(),
      });

      console.log(`[ConfigClient] Loaded config for tenant: ${tenantId} (${result.source})`);
      return result.data;
    } catch (error) {
      console.error(`[ConfigClient] Error fetching config for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Получить версию конфигурации
   */
  async getConfigVersion(tenantId: string): Promise<{ version: number; updatedAt: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/config/${tenantId}/version`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch version');
      }

      return {
        version: result.version,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      console.error(`[ConfigClient] Error fetching version for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Проверить наличие обновлений
   */
  async checkForUpdates(tenantId: string, currentVersion: number): Promise<boolean> {
    try {
      const { version } = await this.getConfigVersion(tenantId);
      return version > currentVersion;
    } catch (error) {
      console.error(`[ConfigClient] Error checking updates for tenant ${tenantId}:`, error);
      return false;
    }
  }

  /**
   * Очистить кэш для магазина
   */
  clearCache(tenantId?: string): void {
    if (tenantId) {
      this.cache.delete(tenantId);
      console.log(`[ConfigClient] Cache cleared for tenant: ${tenantId}`);
    } else {
      this.cache.clear();
      console.log('[ConfigClient] All cache cleared');
    }
  }

  /**
   * Получить все закэшированные конфиги
   */
  getCachedConfigs(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Singleton instance
let configClientInstance: ConfigServiceClient | null = null;

export function getConfigClient(): ConfigServiceClient {
  if (!configClientInstance) {
    configClientInstance = new ConfigServiceClient();
  }
  return configClientInstance;
}

export type { TenantConfig, ConfigResponse };
export default ConfigServiceClient;
