from fastapi import APIRouter, HTTPException
from app.models import SMSRequest, NotificationResponse
from app.services.sms_service import sms_service
import logging
from uuid import uuid4
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/send", response_model=NotificationResponse)
async def send_sms(request: SMSRequest):
    """Send an SMS notification"""
    try:
        success = await sms_service.send_sms(
            to_phone=request.to_phone,
            message=request.message,
            template=request.template,
            variables=request.variables
        )
        
        if success:
            return NotificationResponse(
                id=str(uuid4()),
                type="sms",
                status="sent",
                created_at=datetime.utcnow(),
                sent_at=datetime.utcnow()
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to send SMS")
    
    except Exception as e:
        logger.error(f"Error sending SMS: {e}")
        raise HTTPException(status_code=500, detail=str(e))
