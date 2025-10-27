export const createLogger = (serviceName) => {
  return {
    info: (...args) => console.log(`[${serviceName}] INFO:`, ...args),
    error: (...args) => console.error(`[${serviceName}] ERROR:`, ...args),
    warn: (...args) => console.warn(`[${serviceName}] WARN:`, ...args),
    debug: (...args) => console.debug(`[${serviceName}] DEBUG:`, ...args),
  };
};

// Экспорт logger по умолчанию для config-service
export const logger = createLogger('config-service');

export default createLogger;
