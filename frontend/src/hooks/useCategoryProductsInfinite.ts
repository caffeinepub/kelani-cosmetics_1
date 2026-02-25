import { useInfiniteQuery } from '@tanstack/react-query';
import { useStableActor } from './useStableActor';
import type { ProductWithSale } from '../backend';

interface PageData {
  products: ProductWithSale[];
  totalCount: number;
}

interface UseCategoryProductsInfiniteResult {
  products: ProductWithSale[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalCount: number;
  error: Error | null;
  fetchNextPage: () => void;
}

export function useCategoryProductsInfinite(
  categoryId: number | null,
  pageSize: number
): UseCategoryProductsInfiniteResult {
  const { stableActor, isActorFetching } = useStableActor();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery<PageData>({
    queryKey: ['category-products', categoryId, pageSize],
    queryFn: async ({ pageParam, signal }) => {
      if (!stableActor || categoryId === null) {
        throw new Error('Actor or category ID not available');
      }
      if (signal?.aborted) throw new Error('Query aborted');
      const response = await stableActor.getProductsPageFeaturedFirst(
        '',
        BigInt(categoryId),
        BigInt(pageParam as number),
        BigInt(pageSize)
      );
      return {
        products: response.items as ProductWithSale[],
        totalCount: Number(response.totalCount),
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const totalLoaded = pages.reduce(
        (acc, page) => acc + page.products.length,
        0
      );
      if (totalLoaded >= lastPage.totalCount) return undefined;
      return pages.length; // next page index
    },
    enabled: !!stableActor && categoryId !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return {
    products,
    isLoading: isActorFetching || isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    totalCount,
    error: error as Error | null,
    fetchNextPage,
  };
}
