"""
Connectors API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from app.connectors import list_connectors, get_connector
from app.connectors.base import ConnectorConfig, ConnectorStatus

router = APIRouter()


class ConnectorListResponse(BaseModel):
    """Response model for listing connectors"""
    connectors: List[ConnectorConfig]


class ConnectorStatusResponse(BaseModel):
    """Response model for connector status"""
    connector_id: str
    status: ConnectorStatus
    message: str = ""


class ConnectorActionRequest(BaseModel):
    """Request model for connector actions"""
    action: str
    params: Dict[str, Any] = {}


@router.get("/", response_model=ConnectorListResponse)
async def get_connectors(category: str = None):
    """List all available connectors"""
    connectors = list_connectors(category=category)
    return {"connectors": connectors}


@router.get("/{connector_id}/status", response_model=ConnectorStatusResponse)
async def get_connector_status(connector_id: str):
    """Get the status of a specific connector"""
    connector = get_connector(connector_id)
    
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    status = await connector.get_auth_status()
    
    return {
        "connector_id": connector_id,
        "status": status,
        "message": f"Connector is {status.value}"
    }


@router.post("/{connector_id}/authorize")
async def authorize_connector(connector_id: str):
    """Initiate authorization for a connector"""
    connector = get_connector(connector_id)
    
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    try:
        result = await connector.authorize()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{connector_id}/revoke")
async def revoke_connector(connector_id: str):
    """Revoke authorization for a connector"""
    connector = get_connector(connector_id)
    
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    try:
        success = await connector.revoke()
        return {"success": success, "message": "Connector access revoked" if success else "Failed to revoke"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{connector_id}/resources/{resource_type}")
async def get_connector_resources(connector_id: str, resource_type: str, limit: int = 10):
    """Get resources from a connector"""
    connector = get_connector(connector_id)
    
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    try:
        resources = await connector.get_resources(resource_type, limit=limit)
        return {"resources": resources, "count": len(resources)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{connector_id}/test")
async def test_connector(connector_id: str):
    """Test a connector connection"""
    connector = get_connector(connector_id)
    
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    try:
        success = await connector.test_connection()
        return {
            "success": success,
            "message": "Connection successful" if success else "Connection failed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
