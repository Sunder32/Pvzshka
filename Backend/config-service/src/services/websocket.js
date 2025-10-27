import { WebSocketServer } from 'ws'
import { getRedis } from '../config/redis.js'
import { logger } from '../utils/logger.js'

let wss = null
const subscribers = new Map() // tenantId -> Set of WebSocket connections

/**
 * Инициализация WebSocket сервера
 * @param {Object} server - HTTP сервер
 */
export function initWebSocket(server) {
  wss = new WebSocketServer({ 
    server,
    path: '/ws/config',
  })

  wss.on('connection', (ws, req) => {
    logger.info('New WebSocket connection established')

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString())
        handleWebSocketMessage(ws, data)
      } catch (error) {
        logger.error('Error processing WebSocket message:', error)
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format',
        }))
      }
    })

    ws.on('close', () => {
      // Удаляем из всех подписок
      for (const [tenantId, connections] of subscribers.entries()) {
        connections.delete(ws)
        if (connections.size === 0) {
          subscribers.delete(tenantId)
        }
      }
      logger.info('WebSocket connection closed')
    })

    ws.on('error', (error) => {
      logger.error('WebSocket error:', error)
    })

    // Отправляем приветственное сообщение
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connected to config-service',
      timestamp: new Date().toISOString(),
    }))
  })

  // Подписываемся на Redis Pub/Sub для уведомлений
  subscribeToConfigUpdates()

  logger.info('WebSocket server initialized on path /ws/config')
}

/**
 * Обработка сообщений от клиента
 * @param {WebSocket} ws - WebSocket соединение
 * @param {Object} data - Данные сообщения
 */
function handleWebSocketMessage(ws, data) {
  const { type, tenantId } = data

  switch (type) {
    case 'subscribe':
      if (!tenantId) {
        ws.send(JSON.stringify({
          type: 'error',
          error: 'tenantId is required for subscription',
        }))
        return
      }

      // Добавляем подписку
      if (!subscribers.has(tenantId)) {
        subscribers.set(tenantId, new Set())
      }
      subscribers.get(tenantId).add(ws)

      ws.send(JSON.stringify({
        type: 'subscribed',
        tenantId,
        message: `Subscribed to config updates for tenant: ${tenantId}`,
      }))

      logger.info(`Client subscribed to tenant: ${tenantId}`)
      break

    case 'unsubscribe':
      if (!tenantId) {
        ws.send(JSON.stringify({
          type: 'error',
          error: 'tenantId is required for unsubscription',
        }))
        return
      }

      // Удаляем подписку
      const connections = subscribers.get(tenantId)
      if (connections) {
        connections.delete(ws)
        if (connections.size === 0) {
          subscribers.delete(tenantId)
        }
      }

      ws.send(JSON.stringify({
        type: 'unsubscribed',
        tenantId,
        message: `Unsubscribed from tenant: ${tenantId}`,
      }))

      logger.info(`Client unsubscribed from tenant: ${tenantId}`)
      break

    case 'ping':
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString(),
      }))
      break

    default:
      ws.send(JSON.stringify({
        type: 'error',
        error: `Unknown message type: ${type}`,
      }))
  }
}

/**
 * Подписка на Redis Pub/Sub для получения уведомлений об обновлениях
 */
async function subscribeToConfigUpdates() {
  try {
    const redis = getRedis()
    const subscriber = redis.duplicate()

    await subscriber.connect()

    await subscriber.subscribe('config:updated', (message) => {
      try {
        const update = JSON.parse(message)
        const { tenantId, version, updatedAt } = update

        // Отправляем уведомление всем подписчикам этого магазина
        const connections = subscribers.get(tenantId)
        if (connections && connections.size > 0) {
          const notification = JSON.stringify({
            type: 'config:updated',
            tenantId,
            version,
            updatedAt,
            message: 'Configuration has been updated',
          })

          let sentCount = 0
          for (const ws of connections) {
            if (ws.readyState === ws.OPEN) {
              ws.send(notification)
              sentCount++
            }
          }

          logger.info(`Config update notification sent to ${sentCount} clients for tenant: ${tenantId}`)
        }
      } catch (error) {
        logger.error('Error processing Redis pub/sub message:', error)
      }
    })

    logger.info('Subscribed to Redis channel: config:updated')
  } catch (error) {
    logger.error('Error subscribing to Redis pub/sub:', error)
  }
}

/**
 * Отправить уведомление всем подписчикам магазина
 * @param {string} tenantId - ID магазина
 * @param {Object} notification - Данные уведомления
 */
export function notifySubscribers(tenantId, notification) {
  const connections = subscribers.get(tenantId)
  
  if (!connections || connections.size === 0) {
    return
  }

  const message = JSON.stringify({
    type: 'notification',
    tenantId,
    ...notification,
    timestamp: new Date().toISOString(),
  })

  let sentCount = 0
  for (const ws of connections) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message)
      sentCount++
    }
  }

  logger.info(`Notification sent to ${sentCount} clients for tenant: ${tenantId}`)
}

/**
 * Получить количество активных подписчиков
 * @returns {Object} - Статистика подписчиков
 */
export function getSubscriberStats() {
  const stats = {
    totalConnections: 0,
    tenants: [],
  }

  for (const [tenantId, connections] of subscribers.entries()) {
    const activeConnections = Array.from(connections).filter(
      ws => ws.readyState === ws.OPEN
    ).length

    stats.totalConnections += activeConnections
    stats.tenants.push({
      tenantId,
      connections: activeConnections,
    })
  }

  return stats
}

/**
 * Закрыть все WebSocket соединения
 */
export function closeAllConnections() {
  if (wss) {
    wss.clients.forEach((ws) => {
      ws.close()
    })
    wss.close()
    logger.info('All WebSocket connections closed')
  }
}
