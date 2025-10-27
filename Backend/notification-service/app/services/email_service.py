from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType, Disposition
from jinja2 import Environment, FileSystemLoader, select_autoescape
import aiofiles
import logging
from typing import Optional, Dict, Any, List
import base64
import os

from app.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.sendgrid_client = None
        if settings.SENDGRID_API_KEY:
            self.sendgrid_client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        
        # Setup Jinja2 for templates
        template_dir = os.path.join(os.path.dirname(__file__), "../templates/email")
        self.jinja_env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: Optional[str] = None,
        template: Optional[str] = None,
        variables: Optional[Dict[str, Any]] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
        attachments: Optional[List[Dict[str, str]]] = None
    ) -> bool:
        try:
            # Prepare email body
            if template:
                html_content = await self._render_template(template, variables or {})
            else:
                html_content = body or ""
            
            # Prepare sender
            sender_email = from_email or settings.SENDGRID_FROM_EMAIL
            sender_name = from_name or settings.SENDGRID_FROM_NAME
            
            # Send via SendGrid if available
            if self.sendgrid_client:
                return await self._send_via_sendgrid(
                    sender_email,
                    sender_name,
                    to_email,
                    subject,
                    html_content,
                    attachments
                )
            else:
                # Fallback to SMTP
                return await self._send_via_smtp(
                    sender_email,
                    to_email,
                    subject,
                    html_content
                )
        
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    async def _render_template(self, template_name: str, variables: Dict[str, Any]) -> str:
        try:
            template = self.jinja_env.get_template(f"{template_name}.html")
            return template.render(**variables)
        except Exception as e:
            logger.error(f"Failed to render template {template_name}: {e}")
            return ""
    
    async def _send_via_sendgrid(
        self,
        from_email: str,
        from_name: str,
        to_email: str,
        subject: str,
        html_content: str,
        attachments: Optional[List[Dict[str, str]]] = None
    ) -> bool:
        try:
            message = Mail(
                from_email=Email(from_email, from_name),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            # Add attachments if provided
            if attachments:
                for att in attachments:
                    async with aiofiles.open(att['path'], 'rb') as f:
                        data = await f.read()
                        encoded = base64.b64encode(data).decode()
                        
                        attachment = Attachment(
                            FileContent(encoded),
                            FileName(att['filename']),
                            FileType(att.get('type', 'application/octet-stream')),
                            Disposition('attachment')
                        )
                        message.add_attachment(attachment)
            
            response = self.sendgrid_client.send(message)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent to {to_email} via SendGrid")
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code} - {response.body}")
                return False
        
        except Exception as e:
            logger.error(f"SendGrid send error: {e}")
            return False
    
    async def _send_via_smtp(
        self,
        from_email: str,
        to_email: str,
        subject: str,
        html_content: str
    ) -> bool:
        # TODO: Implement SMTP fallback
        logger.warning("SMTP fallback not implemented yet")
        return False

email_service = EmailService()
