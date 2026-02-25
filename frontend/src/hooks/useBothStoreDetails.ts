import { useStableActorQuery } from './useStableActorQuery';
import type { StoreDetails } from '../backend';

/**
 * Hook for fetching both store details in a single backend query call with stable actor pattern.
 * Returns the full React Query result including data, error, isError, refetch, isFetched, isLoading.
 */
export function useBothStoreDetails() {
  const query = useStableActorQuery<StoreDetails[]>(
    async (actor) => {
      // Single backend call to fetch both stores
      const bothStores = await actor.getBothStoreDetails();
      // Parse the tuple array [(storeId, StoreDetails)] into ordered array
      // Backend guarantees Store 1 first, Store 2 second
      return bothStores.map(([_storeId, details]) => details);
    },
    ['store-details'] as const,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes - longer for shared footer/contact data
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  return {
    ...query,
    // Expose isInitialLoading as alias for isLoading for backward compatibility
    isInitialLoading: query.isLoading,
  };
}
