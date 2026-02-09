import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { HomepageSearchResult } from '../backend';

interface UseHomepageAutocompleteResult {
  results: HomepageSearchResult[];
  isLoading: boolean;
  error: Error | null;
}

export function useHomepageAutocomplete(query: string): UseHomepageAutocompleteResult {
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = React.useState<typeof rawActor>(null);
  const [debouncedQuery, setDebouncedQuery] = React.useState('');

  // Stabilize actor reference
  React.useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  // Debounce query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const trimmedQuery = debouncedQuery;
  const shouldFetch = trimmedQuery.length >= 2;

  const { data, isLoading, error } = useQuery<HomepageSearchResult[]>({
    queryKey: ['category-products', 'search', trimmedQuery],
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');
      
      const searchResults = await stableActor.searchHomepageProducts(trimmedQuery);
      return searchResults.slice(0, 10);
    },
    enabled: Boolean(stableActor) && !actorFetching && shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    results: data ?? [],
    isLoading: shouldFetch && isLoading,
    error: error as Error | null,
  };
}
