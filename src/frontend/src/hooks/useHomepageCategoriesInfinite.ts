import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { HomepageCategoriesResult, CategorizedProductWithSale } from '../backend';

interface UseHomepageCategoriesInfiniteResult {
  categories: CategorizedProductWithSale[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => void;
}

export function useHomepageCategoriesInfinite(
  pageSize: number
): UseHomepageCategoriesInfiniteResult {
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = React.useState<typeof rawActor>(null);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [allCategories, setAllCategories] = React.useState<CategorizedProductWithSale[]>([]);
  const [totalCategories, setTotalCategories] = React.useState(0);

  // Stabilize actor reference
  React.useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  const { data, isLoading, isFetching, error } = useQuery<HomepageCategoriesResult>({
    queryKey: ['category-products', currentPage, pageSize],
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');
      
      return stableActor.getHomepageCategories(BigInt(currentPage), BigInt(pageSize));
    },
    enabled: Boolean(stableActor) && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Accumulate categories as pages load
  React.useEffect(() => {
    if (data?.categories) {
      setAllCategories((prev) => {
        // Avoid duplicates by checking if we already have these categories
        const existingIds = new Set(prev.map((c) => Number(c.categoryId)));
        const newCategories = data.categories.filter(
          (c) => !existingIds.has(Number(c.categoryId))
        );
        return [...prev, ...newCategories];
      });
      setTotalCategories(Number(data.totalCategories));
    }
  }, [data]);

  const hasMore = allCategories.length < totalCategories;
  const isFetchingMore = isFetching && currentPage > 0;

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Return true for isLoading until stable actor is available and initial fetch completes
  const isInitialLoading = !stableActor || actorFetching || (isLoading && currentPage === 0);

  return {
    categories: allCategories,
    isLoading: isInitialLoading,
    isFetchingMore,
    hasMore,
    error: error as Error | null,
    loadMore,
  };
}
