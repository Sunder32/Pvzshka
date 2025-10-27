from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    DELIVERED = "delivered"

class EmailRequest(BaseModel):
    tenant_id: str
    to_email: EmailStr
    subject: str
    template: Optional[str] = None
    body: Optional[str] = None
    variables: Optional[Dict[str, Any]] = {}
    from_email: Optional[EmailStr] = None
    from_name: Optional[str] = None
    attachments: Optional[List[Dict[str, str]]] = []

class SMSRequest(BaseModel):
    tenant_id: str
    to_phone: str
    message: str
    template: Optional[str] = None
    variables: Optional[Dict[str, Any]] = {}

class PushNotificationRequest(BaseModel):
    tenant_id: str
    user_id: str
    title: str
    body: str
    data: Optional[Dict[str, Any]] = {}
    image_url: Optional[str] = None
    action_url: Optional[str] = None

class NotificationResponse(BaseModel):
    id: str
    type: NotificationType
    status: NotificationStatus
    created_at: datetime
    sent_at: Optional[datetime] = None
    error: Optional[str] = None

class TemplateVariable(BaseModel):
    key: str
    value: Any

class Template(BaseModel):
    name: str
    type: NotificationType
    subject: Optional[str] = None
    content: str
    variables: List[str] = []
