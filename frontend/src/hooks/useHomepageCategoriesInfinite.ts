import { useInfiniteQuery } from '@tanstack/react-query';
import { useStableActor } from './useStableActor';
import type { CategorizedProductWithSale, HomepageCategoriesResult } from '../backend';

interface UseHomepageCategoriesInfiniteResult {
  categories: CategorizedProductWithSale[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalCategories: number;
  error: Error | null;
  fetchNextPage: () => void;
}

export function useHomepageCategoriesInfinite(
  pageSize: number
): UseHomepageCategoriesInfiniteResult {
  const { stableActor, isActorFetching } = useStableActor();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery<HomepageCategoriesResult>({
    queryKey: ['homepage-categories', pageSize],
    queryFn: async ({ pageParam, signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');
      return stableActor.getHomepageCategories(BigInt(pageParam as number), BigInt(pageSize));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const totalLoaded = pages.reduce(
        (acc, page) => acc + page.categories.length,
        0
      );
      const total = Number(lastPage.totalCategories);
      if (totalLoaded >= total) return undefined;
      return pages.length; // next page index
    },
    enabled: !!stableActor,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const categories = data?.pages.flatMap((page) => page.categories) ?? [];
  const totalCategories = data?.pages[0]
    ? Number(data.pages[0].totalCategories)
    : 0;

  return {
    categories,
    isLoading: isActorFetching || isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    totalCategories,
    error: error as Error | null,
    fetchNextPage,
  };
}
