from fastapi import APIRouter, HTTPException
from app.models import EmailRequest, NotificationResponse
from app.services.email_service import email_service
import logging
from uuid import uuid4
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/send", response_model=NotificationResponse)
async def send_email(request: EmailRequest):
    """Send an email notification"""
    try:
        success = await email_service.send_email(
            to_email=request.to_email,
            subject=request.subject,
            body=request.body,
            template=request.template,
            variables=request.variables,
            from_email=request.from_email,
            from_name=request.from_name,
            attachments=request.attachments
        )
        
        if success:
            return NotificationResponse(
                id=str(uuid4()),
                type="email",
                status="sent",
                created_at=datetime.utcnow(),
                sent_at=datetime.utcnow()
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
    
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail=str(e))
