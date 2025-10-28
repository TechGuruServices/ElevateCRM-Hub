"""
Base classes for the Connector SDK
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime


class ConnectorStatus(str, Enum):
    """Connector connection status"""
    NOT_CONNECTED = "not_connected"
    CONNECTED = "connected"
    ERROR = "error"
    EXPIRED = "expired"


class ConnectorAuth(BaseModel):
    """Authentication configuration for a connector"""
    auth_type: str = Field(..., description="oauth2, api_key, or basic")
    credentials: Dict[str, Any] = Field(default_factory=dict)
    expires_at: Optional[datetime] = None
    scopes: List[str] = Field(default_factory=list)


class ConnectorConfig(BaseModel):
    """Configuration for a connector instance"""
    connector_id: str
    connector_name: str
    description: str
    icon: str = ""
    category: str = "productivity"
    requires_auth: bool = True
    auth_type: str = "oauth2"
    status: ConnectorStatus = ConnectorStatus.NOT_CONNECTED
    enabled: bool = True
    documentation_url: Optional[str] = None


class Connector(ABC):
    """Base class for all connectors"""
    
    def __init__(self, config: ConnectorConfig, auth: Optional[ConnectorAuth] = None):
        self.config = config
        self.auth = auth
    
    @abstractmethod
    async def authorize(self, **kwargs) -> Dict[str, Any]:
        """
        Initiate the authorization flow
        Returns authorization URL or credentials
        """
        pass
    
    @abstractmethod
    async def get_auth_status(self) -> ConnectorStatus:
        """
        Check if the connector is properly authenticated
        """
        pass
    
    @abstractmethod
    async def revoke(self) -> bool:
        """
        Revoke access and clear stored credentials
        """
        pass
    
    @abstractmethod
    async def test_connection(self) -> bool:
        """
        Test if the connection is working
        """
        pass
    
    async def get_resources(self, resource_type: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Fetch resources from the connected service
        Override in specific connectors
        """
        return []
    
    async def create_resource(self, resource_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a resource in the connected service
        Override in specific connectors
        """
        raise NotImplementedError("Create operation not supported by this connector")
    
    async def sync(self, **kwargs) -> Dict[str, Any]:
        """
        Sync data from the connected service
        Override in specific connectors
        """
        return {"synced": 0, "status": "not_implemented"}
