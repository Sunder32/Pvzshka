package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"logistics-service/internal/adapters"
	"logistics-service/internal/config"
	"logistics-service/internal/database"
	"logistics-service/internal/handlers"
	"logistics-service/internal/repository"
	"logistics-service/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize Redis
	redisClient := database.ConnectRedis(cfg.RedisURL)
	defer redisClient.Close()

	// Initialize logistics providers
	cdekAdapter := adapters.NewCDEKAdapter(cfg.CDEKClientID, cfg.CDEKClientSecret)
	boxberryAdapter := adapters.NewBoxberryAdapter(cfg.BoxberryAPIToken)
	pickpointAdapter := adapters.NewPickPointAdapter(cfg.PickPointAPIKey)

	// Initialize repositories
	pvzRepo := repository.NewPVZRepository(db)
	shipmentRepo := repository.NewShipmentRepository(db)

	// Initialize services
	pvzService := service.NewPVZService(pvzRepo, redisClient, cdekAdapter, boxberryAdapter, pickpointAdapter)
	shipmentService := service.NewShipmentService(shipmentRepo, pvzRepo, cdekAdapter, boxberryAdapter, pickpointAdapter)

	// Initialize handlers
	pvzHandler := handlers.NewPVZHandler(pvzService)
	shipmentHandler := handlers.NewShipmentHandler(shipmentService)
	webhookHandler := handlers.NewWebhookHandler(shipmentService)

	// Setup router
	router := setupRouter(cfg, pvzHandler, shipmentHandler, webhookHandler)

	// Start server
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%s", cfg.Port),
		Handler: router,
	}

	go func() {
		log.Printf("🚀 Logistics Service starting on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}

func setupRouter(cfg *config.Config, pvzHandler *handlers.PVZHandler, shipmentHandler *handlers.ShipmentHandler, webhookHandler *handlers.WebhookHandler) *gin.Engine {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "logistics-service",
			"version": "1.0.0",
		})
	})

	// API v1
	v1 := router.Group("/api/v1")
	{
		// PVZ routes
		pvz := v1.Group("/pvz")
		{
			pvz.GET("", pvzHandler.ListPVZ)
			pvz.GET("/:id", pvzHandler.GetPVZ)
			pvz.POST("/search", pvzHandler.SearchPVZ)
			pvz.POST("/calculate-tariff", pvzHandler.CalculateTariff)
			pvz.POST("/sync", pvzHandler.SyncPVZFromProviders)
		}

		// Shipment routes
		shipments := v1.Group("/shipments")
		{
			shipments.POST("", shipmentHandler.CreateShipment)
			shipments.GET("/:id", shipmentHandler.GetShipment)
			shipments.GET("/track/:trackingNumber", shipmentHandler.TrackShipment)
			shipments.POST("/:id/label", shipmentHandler.GenerateLabel)
			shipments.PUT("/:id/cancel", shipmentHandler.CancelShipment)
		}
	}

	// Webhook routes
	webhooks := router.Group("/webhooks")
	{
		webhooks.POST("/cdek", webhookHandler.HandleCDEKWebhook)
		webhooks.POST("/boxberry", webhookHandler.HandleBoxberryWebhook)
		webhooks.POST("/pickpoint", webhookHandler.HandlePickPointWebhook)
	}

	return router
}
