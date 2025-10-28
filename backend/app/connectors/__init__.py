"""
Connector SDK for ElevateCRM
Provides base classes and utilities for building third-party integrations
"""
from .base import Connector, ConnectorStatus, ConnectorConfig, ConnectorAuth
from .registry import connector_registry, get_connector, list_connectors

# Import connector modules to trigger registration
from . import gmail
from . import google_calendar
from . import stripe
from . import twilio

__all__ = [
    'Connector',
    'ConnectorStatus',
    'ConnectorConfig',
    'ConnectorAuth',
    'connector_registry',
    'get_connector',
    'list_connectors',
]
