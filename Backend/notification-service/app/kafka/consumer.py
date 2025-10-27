from aiokafka import AIOKafkaConsumer
import json
import logging
import asyncio

from app.config import settings
from app.services.email_service import email_service
from app.services.sms_service import sms_service
from app.services.push_service import push_service

logger = logging.getLogger(__name__)

consumer = None

async def start_kafka_consumer():
    global consumer
    
    consumer = AIOKafkaConsumer(
        'order.created',
        'order.status.changed',
        'order.shipped',
        'payment.completed',
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        group_id=settings.KAFKA_GROUP_ID,
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    await consumer.start()
    logger.info("Kafka consumer started")
    
    # Start consuming in background
    asyncio.create_task(consume_messages())

async def consume_messages():
    global consumer
    
    try:
        async for message in consumer:
            topic = message.topic
            data = message.value
            
            logger.info(f"Received message from {topic}: {data}")
            
            try:
                await process_message(topic, data)
            except Exception as e:
                logger.error(f"Error processing message: {e}")
    
    except Exception as e:
        logger.error(f"Kafka consumer error: {e}")

async def process_message(topic: str, data: dict):
    """Process Kafka messages and send notifications"""
    
    if topic == 'order.created':
        await handle_order_created(data)
    elif topic == 'order.status.changed':
        await handle_order_status_changed(data)
    elif topic == 'order.shipped':
        await handle_order_shipped(data)
    elif topic == 'payment.completed':
        await handle_payment_completed(data)

async def handle_order_created(data: dict):
    """Send order confirmation notifications"""
    # TODO: Get user email/phone from database
    user_email = "user@example.com"  # Replace with actual lookup
    
    await email_service.send_email(
        to_email=user_email,
        subject="Заказ подтвержден",
        template="order_confirmation",
        variables={
            "order_number": data.get("order_number"),
            "total": data.get("total"),
        }
    )
    
    logger.info(f"Order confirmation sent for {data.get('order_number')}")

async def handle_order_status_changed(data: dict):
    """Send order status update notifications"""
    new_status = data.get("new_status")
    
    if new_status == "DELIVERED":
        user_email = "user@example.com"  # Replace with actual lookup
        
        await email_service.send_email(
            to_email=user_email,
            subject="Заказ доставлен",
            template="order_delivered",
            variables={
                "order_number": data.get("order_number"),
            }
        )

async def handle_order_shipped(data: dict):
    """Send shipment tracking notifications"""
    user_email = "user@example.com"  # Replace with actual lookup
    user_phone = "+79001234567"  # Replace with actual lookup
    
    # Send email
    await email_service.send_email(
        to_email=user_email,
        subject="Заказ отправлен",
        template="order_shipped",
        variables={
            "order_number": data.get("order_number"),
            "tracking_number": data.get("tracking_number"),
        }
    )
    
    # Send SMS
    await sms_service.send_sms(
        to_phone=user_phone,
        template="order_shipped",
        variables={
            "order_number": data.get("order_number"),
            "tracking_number": data.get("tracking_number"),
        }
    )

async def handle_payment_completed(data: dict):
    """Send payment confirmation notifications"""
    pass  # Implement as needed

async def stop_kafka_consumer():
    global consumer
    
    if consumer:
        await consumer.stop()
        logger.info("Kafka consumer stopped")
