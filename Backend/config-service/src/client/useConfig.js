import { useState, useEffect, useCallback, useRef } from 'react';
import ConfigServiceClient from '../client/configClient';

/**
 * React хук для работы с конфигурацией магазина
 * @param {string} tenantId - ID магазина
 * @param {Object} options - Опции (baseUrl, autoRefresh, refreshInterval)
 * @returns {Object} - { config, loading, error, updateConfig, refetch, version }
 */
export function useConfig(tenantId, options = {}) {
  const {
    baseUrl = process.env.REACT_APP_CONFIG_SERVICE_URL || 'http://localhost:4000',
    autoRefresh = false,
    refreshInterval = 60000, // 1 минута
    enableWebSocket = true,
  } = options;

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);
  
  const clientRef = useRef(null);
  const refreshTimerRef = useRef(null);

  // Инициализация клиента
  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = new ConfigServiceClient(baseUrl);
    }
    
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [baseUrl]);

  // Получить конфиг
  const fetchConfig = useCallback(async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await clientRef.current.getConfig(tenantId);
      setConfig(data);
      setVersion(data.version || 0);
    } catch (err) {
      setError(err);
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Обновить конфиг
  const updateConfig = useCallback(async (updates) => {
    if (!tenantId) return;

    try {
      setError(null);
      
      const data = await clientRef.current.updateConfig(tenantId, updates);
      setConfig(data);
      setVersion(data.version || 0);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error updating config:', err);
      throw err;
    }
  }, [tenantId]);

  // Частичное обновление конфига
  const patchConfig = useCallback(async (updates) => {
    if (!tenantId) return;

    try {
      setError(null);
      
      const data = await clientRef.current.patchConfig(tenantId, updates);
      setConfig(data);
      setVersion(data.version || 0);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error patching config:', err);
      throw err;
    }
  }, [tenantId]);

  // Начальная загрузка
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // WebSocket подписка на обновления
  useEffect(() => {
    if (!tenantId || !enableWebSocket) return;

    const handleUpdate = (message) => {
      console.log('Config updated via WebSocket:', message);
      
      // Перезагружаем конфиг если версия изменилась
      if (message.version > version) {
        fetchConfig();
      }
    };

    clientRef.current.subscribeToUpdates(tenantId, handleUpdate);

    return () => {
      clientRef.current.unsubscribeFromUpdates(tenantId, handleUpdate);
    };
  }, [tenantId, version, enableWebSocket, fetchConfig]);

  // Автообновление по таймеру
  useEffect(() => {
    if (!autoRefresh || !tenantId) return;

    refreshTimerRef.current = setInterval(() => {
      fetchConfig();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, tenantId, refreshInterval, fetchConfig]);

  return {
    config,
    loading,
    error,
    version,
    updateConfig,
    patchConfig,
    refetch: fetchConfig,
  };
}

/**
 * React хук для получения списка всех магазинов
 * @param {Object} filters - Фильтры (status, tier, limit, offset)
 * @returns {Object} - { tenants, loading, error, refetch }
 */
export function useTenants(filters = {}) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const clientRef = useRef(null);

  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = new ConfigServiceClient();
    }
  }, []);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await clientRef.current.getAllTenants(filters);
      setTenants(data);
    } catch (err) {
      setError(err);
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return {
    tenants,
    loading,
    error,
    refetch: fetchTenants,
  };
}

/**
 * React хук для создания нового магазина
 * @returns {Object} - { createTenant, creating, error }
 */
export function useCreateTenant() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  
  const clientRef = useRef(null);

  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = new ConfigServiceClient();
    }
  }, []);

  const createTenant = useCallback(async (tenantData) => {
    try {
      setCreating(true);
      setError(null);
      
      const data = await clientRef.current.createTenant(tenantData);
      return data;
    } catch (err) {
      setError(err);
      console.error('Error creating tenant:', err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  return {
    createTenant,
    creating,
    error,
  };
}

/**
 * React хук для проверки версии конфига
 * @param {string} tenantId - ID магазина
 * @param {number} checkInterval - Интервал проверки в мс (по умолчанию 30 секунд)
 * @returns {Object} - { currentVersion, hasUpdate, checkVersion }
 */
export function useConfigVersion(tenantId, checkInterval = 30000) {
  const [currentVersion, setCurrentVersion] = useState(0);
  const [hasUpdate, setHasUpdate] = useState(false);
  
  const clientRef = useRef(null);
  const timerRef = useRef(null);
  const lastVersionRef = useRef(0);

  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = new ConfigServiceClient();
    }
  }, []);

  const checkVersion = useCallback(async () => {
    if (!tenantId) return;

    try {
      const versionData = await clientRef.current.getConfigVersion(tenantId);
      const newVersion = versionData.version;
      
      setCurrentVersion(newVersion);
      
      if (lastVersionRef.current > 0 && newVersion > lastVersionRef.current) {
        setHasUpdate(true);
      }
      
      lastVersionRef.current = newVersion;
    } catch (err) {
      console.error('Error checking version:', err);
    }
  }, [tenantId]);

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

  useEffect(() => {
    if (!tenantId || !checkInterval) return;

    timerRef.current = setInterval(checkVersion, checkInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [tenantId, checkInterval, checkVersion]);

  const resetUpdateFlag = useCallback(() => {
    setHasUpdate(false);
  }, []);

  return {
    currentVersion,
    hasUpdate,
    checkVersion,
    resetUpdateFlag,
  };
}

export default useConfig;
