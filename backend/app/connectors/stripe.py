"""
Stripe Connector
Integrates with Stripe for billing and payment management
"""
import os
from typing import Dict, Any, List
from .base import Connector, ConnectorStatus, ConnectorConfig, ConnectorAuth
from .registry import connector_registry
import httpx
import logging

logger = logging.getLogger(__name__)


class StripeConnector(Connector):
    """Stripe connector for billing management"""
    
    STRIPE_API_BASE = "https://api.stripe.com/v1"
    
    async def authorize(self, **kwargs) -> Dict[str, Any]:
        """Stripe uses API keys, not OAuth"""
        # For Stripe, we just need to verify the API key
        api_key = os.getenv("STRIPE_SECRET_KEY", "")
        
        if not api_key or not api_key.startswith("sk_"):
            return {
                "error": "Invalid Stripe API key. Please set STRIPE_SECRET_KEY environment variable."
            }
        
        return {
            "status": "ready",
            "message": "Stripe API key configured"
        }
    
    async def get_auth_status(self) -> ConnectorStatus:
        """Check Stripe API key status"""
        api_key = os.getenv("STRIPE_SECRET_KEY", "")
        
        if not api_key:
            return ConnectorStatus.NOT_CONNECTED
        
        if await self.test_connection():
            return ConnectorStatus.CONNECTED
        
        return ConnectorStatus.ERROR
    
    async def revoke(self) -> bool:
        """Stripe API keys are managed in Stripe dashboard"""
        return True
    
    async def test_connection(self) -> bool:
        """Test Stripe API connection"""
        api_key = os.getenv("STRIPE_SECRET_KEY", "")
        
        if not api_key:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.STRIPE_API_BASE}/balance",
                    headers={"Authorization": f"Bearer {api_key}"}
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Stripe connection test failed: {e}")
            return False
    
    async def create_customer_portal_session(self, customer_id: str, return_url: str) -> Dict[str, Any]:
        """Create a Stripe Customer Portal session"""
        api_key = os.getenv("STRIPE_SECRET_KEY", "")
        
        if not api_key:
            return {"error": "Stripe not configured"}
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.STRIPE_API_BASE}/billing_portal/sessions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    data={"customer": customer_id, "return_url": return_url}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {"error": f"Failed to create portal session: {response.status_code}"}
        except Exception as e:
            logger.error(f"Error creating Stripe portal session: {e}")
            return {"error": str(e)}
    
    async def get_resources(self, resource_type: str, **kwargs) -> List[Dict[str, Any]]:
        """Get Stripe resources (customers, subscriptions, etc.)"""
        if resource_type == "customers":
            return await self.list_customers(**kwargs)
        elif resource_type == "subscriptions":
            return await self.list_subscriptions(**kwargs)
        return []
    
    async def list_customers(self, limit: int = 10) -> List[Dict[str, Any]]:
        """List Stripe customers"""
        api_key = os.getenv("STRIPE_SECRET_KEY", "")
        
        if not api_key:
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.STRIPE_API_BASE}/customers",
                    headers={"Authorization": f"Bearer {api_key}"},
                    params={"limit": limit}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", [])
        except Exception as e:
            logger.error(f"Error listing Stripe customers: {e}")
        
        return []
    
    async def list_subscriptions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """List Stripe subscriptions"""
        api_key = os.getenv("STRIPE_SECRET_KEY", "")
        
        if not api_key:
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.STRIPE_API_BASE}/subscriptions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    params={"limit": limit}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", [])
        except Exception as e:
            logger.error(f"Error listing Stripe subscriptions: {e}")
        
        return []


# Register the Stripe connector
stripe_config = ConnectorConfig(
    connector_id="stripe",
    connector_name="Stripe",
    description="Connect to Stripe to manage billing, payments, and customer subscriptions.",
    icon="💳",
    category="billing",
    requires_auth=True,
    auth_type="api_key",
    documentation_url="https://stripe.com/docs/api"
)

connector_registry.register("stripe", StripeConnector, stripe_config)
