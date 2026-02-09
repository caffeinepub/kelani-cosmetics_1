import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ProductWithSale } from '../backend';

interface UseCategoryProductsPaginatedResult {
  products: ProductWithSale[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching paginated category products with featured-first ordering and sale-aware pricing from backend
 */
export function useGetCategoryProductsPaginated(
  categoryId: number | null,
  page: number,
  pageSize: number
): UseCategoryProductsPaginatedResult {
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = React.useState<typeof rawActor>(null);

  // Stabilize actor reference
  React.useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['category-products', categoryId, page, pageSize],
    queryFn: async ({ signal }) => {
      if (!stableActor || categoryId === null) {
        throw new Error('Actor or category ID not available');
      }
      if (signal?.aborted) throw new Error('Query aborted');

      const response = await stableActor.getProductsPageFeaturedFirst(
        '',
        BigInt(categoryId),
        BigInt(page),
        BigInt(pageSize)
      );

      // Backend now returns products with sale data integrated
      // Map to ProductWithSale format
      const products: ProductWithSale[] = response.items.map((product) => ({
        product,
        salePrice: undefined,
        discountPercentage: undefined,
        isOnSale: false,
      }));

      return {
        products,
        totalCount: Number(response.totalCount),
      };
    },
    enabled: Boolean(stableActor) && !actorFetching && categoryId !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    products: data?.products ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error: error as Error | null,
  };
}
