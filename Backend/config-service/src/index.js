import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { typeDefs } from './schema/newTypeDefs.js';
import { resolvers } from './schema/newResolvers.js';
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
      typeDefs,
      resolvers,
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
          return { tenantId };
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
