import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Category } from './useQueries';
import { bigIntToNumber } from '../utils/categoryNumeric';
import type { Category as BackendCategory } from '../backend';

/**
 * Hook for fetching categories in public pages with stable actor pattern
 * Only fetches when the side panel is open
 */
export function usePublicCategories(isOpen: boolean) {
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = React.useState<typeof rawActor>(null);

  // Stabilize actor reference
  React.useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');

      const backendCategories = await stableActor.getAllCategories();
      return backendCategories.map((cat: BackendCategory) => ({
        categoryId: bigIntToNumber(cat.categoryId),
        name: cat.name,
        order: bigIntToNumber(cat.order),
        createdDate: bigIntToNumber(cat.createdDate),
        lastUpdatedDate: bigIntToNumber(cat.lastUpdatedDate),
      }));
    },
    enabled: Boolean(stableActor) && !actorFetching && isOpen,
    staleTime: 30 * 60 * 1000, // 30 minutes - longer for shared navigation data
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
