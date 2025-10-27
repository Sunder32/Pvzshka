import firebase_admin
from firebase_admin import credentials, messaging
import logging
from typing import Optional, Dict, Any
import os

from app.config import settings

logger = logging.getLogger(__name__)

class PushNotificationService:
    def __init__(self):
        self.initialized = False
        
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            try:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
                self.initialized = True
                logger.info("Firebase initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Firebase: {e}")
    
    async def send_push_notification(
        self,
        device_token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        image_url: Optional[str] = None
    ) -> bool:
        if not self.initialized:
            logger.error("Firebase not initialized")
            return False
        
        try:
            # Build notification message
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                    image=image_url
                ),
                data=data or {},
                token=device_token,
                android=messaging.AndroidConfig(
                    priority='high',
                    notification=messaging.AndroidNotification(
                        sound='default',
                        color='#0066cc'
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound='default',
                            badge=1
                        )
                    )
                )
            )
            
            # Send message
            response = messaging.send(message)
            
            logger.info(f"Push notification sent: {response}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send push notification: {e}")
            return False
    
    async def send_multicast(
        self,
        device_tokens: list[str],
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if not self.initialized:
            logger.error("Firebase not initialized")
            return {"success_count": 0, "failure_count": len(device_tokens)}
        
        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                tokens=device_tokens
            )
            
            response = messaging.send_multicast(message)
            
            logger.info(f"Multicast sent - Success: {response.success_count}, Failure: {response.failure_count}")
            
            return {
                "success_count": response.success_count,
                "failure_count": response.failure_count,
                "responses": response.responses
            }
        
        except Exception as e:
            logger.error(f"Failed to send multicast: {e}")
            return {"success_count": 0, "failure_count": len(device_tokens)}

push_service = PushNotificationService()
