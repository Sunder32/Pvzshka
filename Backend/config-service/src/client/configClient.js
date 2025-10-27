/**
 * Config Service Client Library
 * Для работы с динамическими конфигурациями магазинов
 */

export class ConfigServiceClient {
  constructor(baseUrl = 'http://localhost:4000', options = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      timeout: 10000,
      retries: 3,
      ...options,
    };
    this.ws = null;
    this.subscribers = new Map();
  }

  /**
   * Получить конфигурацию магазина
   * @param {string} tenantId - ID магазина
   * @returns {Promise<Object>} - Конфигурация
   */
  async getConfig(tenantId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/config/${tenantId}`, {
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
        throw new Error(result.error || 'Failed to fetch config');
      }

      return result.data;
    } catch (error) {
      console.error(`Error fetching config for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить конфигурацию магазина
   * @param {string} tenantId - ID магазина
   * @param {Object} updates - Обновления конфига
   * @returns {Promise<Object>} - Обновленная конфигурация
   */
  async updateConfig(tenantId, updates) {
    try {
      const response = await fetch(`${this.baseUrl}/api/config/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update config');
      }

      return result.data;
    } catch (error) {
      console.error(`Error updating config for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Частичное обновление конфигурации
   * @param {string} tenantId - ID магазина
   * @param {Object} updates - Частичные обновления
   * @returns {Promise<Object>} - Обновленная конфигурация
   */
  async patchConfig(tenantId, updates) {
    try {
      const response = await fetch(`${this.baseUrl}/api/config/${tenantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to patch config');
      }

      return result.data;
    } catch (error) {
      console.error(`Error patching config for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Получить версию конфигурации
   * @param {string} tenantId - ID магазина
   * @returns {Promise<Object>} - Версия и дата обновления
   */
  async getConfigVersion(tenantId) {
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
      console.error(`Error fetching version for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Создать новый магазин
   * @param {Object} tenantData - Данные магазина
   * @returns {Promise<Object>} - Созданный магазин
   */
  async createTenant(tenantData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create tenant');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  /**
   * Получить список всех магазинов
   * @param {Object} filters - Фильтры (status, tier, limit, offset)
   * @returns {Promise<Array>} - Список магазинов
   */
  async getAllTenants(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${this.baseUrl}/api/config?${params}`, {
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
        throw new Error(result.error || 'Failed to fetch tenants');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching all tenants:', error);
      throw error;
    }
  }

  /**
   * Обновить статус магазина
   * @param {string} tenantId - ID магазина
   * @param {string} status - Новый статус (active, suspended, deleted)
   * @returns {Promise<Object>} - Обновленный магазин
   */
  async updateStatus(tenantId, status) {
    try {
      const response = await fetch(`${this.baseUrl}/api/config/${tenantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update status');
      }

      return result.data;
    } catch (error) {
      console.error(`Error updating status for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Обновить тарифный план магазина
   * @param {string} tenantId - ID магазина
   * @param {string} tier - Новый тариф (free, basic, premium, enterprise)
   * @returns {Promise<Object>} - Обновленный магазин
   */
  async updateTier(tenantId, tier) {
    try {
      const response = await fetch(`${this.baseUrl}/api/config/${tenantId}/tier`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update tier');
      }

      return result.data;
    } catch (error) {
      console.error(`Error updating tier for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Подписаться на обновления конфигурации через WebSocket
   * @param {string} tenantId - ID магазина
   * @param {Function} callback - Callback для обработки обновлений
   */
  subscribeToUpdates(tenantId, callback) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connectWebSocket();
    }

    // Ждем подключения
    const subscribe = () => {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        tenantId,
      }));

      // Сохраняем callback
      if (!this.subscribers.has(tenantId)) {
        this.subscribers.set(tenantId, new Set());
      }
      this.subscribers.get(tenantId).add(callback);
    };

    if (this.ws.readyState === WebSocket.OPEN) {
      subscribe();
    } else {
      this.ws.addEventListener('open', subscribe, { once: true });
    }
  }

  /**
   * Отписаться от обновлений конфигурации
   * @param {string} tenantId - ID магазина
   * @param {Function} callback - Callback для удаления
   */
  unsubscribeFromUpdates(tenantId, callback) {
    const callbacks = this.subscribers.get(tenantId);
    if (callbacks) {
      callbacks.delete(callback);
      
      if (callbacks.size === 0) {
        this.subscribers.delete(tenantId);
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            tenantId,
          }));
        }
      }
    }
  }

  /**
   * Установить WebSocket соединение
   */
  connectWebSocket() {
    const wsUrl = this.baseUrl.replace(/^http/, 'ws') + '/ws/config';
    this.ws = new WebSocket(wsUrl);

    this.ws.addEventListener('open', () => {
      console.log('WebSocket connected to config-service');
    });

    this.ws.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.ws.addEventListener('close', () => {
      console.log('WebSocket disconnected from config-service');
      
      // Переподключение через 5 секунд
      setTimeout(() => {
        if (this.subscribers.size > 0) {
          console.log('Reconnecting WebSocket...');
          this.connectWebSocket();
        }
      }, 5000);
    });

    this.ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Обработка WebSocket сообщений
   * @param {Object} message - Сообщение
   */
  handleWebSocketMessage(message) {
    const { type, tenantId } = message;

    if (type === 'config:updated') {
      const callbacks = this.subscribers.get(tenantId);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(message);
          } catch (error) {
            console.error('Error in subscriber callback:', error);
          }
        });
      }
    }
  }

  /**
   * Закрыть WebSocket соединение
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }

  /**
   * Получить статус подключения
   * @returns {string} - Статус (CONNECTING, OPEN, CLOSING, CLOSED)
   */
  getConnectionStatus() {
    if (!this.ws) return 'CLOSED';
    
    const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    return states[this.ws.readyState];
  }
}

export default ConfigServiceClient;
