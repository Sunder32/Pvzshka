import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient = null;

export async function connectRedis() {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          return new Error('Redis reconnection limit exceeded');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis client connected');
  });

  redisClient.on('reconnecting', () => {
    logger.info('⏳ Redis client reconnecting...');
  });

  await redisClient.connect();
  return redisClient;
}

export function getRedis() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

// Backward compatibility
export const getRedisClient = getRedis;
export const initRedis = connectRedis;

export async function getCached(key) {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
}

export async function setCached(key, value, ttl = 300) {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
}

export async function deleteCached(key) {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete error:', error);
    return false;
  }
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('✅ Redis client closed');
  }
}
