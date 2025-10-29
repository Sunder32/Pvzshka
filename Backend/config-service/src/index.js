import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { typeDefs } from './schema/newTypeDefs.js';
import { resolvers } from './schema/newResolvers.js';
import { siteRequestTypeDefs } from './graphql/siteRequestSchema.js';
import { siteRequestResolvers } from './graphql/siteRequestResolvers.js';
import { logger } from './utils/logger.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import configRoutes from './routes/config.js';
import tenantsRoutes from './routes/tenants.js';
import suppliersRoutes from './routes/suppliers.js';
import reportsRoutes from './routes/reports.js';
import { initWebSocket, closeAllConnections, getSubscriberStats } from './services/websocket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Initialize dependencies
    await connectDatabase();
    await connectRedis();

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs: [typeDefs, siteRequestTypeDefs],
      resolvers: [resolvers, siteRequestResolvers],
      formatError: (error) => {
        logger.error('GraphQL Error:', error);
        return error;
      },
    });

    await server.start();

    // Middleware
    app.use(cors());
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
    app.use(express.json());

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'config-service',
        version: '1.0.0',
      });
    });

    // WebSocket subscriber stats
    app.get('/api/stats/websocket', (req, res) => {
      res.json({
        success: true,
        data: getSubscriberStats(),
      });
    });

    // Get user's sites
    app.get('/api/sites/my', async (req, res) => {
      try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
          return res.status(401).json({ success: false, error: 'Missing x-user-id header' });
        }

        const { getPool } = await import('./config/database.js');
        const result = await getPool().query(
          'SELECT id, site_name as "siteName", domain, category, is_enabled as "isEnabled", user_id as "userId" FROM sites WHERE user_id = $1 ORDER BY created_at DESC',
          [userId]
        );

        res.json({ success: true, data: result.rows });
      } catch (error) {
        logger.error('Error fetching user sites:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch sites' });
      }
    });

    // Get all sites (for testing)
    app.get('/api/sites/all', async (req, res) => {
      try {
        const { getPool } = await import('./config/database.js');
        const result = await getPool().query(
          `SELECT s.id, s.site_name as "siteName", s.domain as subdomain, s.category, 
                  s.is_enabled as enabled, s.user_id as "userId", sc.theme, sc.logo
           FROM sites s
           LEFT JOIN site_configs sc ON s.id = sc.site_id
           WHERE s.is_enabled = true
           ORDER BY s.created_at DESC
           LIMIT 50`
        );

        res.json({ success: true, data: result.rows });
      } catch (error) {
        logger.error('Error fetching all sites:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch sites' });
      }
    });

    // Invalidate cache for specific site (clear Redis cache)
    app.post('/api/config/invalidate/:siteId', async (req, res) => {
      try {
        const { siteId } = req.params;
        const { getRedisClient } = await import('./config/redis.js');
        const redis = getRedisClient();

        // Удаляем ВСЕ варианты кэша для этого сайта
        const keys = [
          `siteConfig:${siteId}`,           // Старый GraphQL кэш
          `config:site:${siteId}`,          // Новый REST API кэш
          `siteConfig:subdomain:*`,         // Subdomain кэши
          `config:${siteId}`,               // Tenant config кэш
        ];

        let totalCleared = 0;

        for (const keyPattern of keys) {
          if (keyPattern.includes('*')) {
            // Используем SCAN для поиска ключей по паттерну
            const matchingKeys = await redis.keys(keyPattern);
            if (matchingKeys.length > 0) {
              await redis.del(...matchingKeys);
              totalCleared += matchingKeys.length;
              logger.info(`🗑️ Deleted ${matchingKeys.length} cache keys matching ${keyPattern}`);
            }
          } else {
            const deleted = await redis.del(keyPattern);
            if (deleted > 0) {
              totalCleared += deleted;
              logger.info(`🗑️ Deleted cache key: ${keyPattern}`);
            }
          }
        }

        res.json({ 
          success: true, 
          message: `Cache invalidated for site ${siteId}`,
          clearedKeys: totalCleared
        });
      } catch (error) {
        logger.error('Error invalidating cache:', error);
        res.status(500).json({ success: false, error: 'Failed to invalidate cache' });
      }
    });

    // REST API routes for tenant configs
    app.use('/api/config', configRoutes);
    
    // REST API routes for tenants
    app.use('/api/tenants', tenantsRoutes);

    // REST API routes for suppliers
    app.use('/api/suppliers', suppliersRoutes);

    // REST API routes for reports
    app.use('/api/reports', reportsRoutes);

    // GraphQL endpoint
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => {
          const tenantId = req.headers['x-tenant-id'];
          const userId = req.headers['x-user-id'];
          const userRole = req.headers['x-user-role'];
          
          return { 
            tenantId,
            user: userId ? { 
              id: userId, 
              role: userRole || 'tenant' 
            } : null
          };
        },
      })
    );

    // Create HTTP server and initialize WebSocket
    const httpServer = createServer(app);
    initWebSocket(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Config Service running on port ${PORT}`);
      logger.info(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      logger.info(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws/config`);
      logger.info(`🌐 REST API: http://localhost:${PORT}/api/config`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  closeAllConnections();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  closeAllConnections();
  process.exit(0);
});

startServer();
