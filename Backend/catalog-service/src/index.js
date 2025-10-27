import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { createPrometheusMetrics } from './utils/metrics.js';
import { logger } from './utils/logger.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { connectElasticsearch } from './config/elasticsearch.js';
import { initKafka } from './config/kafka.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import { errorHandler } from './middleware/errorHandler.js';
import { tenantMiddleware } from './middleware/tenant.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tenant context
app.use(tenantMiddleware);

// Prometheus metrics
const { metricsMiddleware, metricsEndpoint } = createPrometheusMetrics();
app.use(metricsMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'catalog-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/metrics', metricsEndpoint);

// API Routes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to dependencies
    await connectDatabase();
    await connectRedis();
    await connectElasticsearch();
    await initKafka();

    app.listen(PORT, () => {
      logger.info(`🚀 Catalog Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();

export default app;
