"""
Twilio WhatsApp Connector
Integrates with Twilio for WhatsApp messaging
"""
import os
from typing import Dict, Any, List
from .base import Connector, ConnectorStatus, ConnectorConfig, ConnectorAuth
from .registry import connector_registry
import httpx
import logging
import base64

logger = logging.getLogger(__name__)


class TwilioWhatsAppConnector(Connector):
    """Twilio connector for WhatsApp messaging"""
    
    TWILIO_API_BASE = "https://api.twilio.com/2010-04-01"
    
    async def authorize(self, **kwargs) -> Dict[str, Any]:
        """Twilio uses Account SID and Auth Token"""
        account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        
        if not account_sid or not auth_token:
            return {
                "error": "Missing Twilio credentials. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
            }
        
        return {
            "status": "ready",
            "message": "Twilio credentials configured"
        }
    
    async def get_auth_status(self) -> ConnectorStatus:
        """Check Twilio credentials status"""
        account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        
        if not account_sid or not auth_token:
            return ConnectorStatus.NOT_CONNECTED
        
        if await self.test_connection():
            return ConnectorStatus.CONNECTED
        
        return ConnectorStatus.ERROR
    
    async def revoke(self) -> bool:
        """Twilio credentials are managed in Twilio console"""
        return True
    
    async def test_connection(self) -> bool:
        """Test Twilio API connection"""
        account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        
        if not account_sid or not auth_token:
            return False
        
        try:
            credentials = base64.b64encode(f"{account_sid}:{auth_token}".encode()).decode()
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.TWILIO_API_BASE}/Accounts/{account_sid}.json",
                    headers={"Authorization": f"Basic {credentials}"}
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Twilio connection test failed: {e}")
            return False
    
    async def send_whatsapp_message(self, to: str, message: str) -> Dict[str, Any]:
        """Send a WhatsApp message via Twilio"""
        account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        from_number = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")  # Twilio sandbox
        
        if not account_sid or not auth_token:
            return {"error": "Twilio not configured"}
        
        try:
            credentials = base64.b64encode(f"{account_sid}:{auth_token}".encode()).decode()
            
            # Ensure 'to' number has whatsapp: prefix
            if not to.startswith("whatsapp:"):
                to = f"whatsapp:{to}"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.TWILIO_API_BASE}/Accounts/{account_sid}/Messages.json",
                    headers={"Authorization": f"Basic {credentials}"},
                    data={
                        "From": from_number,
                        "To": to,
                        "Body": message
                    }
                )
                
                if response.status_code in [200, 201]:
                    return response.json()
                else:
                    return {"error": f"Failed to send message: {response.status_code}", "details": response.text}
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {e}")
            return {"error": str(e)}
    
    async def get_resources(self, resource_type: str, **kwargs) -> List[Dict[str, Any]]:
        """Get Twilio resources (messages, etc.)"""
        if resource_type == "messages":
            return await self.list_messages(**kwargs)
        return []
    
    async def list_messages(self, limit: int = 20) -> List[Dict[str, Any]]:
        """List recent messages"""
        account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        
        if not account_sid or not auth_token:
            return []
        
        try:
            credentials = base64.b64encode(f"{account_sid}:{auth_token}".encode()).decode()
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.TWILIO_API_BASE}/Accounts/{account_sid}/Messages.json",
                    headers={"Authorization": f"Basic {credentials}"},
                    params={"PageSize": limit}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("messages", [])
        except Exception as e:
            logger.error(f"Error listing messages: {e}")
        
        return []


# Register the Twilio WhatsApp connector
twilio_config = ConnectorConfig(
    connector_id="twilio_whatsapp",
    connector_name="Twilio WhatsApp",
    description="Connect to Twilio to send and receive WhatsApp messages for customer communication.",
    icon="💬",
    category="communication",
    requires_auth=True,
    auth_type="api_key",
    documentation_url="https://www.twilio.com/docs/whatsapp"
)

connector_registry.register("twilio_whatsapp", TwilioWhatsAppConnector, twilio_config)
