#!/bin/bash

# Wait for Kong to be ready
echo "Waiting for Kong Admin API to be ready..."
until curl -s http://localhost:8001/status > /dev/null 2>&1; do
    sleep 2
done

echo "Kong is ready. Configuring services and routes..."

# ============================================
# AUTH SERVICE
# ============================================
echo "Configuring Auth Service..."
curl -i -X POST http://localhost:8001/services \
  --data name=auth-service \
  --data url='http://auth-service:8080'

curl -i -X POST http://localhost:8001/services/auth-service/routes \
  --data 'paths[]=/api/v1/auth' \
  --data 'paths[]=/api/v1/users' \
  --data name=auth-routes

# Add JWT plugin
curl -i -X POST http://localhost:8001/services/auth-service/plugins \
  --data name=jwt

# Add rate limiting
curl -i -X POST http://localhost:8001/services/auth-service/plugins \
  --data name=rate-limiting \
  --data config.minute=100 \
  --data config.policy=redis \
  --data config.redis_host=redis \
  --data config.redis_port=6379

# Add CORS
curl -i -X POST http://localhost:8001/services/auth-service/plugins \
  --data name=cors \
  --data config.origins='*' \
  --data config.methods=GET,POST,PUT,DELETE,PATCH,OPTIONS \
  --data config.headers=Accept,Authorization,Content-Type,X-Tenant-ID

# ============================================
# CATALOG SERVICE
# ============================================
echo "Configuring Catalog Service..."
curl -i -X POST http://localhost:8001/services \
  --data name=catalog-service \
  --data url='http://catalog-service:3000'

curl -i -X POST http://localhost:8001/services/catalog-service/routes \
  --data 'paths[]=/api/v1/products' \
  --data 'paths[]=/api/v1/categories' \
  --data name=catalog-routes

curl -i -X POST http://localhost:8001/services/catalog-service/plugins \
  --data name=jwt

curl -i -X POST http://localhost:8001/services/catalog-service/plugins \
  --data name=rate-limiting \
  --data config.minute=200 \
  --data config.policy=redis \
  --data config.redis_host=redis

curl -i -X POST http://localhost:8001/services/catalog-service/plugins \
  --data name=cors

# ============================================
# ORDER SERVICE
# ============================================
echo "Configuring Order Service..."
curl -i -X POST http://localhost:8001/services \
  --data name=order-service \
  --data url='http://order-service:8081'

curl -i -X POST http://localhost:8001/services/order-service/routes \
  --data 'paths[]=/api/v1/orders' \
  --data name=order-routes

curl -i -X POST http://localhost:8001/services/order-service/plugins \
  --data name=jwt

curl -i -X POST http://localhost:8001/services/order-service/plugins \
  --data name=rate-limiting \
  --data config.minute=100 \
  --data config.policy=redis

curl -i -X POST http://localhost:8001/services/order-service/plugins \
  --data name=cors

# ============================================
# PAYMENT SERVICE
# ============================================
echo "Configuring Payment Service..."
curl -i -X POST http://localhost:8001/services \
  --data name=payment-service \
  --data url='http://payment-service:3002'

curl -i -X POST http://localhost:8001/services/payment-service/routes \
  --data 'paths[]=/api/v1/payments' \
  --data 'paths[]=/webhooks/yookassa' \
  --data name=payment-routes

curl -i -X POST http://localhost:8001/services/payment-service/plugins \
  --data name=rate-limiting \
  --data config.minute=50 \
  --data config.policy=redis

curl -i -X POST http://localhost:8001/services/payment-service/plugins \
  --data name=cors

# ============================================
# LOGISTICS SERVICE
# ============================================
echo "Configuring Logistics Service..."
curl -i -X POST http://localhost:8001/services \
  --data name=logistics-service \
  --data url='http://logistics-service:8082'

curl -i -X POST http://localhost:8001/services/logistics-service/routes \
  --data 'paths[]=/api/v1/pvz' \
  --data 'paths[]=/api/v1/shipments' \
  --data 'paths[]=/webhooks/cdek' \
  --data 'paths[]=/webhooks/boxberry' \
  --data name=logistics-routes

curl -i -X POST http://localhost:8001/services/logistics-service/plugins \
  --data name=jwt

curl -i -X POST http://localhost:8001/services/logistics-service/plugins \
  --data name=rate-limiting \
  --data config.minute=100 \
  --data config.policy=redis

curl -i -X POST http://localhost:8001/services/logistics-service/plugins \
  --data name=cors

# ============================================
# CONFIG SERVICE
# ============================================
echo "Configuring Config Service..."
curl -i -X POST http://localhost:8001/services \
  --data name=config-service \
  --data url='http://config-service:4000'

curl -i -X POST http://localhost:8001/services/config-service/routes \
  --data 'paths[]=/graphql' \
  --data name=config-routes

curl -i -X POST http://localhost:8001/services/config-service/plugins \
  --data name=rate-limiting \
  --data config.minute=200 \
  --data config.policy=redis

curl -i -X POST http://localhost:8001/services/config-service/plugins \
  --data name=cors

echo "✅ Kong configuration completed!"
