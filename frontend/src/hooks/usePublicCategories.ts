import { useStableActorQuery } from './useStableActorQuery';
import type { Category } from './useQueries';
import { bigIntToNumber } from '../utils/categoryNumeric';
import type { Category as BackendCategory } from '../backend';

/**
 * Hook for fetching categories in public pages with stable actor pattern.
 * Only fetches when the side panel is open.
 */
export function usePublicCategories(isOpen: boolean) {
  return useStableActorQuery<Category[]>(
    async (actor) => {
      const backendCategories = await actor.getAllCategories();
      return backendCategories.map((cat: BackendCategory) => ({
        categoryId: bigIntToNumber(cat.categoryId),
        name: cat.name,
        order: bigIntToNumber(cat.order),
        createdDate: bigIntToNumber(cat.createdDate),
        lastUpdatedDate: bigIntToNumber(cat.lastUpdatedDate),
      }));
    },
    ['categories'] as const,
    {
      enabled: isOpen,
      staleTime: 30 * 60 * 1000, // 30 minutes - longer for shared navigation data
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );
}
