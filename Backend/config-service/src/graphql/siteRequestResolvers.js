// Resolvers for site requests

import { query, getDatabase } from '../config/database.js';

// Helper to safely parse JSONB tags field
const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (!tags) return [];
  if (typeof tags === 'object') return [];
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const siteRequestResolvers = {
  Query: {
    // Get all site requests (for admin, optionally filtered by status)
    siteRequests: async (_, { status }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const whereClause = status ? 'WHERE status = $1' : '';
      const params = status ? [status] : [];

      const result = await query(
        `SELECT sr.*, u.email, u.name
         FROM site_requests sr
         LEFT JOIN users u ON sr.user_id = u.id
         ${whereClause}
         ORDER BY sr.created_at DESC`,
        params
      );

      return result.rows.map(row => ({
        id: row.id,
        siteName: row.site_name,
        domain: row.domain,
        description: row.description,
        category: row.category,
        email: row.email,
        phone: row.phone,
        expectedProducts: row.expected_products,
        businessType: row.business_type,
        tags: parseTags(row.tags),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        approvedAt: row.approved_at,
        rejectedAt: row.rejected_at,
        rejectionReason: row.rejection_reason,
        userId: row.user_id,
        user: {
          id: row.user_id,
          email: row.email,
          firstName: row.name || '',
          lastName: '',
        },
      }));
    },

    // Get single site request
    siteRequest: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      const result = await query(
        `SELECT sr.*, u.email, u.name
         FROM site_requests sr
         LEFT JOIN users u ON sr.user_id = u.id
         WHERE sr.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Only admin or owner can view
      if (user.role !== 'admin' && user.id !== row.user_id) {
        throw new Error('Forbidden');
      }

      return {
        id: row.id,
        siteName: row.site_name,
        domain: row.domain,
        description: row.description,
        category: row.category,
        email: row.email,
        phone: row.phone,
        expectedProducts: row.expected_products,
        businessType: row.business_type,
        tags: parseTags(row.tags),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        approvedAt: row.approved_at,
        rejectedAt: row.rejected_at,
        rejectionReason: row.rejection_reason,
        userId: row.user_id,
        user: {
          id: row.user_id,
          email: row.email,
          firstName: row.name || '',
          lastName: '',
        },
      };
    },

    // Get current user's site requests
    mySiteRequests: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      const result = await query(
        `SELECT * FROM site_requests
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [user.id]
      );

      return result.rows.map(row => ({
        id: row.id,
        siteName: row.site_name,
        domain: row.domain,
        description: row.description,
        category: row.category,
        email: row.email,
        phone: row.phone,
        expectedProducts: row.expected_products,
        businessType: row.business_type,
        tags: parseTags(row.tags),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        approvedAt: row.approved_at,
        rejectedAt: row.rejected_at,
        rejectionReason: row.rejection_reason,
        userId: row.user_id,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }));
    },

    // Get current user's sites
    mySites: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      const result = await query(
        `SELECT s.*
         FROM sites s
         WHERE s.user_id = $1
         ORDER BY s.created_at DESC`,
        [user.id]
      );

      return result.rows.map(row => ({
        id: row.id,
        siteName: row.site_name,
        domain: row.domain,
        status: row.status,
        category: row.category,
        createdAt: row.created_at,
        lastModified: row.updated_at,
        isEnabled: row.is_enabled,
        userId: row.user_id,
        user: {
          id: user.id,
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        },
        stats: {
          products: 0,
          orders: 0,
          visitors: 0,
        },
      }));
    },

    // Get all sites (admin only)
    allSites: async (_, __, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const result = await query(
        `SELECT s.*, u.email, u.name
         FROM sites s
         LEFT JOIN users u ON s.user_id = u.id
         ORDER BY s.created_at DESC`
      );

      return result.rows.map(row => ({
        id: row.id,
        siteName: row.site_name,
        domain: row.domain,
        status: row.status,
        category: row.category,
        createdAt: row.created_at,
        lastModified: row.updated_at,
        isEnabled: row.is_enabled,
        userId: row.user_id,
        user: {
          id: row.user_id,
          email: row.email || '',
          firstName: row.name || '',
          lastName: '',
        },
        stats: {
          products: 0,
          orders: 0,
          visitors: 0,
        },
      }));
    },
  },

  Mutation: {
    // Create new site request
    createSiteRequest: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      // Check if domain is already taken
      const existingDomain = await query(
        `SELECT id FROM site_requests WHERE domain = $1
         UNION
         SELECT id FROM sites WHERE domain = $1`,
        [input.domain]
      );

      if (existingDomain.rows.length > 0) {
        throw new Error('Domain already taken');
      }

      const result = await query(
        `INSERT INTO site_requests (
          site_name, domain, description, category, email, phone,
          expected_products, business_type, tags, user_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, 'pending')
        RETURNING *`,
        [
          input.siteName,
          input.domain,
          input.description,
          input.category,
          input.email,
          input.phone,
          input.expectedProducts,
          input.businessType,
          JSON.stringify(input.tags || []),
          user.id,
        ]
      );

      const row = result.rows[0];

      return {
        id: row.id,
        siteName: row.site_name,
        domain: row.domain,
        description: row.description,
        category: row.category,
        email: row.email,
        phone: row.phone,
        expectedProducts: row.expected_products,
        businessType: row.business_type,
        tags: parseTags(row.tags),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        userId: row.user_id,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.name || '',
          lastName: '',
        },
      };
    },

    // Approve site request (admin only)
    approveSiteRequest: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      // Get request details
      const requestResult = await query(
        `SELECT * FROM site_requests WHERE id = $1`,
        [id]
      );

      if (requestResult.rows.length === 0) {
        throw new Error('Request not found');
      }

      const request = requestResult.rows[0];

      if (request.status !== 'pending') {
        throw new Error('Request already processed');
      }

      // Start transaction
      const pool = getDatabase();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Update request status
        await client.query(
          `UPDATE site_requests
           SET status = 'approved', approved_at = NOW(), updated_at = NOW()
           WHERE id = $1`,
          [id]
        );

        // Create site
        await client.query(
          `INSERT INTO sites (
            site_name, domain, category, user_id, status, is_enabled
          ) VALUES ($1, $2, $3, $4, 'active', true)`,
          [request.site_name, request.domain, request.category, request.user_id]
        );

        await client.query('COMMIT');

        // Get updated request
        const updatedResult = await query(
          `SELECT * FROM site_requests WHERE id = $1`,
          [id]
        );

        const row = updatedResult.rows[0];

        return {
          id: row.id,
          siteName: row.site_name,
          domain: row.domain,
          description: row.description,
          category: row.category,
          email: row.email,
          phone: row.phone,
          expectedProducts: row.expected_products,
          businessType: row.business_type,
          tags: parseTags(row.tags),
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          approvedAt: row.approved_at,
          userId: row.user_id,
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },

    // Reject site request (admin only)
    rejectSiteRequest: async (_, { id, reason }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const result = await query(
        `UPDATE site_requests
         SET status = 'rejected', rejection_reason = $1, rejected_at = NOW(), updated_at = NOW()
         WHERE id = $2 AND status = 'pending'
         RETURNING *`,
        [reason, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Request not found or already processed');
      }

      const row = result.rows[0];

      return {
        id: row.id,
        siteName: row.site_name,
        domain: row.domain,
        description: row.description,
        category: row.category,
        email: row.email,
        phone: row.phone,
        expectedProducts: row.expected_products,
        businessType: row.business_type,
        tags: parseTags(row.tags),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        rejectedAt: row.rejected_at,
        rejectionReason: row.rejection_reason,
        userId: row.user_id,
      };
    },

    // Toggle site enabled status
    toggleSite: async (_, { id, isEnabled }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      // Check ownership
      const siteResult = await query(
        `SELECT * FROM sites WHERE id = $1`,
        [id]
      );

      if (siteResult.rows.length === 0) {
        throw new Error('Site not found');
      }

      const site = siteResult.rows[0];

      if (user.role !== 'admin' && user.id !== site.user_id) {
        throw new Error('Forbidden');
      }

      const result = await query(
        `UPDATE sites
         SET is_enabled = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [isEnabled, id]
      );

      const row = result.rows[0];

      return {
        id: row.id,
        siteName: row.site_name,
        domain: row.domain,
        status: row.status,
        category: row.category,
        createdAt: row.created_at,
        lastModified: row.updated_at,
        isEnabled: row.is_enabled,
        userId: row.user_id,
      };
    },

    // Delete site
    deleteSite: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      // Check ownership
      const siteResult = await query(
        `SELECT * FROM sites WHERE id = $1`,
        [id]
      );

      if (siteResult.rows.length === 0) {
        throw new Error('Site not found');
      }

      const site = siteResult.rows[0];

      if (user.role !== 'admin' && user.id !== site.user_id) {
        throw new Error('Forbidden');
      }

      await query(
        `DELETE FROM sites WHERE id = $1`,
        [id]
      );

      return true;
    },
  },
};


