import { useStableActorQuery } from './useStableActorQuery';
import { useStableActor } from './useStableActor';
import type { ProductWithSale } from '../backend';

interface UseCategoryProductsPaginatedResult {
  products: ProductWithSale[];
  totalCount: number;
  isLoading: boolean;
  isInitialLoading: boolean;
  isFetched: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching paginated category products with featured-first ordering and sale-aware pricing from backend.
 * Uses stable actor pattern to prevent duplicate requests and supports refetch for retry functionality.
 * Accepts dynamic pageSize parameter for responsive product loading (desktop vs mobile).
 */
export function useGetCategoryProductsPaginated(
  categoryId: number | null,
  page: number,
  pageSize: number
): UseCategoryProductsPaginatedResult {
  const { isActorFetching } = useStableActor();

  const query = useStableActorQuery<{ products: ProductWithSale[]; totalCount: number }>(
    async (actor) => {
      if (categoryId === null) {
        throw new Error('Category ID not available');
      }
      const response = await actor.getProductsPageFeaturedFirst(
        '',
        BigInt(categoryId),
        BigInt(page),
        BigInt(pageSize)
      );

      return {
        products: response.items,
        totalCount: Number(response.totalCount),
      };
    },
    ['category-products', categoryId, page, pageSize] as const,
    {
      enabled: categoryId !== null,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  return {
    products: query.data?.products ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    isInitialLoading: isActorFetching || query.isLoading,
    isFetched: query.isFetched,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
