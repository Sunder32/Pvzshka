import { GraphQLError } from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { getPool } from '../config/database.js';
import { getCached, setCached, deleteCached } from '../config/redis.js';

export const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    // Site Configuration
    async siteConfig(_, { tenantId }) {
      const cacheKey = `siteConfig:${tenantId}`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      const result = await getPool().query(
        `SELECT * FROM site_configs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [tenantId]
      );

      if (result.rows.length === 0) {
        // Return default configuration
        return getDefaultSiteConfig(tenantId);
      }

      const config = formatSiteConfig(result.rows[0]);
      await setCached(cacheKey, config, 300);
      return config;
    },

    async siteConfigBySubdomain(_, { subdomain }) {
      const tenantResult = await getPool().query(
        'SELECT id FROM tenants WHERE subdomain = $1',
        [subdomain]
      );

      if (tenantResult.rows.length === 0) {
        throw new GraphQLError('Tenant not found');
      }

      return resolvers.Query.siteConfig(_, { tenantId: tenantResult.rows[0].id });
    },

    // Tenant Configuration
    async tenantConfig(_, { tenantId }) {
      const cacheKey = `tenant:${tenantId}`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      const result = await getPool().query(
        'SELECT * FROM tenants WHERE id = $1',
        [tenantId]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Tenant not found');
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
        throw new GraphQLError('Tenant not found');
      }

      const tenant = formatTenantConfig(result.rows[0]);
      await setCached(cacheKey, tenant, 300);
      return tenant;
    },

    // Complete App Configuration
    async appConfig(_, { tenantId }) {
      const tenant = await resolvers.Query.tenantConfig(_, { tenantId });
      const siteConfig = await resolvers.Query.siteConfig(_, { tenantId });

      return {
        tenant,
        siteConfig
      };
    },

    async appConfigBySubdomain(_, { subdomain }) {
      const tenant = await resolvers.Query.tenantConfigBySubdomain(_, { subdomain });
      const siteConfig = await resolvers.Query.siteConfig(_, { tenantId: tenant.id });

      return {
        tenant,
        siteConfig
      };
    },

    async allTenants() {
      const result = await getPool().query('SELECT * FROM tenants ORDER BY created_at DESC');
      return result.rows.map(formatTenantConfig);
    }
  },

  Mutation: {
    // Save Site Configuration
    async saveSiteConfig(_, { tenantId, logo, theme, layout }) {
      const pool = getPool();

      // Check if configuration exists
      const existing = await pool.query(
        'SELECT id FROM site_configs WHERE tenant_id = $1 AND status = $2',
        [tenantId, 'draft']
      );

      let result;
      if (existing.rows.length > 0) {
        // Update existing draft
        result = await pool.query(
          `UPDATE site_configs 
           SET logo = $1, theme = $2, layout = $3, updated_at = NOW()
           WHERE id = $4
           RETURNING *`,
          [logo, JSON.stringify(theme), JSON.stringify(layout), existing.rows[0].id]
        );
      } else {
        // Create new draft
        result = await pool.query(
          `INSERT INTO site_configs (tenant_id, logo, theme, layout, status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [tenantId, logo, JSON.stringify(theme), JSON.stringify(layout), 'draft']
        );
      }

      await deleteCached(`siteConfig:${tenantId}`);
      return formatSiteConfig(result.rows[0]);
    },

    // Publish Site Configuration
    async publishSiteConfig(_, { tenantId }) {
      const pool = getPool();

      // Mark current published as archived
      await pool.query(
        `UPDATE site_configs 
         SET status = 'archived' 
         WHERE tenant_id = $1 AND status = 'published'`,
        [tenantId]
      );

      // Publish draft
      const result = await pool.query(
        `UPDATE site_configs 
         SET status = 'published', published_at = NOW()
         WHERE tenant_id = $1 AND status = 'draft'
         RETURNING *`,
        [tenantId]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('No draft configuration to publish');
      }

      await deleteCached(`siteConfig:${tenantId}`);
      return formatSiteConfig(result.rows[0]);
    },

    // Update Tenant Settings
    async updateTenantConfig(_, { tenantId, name, description, logo, favicon, customDomain }) {
      const pool = getPool();
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (logo !== undefined) {
        updates.push(`logo = $${paramCount++}`);
        values.push(logo);
      }
      if (favicon !== undefined) {
        updates.push(`favicon = $${paramCount++}`);
        values.push(favicon);
      }
      if (customDomain !== undefined) {
        updates.push(`custom_domain = $${paramCount++}`);
        values.push(customDomain);
      }

      if (updates.length === 0) {
        throw new GraphQLError('No fields to update');
      }

      updates.push(`updated_at = NOW()`);
      values.push(tenantId);

      const result = await pool.query(
        `UPDATE tenants SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      await deleteCached(`tenant:${tenantId}`);
      return formatTenantConfig(result.rows[0]);
    },

    // Update Theme
    async updateTheme(_, { tenantId, theme }) {
      const pool = getPool();

      const result = await pool.query(
        `UPDATE site_configs 
         SET theme = $1, updated_at = NOW()
         WHERE tenant_id = $2 AND status = 'draft'
         RETURNING *`,
        [JSON.stringify(theme), tenantId]
      );

      if (result.rows.length === 0) {
        // Create new draft if none exists
        const newResult = await pool.query(
          `INSERT INTO site_configs (tenant_id, theme, layout, status)
           VALUES ($1, $2, '{"sections": []}', 'draft')
           RETURNING *`,
          [tenantId, JSON.stringify(theme)]
        );
        await deleteCached(`siteConfig:${tenantId}`);
        return formatSiteConfig(newResult.rows[0]);
      }

      await deleteCached(`siteConfig:${tenantId}`);
      return formatSiteConfig(result.rows[0]);
    },

    // Update Features
    async updateFeatures(_, { tenantId, features }) {
      const pool = getPool();

      const result = await pool.query(
        `UPDATE tenants 
         SET features = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(features), tenantId]
      );

      await deleteCached(`tenant:${tenantId}`);
      return formatTenantConfig(result.rows[0]);
    },

    // Create Tenant
    async createTenant(_, { name, subdomain, description }) {
      const pool = getPool();

      // Check subdomain availability
      const existing = await pool.query(
        'SELECT id FROM tenants WHERE subdomain = $1',
        [subdomain]
      );

      if (existing.rows.length > 0) {
        throw new GraphQLError('Subdomain already exists');
      }

      const result = await pool.query(
        `INSERT INTO tenants (name, subdomain, description, theme, features)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          name,
          subdomain,
          description || '',
          JSON.stringify({
            primaryColor: '#0066cc',
            secondaryColor: '#ff6600',
            fontFamily: 'Inter',
            borderRadius: 8
          }),
          JSON.stringify({
            enablePVZ: true,
            enableMarketplace: true,
            enableReviews: true
          })
        ]
      );

      return formatTenantConfig(result.rows[0]);
    }
  }
};

// Helper Functions
function formatSiteConfig(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    logo: row.logo,
    theme: typeof row.theme === 'string' ? JSON.parse(row.theme) : row.theme,
    layout: typeof row.layout === 'string' ? JSON.parse(row.layout) : row.layout,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at
  };
}

function formatTenantConfig(row) {
  const theme = typeof row.theme === 'string' ? JSON.parse(row.theme) : row.theme;
  const features = typeof row.features === 'string' ? JSON.parse(row.features) : row.features;

  return {
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    customDomain: row.custom_domain,
    description: row.description,
    logo: row.logo,
    favicon: row.favicon,
    theme: {
      primaryColor: theme.primaryColor || '#0066cc',
      secondaryColor: theme.secondaryColor || '#ff6600',
      fontFamily: theme.fontFamily || 'Inter',
      borderRadius: theme.borderRadius || 8
    },
    features: {
      enablePVZ: features.enablePVZ ?? true,
      enableMarketplace: features.enableMarketplace ?? true,
      enableReviews: features.enableReviews ?? true
    }
  };
}

function getDefaultSiteConfig(tenantId) {
  return {
    id: 'default',
    tenantId,
    logo: null,
    theme: {
      primaryColor: '#0066cc',
      secondaryColor: '#ff6600',
      fontFamily: 'Inter',
      borderRadius: 8
    },
    layout: {
      header: {
        showLogo: true,
        showSearch: true,
        showCart: true,
        menu: [
          { label: 'Каталог', url: '/catalog', icon: 'grid' },
          { label: 'О нас', url: '/about', icon: 'info' },
          { label: 'Контакты', url: '/contacts', icon: 'phone' }
        ]
      },
      footer: {
        showNewsletter: true,
        showSocial: true,
        columns: [
          {
            title: 'Компания',
            links: [
              { label: 'О нас', url: '/about' },
              { label: 'Контакты', url: '/contacts' }
            ]
          }
        ]
      },
      sections: []
    },
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: null
  };
}
