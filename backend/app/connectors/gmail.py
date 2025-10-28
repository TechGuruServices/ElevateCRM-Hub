"""
Gmail Connector
Integrates with Gmail API for email management
"""
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from .base import Connector, ConnectorStatus, ConnectorConfig, ConnectorAuth
from .registry import connector_registry
import httpx
import logging

logger = logging.getLogger(__name__)


class GmailConnector(Connector):
    """Gmail connector for email management"""
    
    GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1"
    
    async def authorize(self, **kwargs) -> Dict[str, Any]:
        """Initiate Gmail OAuth flow"""
        # This would integrate with Replit's Gmail connector
        client_id = os.getenv("GMAIL_CLIENT_ID", "")
        redirect_uri = os.getenv("GMAIL_REDIRECT_URI", "http://localhost:5000/api/connectors/gmail/callback")
        
        scopes = [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send"
        ]
        
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth"
            f"?client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={' '.join(scopes)}"
            f"&response_type=code"
            f"&access_type=offline"
        )
        
        return {
            "auth_url": auth_url,
            "state": "gmail_auth"
        }
    
    async def get_auth_status(self) -> ConnectorStatus:
        """Check Gmail authentication status"""
        if not self.auth or not self.auth.credentials.get("access_token"):
            return ConnectorStatus.NOT_CONNECTED
        
        # Check if token is expired
        if self.auth.expires_at and self.auth.expires_at < datetime.now():
            return ConnectorStatus.EXPIRED
        
        # Test connection
        if await self.test_connection():
            return ConnectorStatus.CONNECTED
        
        return ConnectorStatus.ERROR
    
    async def revoke(self) -> bool:
        """Revoke Gmail access"""
        if self.auth and self.auth.credentials.get("access_token"):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"https://oauth2.googleapis.com/revoke",
                        params={"token": self.auth.credentials["access_token"]}
                    )
                    return response.status_code == 200
            except Exception as e:
                logger.error(f"Error revoking Gmail access: {e}")
                return False
        return True
    
    async def test_connection(self) -> bool:
        """Test Gmail connection"""
        if not self.auth or not self.auth.credentials.get("access_token"):
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.GMAIL_API_BASE}/users/me/profile",
                    headers={"Authorization": f"Bearer {self.auth.credentials['access_token']}"}
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Gmail connection test failed: {e}")
            return False
    
    async def get_resources(self, resource_type: str, **kwargs) -> List[Dict[str, Any]]:
        """Get Gmail resources (messages, labels, etc.)"""
        if resource_type == "messages":
            return await self.list_messages(**kwargs)
        elif resource_type == "labels":
            return await self.list_labels()
        return []
    
    async def list_messages(self, max_results: int = 10, query: str = "") -> List[Dict[str, Any]]:
        """List Gmail messages"""
        if not self.auth or not self.auth.credentials.get("access_token"):
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                params = {"maxResults": max_results}
                if query:
                    params["q"] = query
                
                response = await client.get(
                    f"{self.GMAIL_API_BASE}/users/me/messages",
                    headers={"Authorization": f"Bearer {self.auth.credentials['access_token']}"},
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("messages", [])
        except Exception as e:
            logger.error(f"Error listing Gmail messages: {e}")
        
        return []
    
    async def list_labels(self) -> List[Dict[str, Any]]:
        """List Gmail labels"""
        if not self.auth or not self.auth.credentials.get("access_token"):
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.GMAIL_API_BASE}/users/me/labels",
                    headers={"Authorization": f"Bearer {self.auth.credentials['access_token']}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("labels", [])
        except Exception as e:
            logger.error(f"Error listing Gmail labels: {e}")
        
        return []
    
    async def send_message(self, to: str, subject: str, body: str) -> Dict[str, Any]:
        """Send an email via Gmail"""
        if not self.auth or not self.auth.credentials.get("access_token"):
            return {"error": "Not authenticated"}
        
        try:
            import base64
            from email.mime.text import MIMEText
            
            message = MIMEText(body)
            message['to'] = to
            message['subject'] = subject
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.GMAIL_API_BASE}/users/me/messages/send",
                    headers={"Authorization": f"Bearer {self.auth.credentials['access_token']}"},
                    json={"raw": raw_message}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {"error": f"Failed to send: {response.status_code}"}
        except Exception as e:
            logger.error(f"Error sending Gmail message: {e}")
            return {"error": str(e)}


# Register the Gmail connector
gmail_config = ConnectorConfig(
    connector_id="gmail",
    connector_name="Gmail",
    description="Connect to Gmail to manage emails, send messages, and organize your inbox.",
    icon="📧",
    category="communication",
    requires_auth=True,
    auth_type="oauth2",
    documentation_url="https://developers.google.com/gmail/api"
)

connector_registry.register("gmail", GmailConnector, gmail_config)
