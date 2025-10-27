import { GraphQLError } from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { getPool } from '../config/database.js';
import { getCached, setCached, deleteCached } from '../config/redis.js';

export const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    async siteConfig(_, { tenantId }) {
      const cacheKey = `siteConfig:${tenantId}`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      const result = await getPool().query(
        'SELECT * FROM site_configs WHERE tenant_id = $1',
        [tenantId]
      );

      if (result.rows.length === 0) {
        // Return default configuration if none exists
        const defaultConfig = {
          id: null,
          tenantId: tenantId,
          logo: null,
          theme: {
            primaryColor: '#0066cc',
            secondaryColor: '#ff6600',
            fontFamily: 'Inter',
            borderRadius: 8,
          },
          layout: {
            header: {
              showLogo: true,
              showSearch: true,
              showCart: true,
              menu: [],
            },
            footer: {
              showNewsletter: true,
              showSocial: true,
              columns: [],
            },
            sections: [],
          },
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: null,
        };
        return defaultConfig;
      }

      const siteConfig = formatSiteConfig(result.rows[0]);
      await setCached(cacheKey, siteConfig, 300);
      return siteConfig;
    },

    async siteConfigBySubdomain(_, { subdomain }) {
      const cacheKey = `siteConfig:subdomain:${subdomain}`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      const result = await getPool().query(
        `SELECT sc.* FROM site_configs sc
         JOIN tenants t ON sc.tenant_id = t.id
         WHERE t.subdomain = $1`,
        [subdomain]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Site configuration not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      const siteConfig = formatSiteConfig(result.rows[0]);
      await setCached(cacheKey, siteConfig, 300);
      return siteConfig;
    },

    async tenantConfig(_, { tenantId }) {
      const cacheKey = `tenant:${tenantId}`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      const result = await getPool().query(
        'SELECT * FROM tenants WHERE id = $1',
        [tenantId]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Tenant not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      const tenant = formatTenantConfig(result.rows[0]);
      await setCached(cacheKey, tenant, 300);
      return tenant;
    },

    async tenantConfigBySubdomain(_, { subdomain }) {
      const cacheKey = `tenant:subdomain:${subdomain}`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      const result = await getPool().query(
        'SELECT * FROM tenants WHERE subdomain = $1',
        [subdomain]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Tenant not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      const tenant = formatTenantConfig(result.rows[0]);
      await setCached(cacheKey, tenant, 300);
      return tenant;
    },

    async tenantConfigByDomain(_, { domain }) {
      const cacheKey = `tenant:domain:${domain}`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      const result = await getPool().query(
        'SELECT * FROM tenants WHERE custom_domain = $1',
        [domain]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Tenant not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      const tenant = formatTenantConfig(result.rows[0]);
      await setCached(cacheKey, tenant, 300);
      return tenant;
    },

    async homePageConfig(_, { tenantId }) {
      const cacheKey = `page:${tenantId}:home`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      // Default home page configuration
      const defaultConfig = {
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

      await setCached(cacheKey, defaultConfig, 300);
      return defaultConfig;
    },

    async appConfig(_, { tenantId }) {
      const tenant = await resolvers.Query.tenantConfig(_, { tenantId });
      const homePageConfig = await resolvers.Query.homePageConfig(_, { tenantId });

      return {
        tenant,
        homePageConfig,
        navigation: [
          { id: '1', label: 'Главная', url: '/', icon: 'home', order: 1 },
          { id: '2', label: 'Каталог', url: '/catalog', icon: 'grid', order: 2 },
          { id: '3', label: 'Корзина', url: '/cart', icon: 'shopping-cart', order: 3 },
          { id: '4', label: 'Профиль', url: '/profile', icon: 'user', order: 4 },
        ]
      };
    },

    async featureFlags(_, { tenantId }) {
      const cacheKey = `features:${tenantId}`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      // Default feature flags
      const flags = [
        { key: 'enable_pvz', enabled: true, value: null },
        { key: 'enable_marketplace', enabled: true, value: null },
        { key: 'enable_reviews', enabled: true, value: null },
        { key: 'enable_chat', enabled: false, value: null },
      ];

      await setCached(cacheKey, flags, 300);
      return flags;
    },

    async featureFlag(_, { tenantId, key }) {
      const flags = await resolvers.Query.featureFlags(_, { tenantId });
      return flags.find(f => f.key === key) || null;
    },
  },

  Mutation: {
    async saveSiteConfig(_, { tenantId, logo, theme, layout }) {
      try {
        // Check if config exists
        const existingResult = await getPool().query(
          'SELECT id FROM site_configs WHERE tenant_id = $1',
          [tenantId]
        );

        let result;
        if (existingResult.rows.length > 0) {
          // Update existing config
          result = await getPool().query(
            `UPDATE site_configs 
             SET logo = $1, theme = $2, layout = $3, updated_at = NOW()
             WHERE tenant_id = $4
             RETURNING *`,
            [logo, JSON.stringify(theme), JSON.stringify(layout), tenantId]
          );
        } else {
          // Insert new config
          result = await getPool().query(
            `INSERT INTO site_configs (tenant_id, logo, theme, layout, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'draft', NOW(), NOW())
             RETURNING *`,
            [tenantId, logo, JSON.stringify(theme), JSON.stringify(layout)]
          );
        }

        // Invalidate cache
        await deleteCached(`siteConfig:${tenantId}`);

        return formatSiteConfig(result.rows[0]);
      } catch (error) {
        console.error('Error saving site config:', error);
        throw new GraphQLError('Failed to save site configuration', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    async publishSiteConfig(_, { tenantId }) {
      try {
        const result = await getPool().query(
          `UPDATE site_configs 
           SET status = 'published', published_at = NOW(), updated_at = NOW()
           WHERE tenant_id = $1
           RETURNING *`,
          [tenantId]
        );

        if (result.rows.length === 0) {
          throw new GraphQLError('Site configuration not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Invalidate cache
        await deleteCached(`siteConfig:${tenantId}`);

        return formatSiteConfig(result.rows[0]);
      } catch (error) {
        console.error('Error publishing site config:', error);
        throw new GraphQLError('Failed to publish site configuration', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    async updateTheme(_, { tenantId, theme }) {
      try {
        const result = await getPool().query(
          `UPDATE site_configs 
           SET theme = $1, updated_at = NOW()
           WHERE tenant_id = $2
           RETURNING *`,
          [JSON.stringify(theme), tenantId]
        );

        if (result.rows.length === 0) {
          throw new GraphQLError('Site configuration not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Invalidate cache
        await deleteCached(`siteConfig:${tenantId}`);

        return formatSiteConfig(result.rows[0]);
      } catch (error) {
        console.error('Error updating theme:', error);
        throw new GraphQLError('Failed to update theme', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    async updateTenantConfig(_, { tenantId, input }) {
      const updates = [];
      const values = [];
      let valueIndex = 1;

      if (input.name) {
        updates.push(`name = $${valueIndex++}`);
        values.push(input.name);
      }

      if (input.description) {
        updates.push(`description = $${valueIndex++}`);
        values.push(input.description);
      }

      if (input.theme || input.features) {
        const currentResult = await getPool().query(
          'SELECT config FROM tenants WHERE id = $1',
          [tenantId]
        );

        const currentConfig = currentResult.rows[0]?.config || {};
        const newConfig = {
          ...currentConfig,
          theme: input.theme || currentConfig.theme,
          features: input.features || currentConfig.features,
        };

        updates.push(`config = $${valueIndex++}`);
        values.push(JSON.stringify(newConfig));
      }

      if (updates.length === 0) {
        throw new GraphQLError('No updates provided');
      }

      values.push(tenantId);
      const result = await getPool().query(
        `UPDATE tenants SET ${updates.join(', ')}, updated_at = NOW() 
         WHERE id = $${valueIndex} RETURNING *`,
        values
      );

      // Invalidate cache
      await deleteCached(`tenant:${tenantId}`);

      return formatTenantConfig(result.rows[0]);
    },

    async setFeatureFlag(_, { tenantId, key, enabled, value }) {
      // In production, store in database
      // For now, just invalidate cache
      await deleteCached(`features:${tenantId}`);

      return {
        key,
        enabled,
        value,
      };
    },
  },
};

function formatTenantConfig(row) {
  const config = typeof row.config === 'string' ? JSON.parse(row.config) : row.config;

  return {
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    customDomain: row.custom_domain,
    description: config.description,
    logo: config.logo,
    favicon: config.favicon,
    theme: {
      primaryColor: config.theme?.primaryColor || '#0066cc',
      secondaryColor: config.theme?.secondaryColor || '#6c757d',
      fontFamily: config.theme?.fontFamily || 'Inter',
    },
    features: {
      enablePVZ: config.features?.enablePVZ !== false,
      enableMarketplace: config.features?.enableMarketplace !== false,
      enableReviews: config.features?.enableReviews !== false,
    },
  };
}

function formatSiteConfig(row) {
  const theme = typeof row.theme === 'string' ? JSON.parse(row.theme) : row.theme;
  const layout = typeof row.layout === 'string' ? JSON.parse(row.layout) : row.layout;

  // Фильтруем секции от null/undefined и проверяем наличие обязательных полей
  const sections = (layout?.sections || []).filter(s => 
    s && 
    typeof s === 'object' && 
    s.id && 
    s.type && 
    s.config
  );

  return {
    id: row.id,
    tenantId: row.tenant_id,
    logo: row.logo,
    theme: {
      primaryColor: theme?.primaryColor || '#0066cc',
      secondaryColor: theme?.secondaryColor || '#ff6600',
      fontFamily: theme?.fontFamily || 'Inter',
      borderRadius: theme?.borderRadius || 8,
    },
    layout: {
      header: layout?.header || {
        showLogo: true,
        showSearch: true,
        showCart: true,
        menu: [],
      },
      footer: layout?.footer || {
        showNewsletter: true,
        showSocial: true,
        columns: [],
      },
      sections: sections,
    },
    status: row.status || 'draft',
    createdAt: row.created_at?.toISOString(),
    updatedAt: row.updated_at?.toISOString(),
    publishedAt: row.published_at?.toISOString() || null,
  };
}
