"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Loader2 } from 'lucide-react';

interface SearchResult {
  entity_type: string;
  entity_id: string;
  content: string;
  similarity_score: number;
  metadata: Record<string, any>;
}

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/ai/semantic-search', { query: searchQuery });
      setResults(response.data.results || []);
      
      if (response.data.results?.length === 0) {
        toast.success("No results found.");
      } else if (response.data.results?.length > 0) {
        toast.success(`Found ${response.data.results.length} result${response.data.results.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.error("Search failed. Please try again.");
      console.error('Semantic search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length >= 2) {
      debouncedSearch(value);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    performSearch(query);
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Semantic Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for products, contacts, orders..."
              value={query}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              className="pr-10"
              disabled={isLoading}
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button 
            onClick={handleManualSearch} 
            disabled={isLoading || !query.trim()}
            className="shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>

        {query.trim().length > 0 && query.trim().length < 2 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Enter at least 2 characters to search
          </p>
        )}

        <div className="mt-6 space-y-4">
          {results.length > 0 ? (
            results.map((result) => (
              <div 
                key={`${result.entity_type}-${result.entity_id}`}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors bg-card"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {result.metadata.name || result.entity_type}
                    </p>
                    <p className="text-muted-foreground mt-1 line-clamp-2">
                      {result.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="capitalize">Type: {result.entity_type}</span>
                      <span>ID: {result.entity_id}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-medium text-primary">
                      {(result.similarity_score * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      match
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : query.trim().length >= 2 && !isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or check your spelling</p>
            </div>
          ) : null}
        </div>

        {query.trim().length >= 2 && (
          <p className="mt-4 text-xs text-muted-foreground">
            💡 Search uses AI-powered semantic matching to find relevant results even with different wording
          </p>
        )}
      </CardContent>
    </Card>
  );
}
