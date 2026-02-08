import { useState, useEffect } from 'react';
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
  const [stableActor, setStableActor] = useState<typeof rawActor>(null);

  // Stabilize actor reference
  useEffect(() => {
    if (rawActor && !actorFetching) {
      setStableActor(rawActor);
    }
  }, [rawActor, actorFetching]);

  return useQuery<Category[]>({
    queryKey: ['public-categories'],
    queryFn: async () => {
      if (!stableActor) throw new Error('Actor not available');

      const backendCategories = await stableActor.getAllCategories();
      return backendCategories.map((cat: BackendCategory) => ({
        categoryId: bigIntToNumber(cat.categoryId),
        name: cat.name,
        order: bigIntToNumber(cat.order),
        createdDate: bigIntToNumber(cat.createdDate),
        lastUpdatedDate: bigIntToNumber(cat.lastUpdatedDate),
      }));
    },
    enabled: !!stableActor && isOpen,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
