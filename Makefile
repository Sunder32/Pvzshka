.PHONY: help start stop restart logs status clean build-all

help:
	@echo "========================================="
	@echo " Multi-Tenant SaaS Platform - Commands"
	@echo "========================================="
	@echo ""
	@echo "make start        - Запустить все сервисы"
	@echo "make stop         - Остановить все сервисы"
	@echo "make restart      - Перезапустить все сервисы"
	@echo "make logs         - Показать логи всех сервисов"
	@echo "make status       - Показать статус сервисов"
	@echo "make clean        - Остановить и удалить volumes"
	@echo "make build-all    - Пересобрать все образы"
	@echo ""
	@echo "Отдельные компоненты:"
	@echo "make infra        - Запустить только инфраструктуру"
	@echo "make services     - Запустить только микросервисы"
	@echo "make frontend     - Запустить только фронтенд"
	@echo ""

start:
	@echo "🚀 Запуск всех сервисов..."
	docker-compose up -d
	@echo ""
	@echo "✅ Проект запущен!"
	@echo ""
	@echo "📱 ФРОНТЕНД:"
	@echo "   Web App:        http://localhost:3003"
	@echo "   Tenant Admin:   http://localhost:3004"
	@echo "   Global Admin:   http://localhost:3005"
	@echo ""
	@echo "🔌 API:"
	@echo "   Catalog API:    http://localhost:3000/api/v1/products"
	@echo "   API Gateway:    http://localhost:8000"
	@echo ""
	@echo "📊 МОНИТОРИНГ:"
	@echo "   Grafana:        http://localhost:3001 (admin/admin)"
	@echo "   Jaeger:         http://localhost:16686"
	@echo ""

stop:
	@echo "🛑 Остановка всех сервисов..."
	docker-compose down
	@echo "✅ Все сервисы остановлены"

restart: stop start

logs:
	docker-compose logs -f

status:
	@echo "📊 Статус всех сервисов:"
	docker-compose ps

clean:
	@echo "🧹 Очистка всех данных..."
	docker-compose down -v
	@echo "✅ Все данные удалены"

build-all:
	@echo "🔨 Пересборка всех образов..."
	docker-compose build
	@echo "✅ Все образы пересобраны"

infra:
	@echo "🏗️ Запуск инфраструктуры..."
	docker-compose up -d postgres redis elasticsearch kafka zookeeper kong jaeger prometheus grafana minio
	@echo "✅ Инфраструктура запущена"

services:
	@echo "⚙️ Запуск микросервисов..."
	docker-compose up -d catalog-service payment-service config-service
	@echo "✅ Микросервисы запущены"

frontend:
	@echo "💻 Запуск фронтенд приложений..."
	docker-compose up -d web-app tenant-admin global-admin
	@echo "✅ Фронтенд запущен"
