from twilio.rest import Client
import logging
from typing import Optional, Dict, Any

from app.config import settings

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.client = None
        if all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_FROM_PHONE]):
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    async def send_sms(
        self,
        to_phone: str,
        message: str,
        template: Optional[str] = None,
        variables: Optional[Dict[str, Any]] = None
    ) -> bool:
        if not self.client:
            logger.error("Twilio client not configured")
            return False
        
        try:
            # Render message from template if provided
            if template and variables:
                message = self._render_template(template, variables)
            
            # Ensure phone number has country code
            if not to_phone.startswith('+'):
                to_phone = f"+{to_phone}"
            
            # Send SMS via Twilio
            response = self.client.messages.create(
                body=message,
                from_=settings.TWILIO_FROM_PHONE,
                to=to_phone
            )
            
            if response.sid:
                logger.info(f"SMS sent to {to_phone}, SID: {response.sid}")
                return True
            else:
                logger.error(f"Failed to send SMS to {to_phone}")
                return False
        
        except Exception as e:
            logger.error(f"Twilio send error: {e}")
            return False
    
    def _render_template(self, template_name: str, variables: Dict[str, Any]) -> str:
        # Simple template rendering (you can enhance this)
        templates = {
            "order_confirmation": "Ваш заказ #{order_number} подтвержден. Сумма: {total} руб.",
            "order_shipped": "Ваш заказ #{order_number} отправлен. Трек-номер: {tracking_number}",
            "order_delivered": "Ваш заказ #{order_number} доставлен в пункт выдачи {pvz_name}",
            "verification_code": "Ваш код подтверждения: {code}",
        }
        
        template = templates.get(template_name, "{message}")
        return template.format(**variables)

sms_service = SMSService()
