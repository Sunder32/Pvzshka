from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.kafka.consumer import start_kafka_consumer, stop_kafka_consumer
from app.routes import email, sms, push

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Notification Service...")
    await start_kafka_consumer()
    yield
    # Shutdown
    logger.info("Shutting down Notification Service...")
    await stop_kafka_consumer()

app = FastAPI(
    title="Notification Service",
    description="Multi-channel notification service for marketplace platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "notification-service",
        "version": "1.0.0"
    }

# Include routers
app.include_router(email.router, prefix="/api/v1/email", tags=["email"])
app.include_router(sms.router, prefix="/api/v1/sms", tags=["sms"])
app.include_router(push.router, prefix="/api/v1/push", tags=["push"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
