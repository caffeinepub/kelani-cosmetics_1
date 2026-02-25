import { useState, useEffect } from 'react';
import { useStableActorQuery } from './useStableActorQuery';
import type { HomepageSearchResult } from '../backend';

interface UseHomepageAutocompleteResult {
  results: HomepageSearchResult[];
  isLoading: boolean;
  error: Error | null;
}

export function useHomepageAutocomplete(query: string): UseHomepageAutocompleteResult {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const trimmedQuery = debouncedQuery;
  const shouldFetch = trimmedQuery.length >= 2;

  const { data, isLoading, error } = useStableActorQuery<HomepageSearchResult[]>(
    async (actor) => {
      const searchResults = await actor.searchHomepageProducts(trimmedQuery);
      return searchResults.slice(0, 10);
    },
    ['category-products', 'search', trimmedQuery] as const,
    {
      enabled: shouldFetch,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  return {
    results: data ?? [],
    isLoading: shouldFetch && isLoading,
    error: error as Error | null,
  };
}
