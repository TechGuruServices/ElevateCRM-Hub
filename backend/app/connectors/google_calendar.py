"""
Google Calendar Connector
Integrates with Google Calendar API for event management
"""
import os
from typing import Dict, Any, List
from datetime import datetime
from .base import Connector, ConnectorStatus, ConnectorConfig, ConnectorAuth
from .registry import connector_registry
import httpx
import logging

logger = logging.getLogger(__name__)


class GoogleCalendarConnector(Connector):
    """Google Calendar connector for event management"""
    
    CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3"
    
    async def authorize(self, **kwargs) -> Dict[str, Any]:
        """Initiate Google Calendar OAuth flow"""
        client_id = os.getenv("GCAL_CLIENT_ID", "")
        redirect_uri = os.getenv("GCAL_REDIRECT_URI", "http://localhost:5000/api/connectors/calendar/callback")
        
        scopes = [
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar.events"
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
            "state": "calendar_auth"
        }
    
    async def get_auth_status(self) -> ConnectorStatus:
        """Check Google Calendar authentication status"""
        if not self.auth or not self.auth.credentials.get("access_token"):
            return ConnectorStatus.NOT_CONNECTED
        
        if self.auth.expires_at and self.auth.expires_at < datetime.now():
            return ConnectorStatus.EXPIRED
        
        if await self.test_connection():
            return ConnectorStatus.CONNECTED
        
        return ConnectorStatus.ERROR
    
    async def revoke(self) -> bool:
        """Revoke Google Calendar access"""
        if self.auth and self.auth.credentials.get("access_token"):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://oauth2.googleapis.com/revoke",
                        params={"token": self.auth.credentials["access_token"]}
                    )
                    return response.status_code == 200
            except Exception as e:
                logger.error(f"Error revoking Calendar access: {e}")
                return False
        return True
    
    async def test_connection(self) -> bool:
        """Test Google Calendar connection"""
        if not self.auth or not self.auth.credentials.get("access_token"):
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.CALENDAR_API_BASE}/users/me/calendarList",
                    headers={"Authorization": f"Bearer {self.auth.credentials['access_token']}"}
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Calendar connection test failed: {e}")
            return False
    
    async def get_resources(self, resource_type: str, **kwargs) -> List[Dict[str, Any]]:
        """Get Calendar resources (events, calendars, etc.)"""
        if resource_type == "events":
            return await self.list_events(**kwargs)
        elif resource_type == "calendars":
            return await self.list_calendars()
        return []
    
    async def list_calendars(self) -> List[Dict[str, Any]]:
        """List user's calendars"""
        if not self.auth or not self.auth.credentials.get("access_token"):
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.CALENDAR_API_BASE}/users/me/calendarList",
                    headers={"Authorization": f"Bearer {self.auth.credentials['access_token']}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("items", [])
        except Exception as e:
            logger.error(f"Error listing calendars: {e}")
        
        return []
    
    async def list_events(self, calendar_id: str = "primary", max_results: int = 10) -> List[Dict[str, Any]]:
        """List calendar events"""
        if not self.auth or not self.auth.credentials.get("access_token"):
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.CALENDAR_API_BASE}/calendars/{calendar_id}/events",
                    headers={"Authorization": f"Bearer {self.auth.credentials['access_token']}"},
                    params={"maxResults": max_results, "orderBy": "startTime", "singleEvents": True}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("items", [])
        except Exception as e:
            logger.error(f"Error listing events: {e}")
        
        return []


# Register the Google Calendar connector
calendar_config = ConnectorConfig(
    connector_id="google_calendar",
    connector_name="Google Calendar",
    description="Connect to Google Calendar to manage events, meetings, and schedules.",
    icon="📅",
    category="productivity",
    requires_auth=True,
    auth_type="oauth2",
    documentation_url="https://developers.google.com/calendar/api"
)

connector_registry.register("google_calendar", GoogleCalendarConnector, calendar_config)
