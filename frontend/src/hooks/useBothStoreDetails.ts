import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { StoreDetails } from '../backend';

/**
 * Hook for fetching both store details in a single backend query call with stable actor pattern
 */
export function useBothStoreDetails() {
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = React.useState<typeof rawActor>(null);

  // Stabilize actor reference
  React.useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  const query = useQuery<StoreDetails[]>({
    queryKey: ['store-details'],
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');

      // Single backend call to fetch both stores
      const bothStores = await stableActor.getBothStoreDetails();

      // Parse the tuple array [(storeId, StoreDetails)] into ordered array
      // Backend guarantees Store 1 first, Store 2 second
      return bothStores.map(([_storeId, details]) => details);
    },
    enabled: Boolean(stableActor),
    staleTime: 30 * 60 * 1000, // 30 minutes - longer for shared footer/contact data
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isInitialLoading: actorFetching || (!stableActor) || query.isLoading,
    isFetched: !!stableActor && query.isFetched,
  };
}
