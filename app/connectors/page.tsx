eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'use client';

import React, { useState, useEffect } from 'react';
import { Search, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Connector {
  connector_id: string;
  connector_name: string;
  description: string;
  icon: string;
  category: string;
  requires_auth: boolean;
  auth_type: string;
  status: string;
  enabled: boolean;
  documentation_url?: string;
}

const MOCK_CONNECTORS: Connector[] = [
  {
    connector_id: 'gmail',
    connector_name: 'Gmail',
    description: 'Connect to Gmail to manage emails, send messages, and organize your inbox.',
    icon: '📧',
    category: 'communication',
    requires_auth: true,
    auth_type: 'oauth2',
    status: 'not_connected',
    enabled: true,
    documentation_url: 'https://developers.google.com/gmail/api'
  },
  {
    connector_id: 'google_calendar',
    connector_name: 'Google Calendar',
    description: 'Connect to Google Calendar to manage events, meetings, and schedules.',
    icon: '📅',
    category: 'productivity',
    requires_auth: true,
    auth_type: 'oauth2',
    status: 'not_connected',
    enabled: true,
    documentation_url: 'https://developers.google.com/calendar/api'
  },
  {
    connector_id: 'stripe',
    connector_name: 'Stripe',
    description: 'Connect to Stripe to manage billing, payments, and customer subscriptions.',
    icon: '💳',
    category: 'billing',
    requires_auth: true,
    auth_type: 'api_key',
    status: 'not_connected',
    enabled: true,
    documentation_url: 'https://stripe.com/docs/api'
  },
  {
    connector_id: 'twilio_whatsapp',
    connector_name: 'Twilio WhatsApp',
    description: 'Connect to Twilio to send and receive WhatsApp messages for customer communication.',
    icon: '💬',
    category: 'communication',
    requires_auth: true,
    auth_type: 'api_key',
    status: 'not_connected',
    enabled: true,
    documentation_url: 'https://www.twilio.com/docs/whatsapp'
  },
  {
    connector_id: 'quickbooks',
    connector_name: 'QuickBooks',
    description: 'Connect to QuickBooks for accounting and financial management.',
    icon: '💼',
    category: 'accounting',
    requires_auth: true,
    auth_type: 'oauth2',
    status: 'not_connected',
    enabled: false,
    documentation_url: 'https://developer.intuit.com/app/developer/qbo/docs'
  },
  {
    connector_id: 'shopify',
    connector_name: 'Shopify',
    description: 'Connect to Shopify to sync products, orders, and inventory.',
    icon: '🛍️',
    category: 'ecommerce',
    requires_auth: true,
    auth_type: 'oauth2',
    status: 'not_connected',
    enabled: false,
    documentation_url: 'https://shopify.dev/api'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'communication', name: 'Communication' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'billing', name: 'Billing' },
  { id: 'accounting', name: 'Accounting' },
  { id: 'ecommerce', name: 'E-commerce' }
];

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoadingConnectors, setIsLoadingConnectors] = useState(true);

  // Fetch connectors from API
  useEffect(() => {
    async function fetchConnectors() {
      try {
        const response = await fetch('/api/v1/connectors/');
        if (response.ok) {
          const data = await response.json();
          setConnectors(data.connectors || []);
          setFetchError(null);
        } else {
          // Fallback to mock data if API fails
          console.warn('Failed to fetch connectors from API, using mock data');
          setConnectors(MOCK_CONNECTORS);
          setFetchError('Using demo data - API unavailable');
        }
      } catch (error) {
        console.error('Error fetching connectors:', error);
        setConnectors(MOCK_CONNECTORS);
        setFetchError('Using demo data - API unavailable');
      } finally {
        setIsLoadingConnectors(false);
      }
    }

    fetchConnectors();
  }, []);

  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = connector.connector_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || connector.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConnect = async (connectorId: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert(`Connecting to ${connectorId}... (Demo Mode)`);
    }, 1000);
  };

  const handleDisconnect = async (connectorId: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert(`Disconnecting from ${connectorId}... (Demo Mode)`);
    }, 1000);
  };

  if (isLoadingConnectors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading connectors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Connectors Marketplace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Connect your favorite tools and services to ElevateCRM
          </p>
          {fetchError && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">{fetchError}</span>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search connectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnectors.map(connector => (
            <Card 
              key={connector.connector_id}
              className={`backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 ${!connector.enabled ? 'opacity-60' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{connector.icon}</span>
                    <div>
                      <CardTitle className="text-xl">{connector.connector_name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {connector.category}
                      </Badge>
                    </div>
                  </div>
                  {connector.status === 'connected' && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 min-h-[3rem]">
                  {connector.description}
                </CardDescription>

                <div className="space-y-2">
                  {connector.enabled ? (
                    <>
                      {connector.status === 'not_connected' ? (
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => handleConnect(connector.connector_id)}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            `Connect ${connector.connector_name}`
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleDisconnect(connector.connector_id)}
                          disabled={loading}
                        >
                          Disconnect
                        </Button>
                      )}

                      {connector.documentation_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(connector.documentation_url, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Documentation
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Auth: {connector.auth_type}</span>
                  {connector.status === 'connected' && (
                    <Badge variant="success" className="text-xs">
                      Connected
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredConnectors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              No connectors found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
