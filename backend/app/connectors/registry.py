"""
Connector registry for managing available connectors
"""
from typing import Dict, Optional, List, Type
from .base import Connector, ConnectorConfig


class ConnectorRegistry:
    """Registry for managing available connectors"""
    
    def __init__(self):
        self._connectors: Dict[str, Type[Connector]] = {}
        self._configs: Dict[str, ConnectorConfig] = {}
    
    def register(self, connector_id: str, connector_class: Type[Connector], config: ConnectorConfig):
        """Register a connector"""
        self._connectors[connector_id] = connector_class
        self._configs[connector_id] = config
    
    def get_connector_class(self, connector_id: str) -> Optional[Type[Connector]]:
        """Get a connector class by ID"""
        return self._connectors.get(connector_id)
    
    def get_config(self, connector_id: str) -> Optional[ConnectorConfig]:
        """Get connector configuration by ID"""
        return self._configs.get(connector_id)
    
    def list_all(self) -> List[ConnectorConfig]:
        """List all registered connectors"""
        return list(self._configs.values())
    
    def list_by_category(self, category: str) -> List[ConnectorConfig]:
        """List connectors by category"""
        return [config for config in self._configs.values() if config.category == category]


# Global registry instance
connector_registry = ConnectorRegistry()


def get_connector(connector_id: str, **kwargs) -> Optional[Connector]:
    """Get an instance of a connector"""
    connector_class = connector_registry.get_connector_class(connector_id)
    config = connector_registry.get_config(connector_id)
    
    if connector_class and config:
        return connector_class(config=config, **kwargs)
    return None


def list_connectors(category: Optional[str] = None) -> List[ConnectorConfig]:
    """List available connectors"""
    if category:
        return connector_registry.list_by_category(category)
    return connector_registry.list_all()
