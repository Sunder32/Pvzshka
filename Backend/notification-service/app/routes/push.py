from fastapi import APIRouter, HTTPException
from app.models import PushNotificationRequest, NotificationResponse
from app.services.push_service import push_service
import logging
from uuid import uuid4
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/send", response_model=NotificationResponse)
async def send_push(request: PushNotificationRequest):
    """Send a push notification"""
    try:
        # TODO: Get device token from database based on user_id
        device_token = "dummy_token"  # Replace with actual lookup
        
        success = await push_service.send_push_notification(
            device_token=device_token,
            title=request.title,
            body=request.body,
            data=request.data,
            image_url=request.image_url
        )
        
        if success:
            return NotificationResponse(
                id=str(uuid4()),
                type="push",
                status="sent",
                created_at=datetime.utcnow(),
                sent_at=datetime.utcnow()
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to send push notification")
    
    except Exception as e:
        logger.error(f"Error sending push notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))
