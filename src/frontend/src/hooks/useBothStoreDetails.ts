import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { StoreDetails } from '../backend';

/**
 * Hook for fetching both store details in a single backend query call with stable actor pattern
 */
export function useBothStoreDetails() {
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = useState<typeof rawActor>(null);

  // Stabilize actor reference
  useEffect(() => {
    if (rawActor && !actorFetching) {
      setStableActor(rawActor);
    }
  }, [rawActor, actorFetching]);

  return useQuery<StoreDetails[]>({
    queryKey: ['both-store-details'],
    queryFn: async () => {
      if (!stableActor) throw new Error('Actor not available');

      // Single backend call to fetch both stores
      const bothStores = await stableActor.getBothStoreDetails();

      // Parse the tuple array [(storeId, StoreDetails)] into ordered array
      // Backend guarantees Store 1 first, Store 2 second
      return bothStores.map(([_storeId, details]) => details);
    },
    enabled: !!stableActor,
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
