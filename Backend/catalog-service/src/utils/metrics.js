import prom from 'prom-client'

const register = new prom.Registry()

register.setDefaultLabels({
  app: 'catalog-service'
})

prom.collectDefaultMetrics({ register })

export const httpRequestDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

export function createPrometheusMetrics() {
  const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      httpRequestDuration.observe(
        {
          method: req.method,
          route: req.route?.path || req.path,
          status_code: res.statusCode
        },
        duration / 1000
      );
    });
    
    next();
  };

  const metricsEndpoint = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  };

  return { metricsMiddleware, metricsEndpoint };
}

export { register }
