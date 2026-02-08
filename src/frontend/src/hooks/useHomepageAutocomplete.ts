import { useState, useEffect, useRef } from 'react';
import { useActor } from './useActor';
import type { HomepageSearchResult } from '../backend';

interface UseHomepageAutocompleteResult {
  results: HomepageSearchResult[];
  isLoading: boolean;
  error: Error | null;
}

export function useHomepageAutocomplete(query: string): UseHomepageAutocompleteResult {
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = useState<typeof rawActor>(null);
  const [results, setResults] = useState<HomepageSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, HomepageSearchResult[]>>(new Map());

  // Stabilize actor reference
  useEffect(() => {
    if (rawActor && !actorFetching) {
      setStableActor(rawActor);
    }
  }, [rawActor, actorFetching]);

  useEffect(() => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmedQuery = query.trim();

    // Reset state if query is too short
    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    const normalizedQuery = trimmedQuery.toLowerCase();
    if (cacheRef.current.has(normalizedQuery)) {
      setResults(cacheRef.current.get(normalizedQuery)!);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Debounce the search
    debounceTimerRef.current = setTimeout(async () => {
      if (!stableActor) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const searchResults = await stableActor.searchHomepageProducts(trimmedQuery);
        
        // Check if this request was aborted
        if (controller.signal.aborted) {
          return;
        }

        // Limit to 10 results
        const limitedResults = searchResults.slice(0, 10);
        
        // Cache the results
        cacheRef.current.set(normalizedQuery, limitedResults);
        
        setResults(limitedResults);
        setIsLoading(false);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        
        setError(err instanceof Error ? err : new Error('Search failed'));
        setResults([]);
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, stableActor]);

  return { results, isLoading, error };
}
