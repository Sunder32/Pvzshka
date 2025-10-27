import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily?: string;
  };
  logo?: string;
  favicon?: string;
  appleIcon?: string;
  features: {
    enablePVZ: boolean;
    enableMarketplace: boolean;
    enableReviews: boolean;
  };
}

export interface PageConfig {
  id: string;
  sections: SectionConfig[];
}

export interface SectionConfig {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  config: any;
}

/**
 * Get tenant configuration by hostname
 */
export async function getTenantConfig(host: string): Promise<TenantConfig | null> {
  try {
    // Extract subdomain
    const subdomain = host.split('.')[0];
    
    // Check if custom domain
    let url = `${API_URL}/api/v1/tenants/by-subdomain/${subdomain}`;
    
    if (!host.includes('localhost') && !host.includes('.marketplace.com')) {
      // Custom domain
      url = `${API_URL}/api/v1/tenants/by-domain/${host}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'max-age=300' // Cache for 5 minutes
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to load tenant config:', error);
    return null;
  }
}

/**
 * Get home page configuration
 */
export async function getHomePageConfig(host: string): Promise<PageConfig> {
  try {
    const tenantConfig = await getTenantConfig(host);
    
    if (!tenantConfig) {
      return getDefaultHomePageConfig();
    }
    
    const response = await axios.get(
      `${API_URL}/graphql`,
      {
        params: {
          query: `
            query GetHomePageConfig($tenantId: ID!) {
              homePageConfig(tenantId: $tenantId) {
                id
                sections {
                  id
                  type
                  order
                  visible
                  config
                }
              }
            }
          `,
          variables: {
            tenantId: tenantConfig.id
          }
        }
      }
    );
    
    return response.data.data.homePageConfig;
  } catch (error) {
    console.error('Failed to load page config:', error);
    return getDefaultHomePageConfig();
  }
}

/**
 * Default configuration fallback
 */
function getDefaultHomePageConfig(): PageConfig {
  return {
    id: 'home',
    sections: [
      {
        id: 'search',
        type: 'search_bar',
        order: 1,
        visible: true,
        config: {
          placeholder: 'Поиск товаров...'
        }
      },
      {
        id: 'categories',
        type: 'category_list',
        order: 2,
        visible: true,
        config: {
          layout: 'grid',
          columns: 4
        }
      },
      {
        id: 'featured',
        type: 'product_grid',
        order: 3,
        visible: true,
        config: {
          title: 'Рекомендуем',
          limit: 12
        }
      }
    ]
  };
}
