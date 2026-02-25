import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ProductWithSale } from '../backend';

interface UseCategoryProductsInfiniteResult {
  products: ProductWithSale[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  error: Error | null;
  loadMore: () => void;
}

/**
 * Custom hook that mirrors the useHomepageCategoriesInfinite pattern for category products.
 * Encapsulates all pagination state, accumulation logic, and loading states internally.
 * Resets when categoryId or pageSize changes.
 */
export function useCategoryProductsInfinite(
  categoryId: number | null,
  pageSize: number
): UseCategoryProductsInfiniteResult {
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = React.useState<typeof rawActor>(null);

  const [currentPage, setCurrentPage] = React.useState(0);
  const [allProducts, setAllProducts] = React.useState<ProductWithSale[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);

  // Track the key that identifies the current "session" to detect resets
  const sessionKeyRef = React.useRef(`${categoryId}-${pageSize}`);

  // Stabilize actor reference
  React.useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  // Reset all state when categoryId or pageSize changes
  React.useEffect(() => {
    const newKey = `${categoryId}-${pageSize}`;
    if (sessionKeyRef.current !== newKey) {
      sessionKeyRef.current = newKey;
      setCurrentPage(0);
      setAllProducts([]);
      setTotalCount(0);
    }
  }, [categoryId, pageSize]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['category-products-infinite', categoryId, currentPage, pageSize],
    queryFn: async ({ signal }) => {
      if (!stableActor || categoryId === null) {
        throw new Error('Actor or category ID not available');
      }
      if (signal?.aborted) throw new Error('Query aborted');

      const response = await stableActor.getProductsPageFeaturedFirst(
        '',
        BigInt(categoryId),
        BigInt(currentPage),
        BigInt(pageSize)
      );

      return {
        products: response.items as ProductWithSale[],
        totalCount: Number(response.totalCount),
      };
    },
    enabled: Boolean(stableActor) && !actorFetching && categoryId !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Accumulate products as pages load — same pattern as useHomepageCategoriesInfinite
  React.useEffect(() => {
    if (!data?.products) return;

    setAllProducts((prev) => {
      const existingBarcodes = new Set(prev.map((p) => p.product.barcode));
      const newProducts = data.products.filter(
        (p) => !existingBarcodes.has(p.product.barcode)
      );
      if (newProducts.length === 0) return prev;
      return [...prev, ...newProducts];
    });

    setTotalCount(data.totalCount);
  }, [data]);

  const hasMore = allProducts.length < totalCount;
  const isLoadingMore = isFetching && currentPage > 0;

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // isLoading is true until stable actor is ready and initial fetch completes
  const isInitialLoading =
    !stableActor || actorFetching || (isLoading && currentPage === 0);

  return {
    products: allProducts,
    isLoading: isInitialLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    error: error as Error | null,
    loadMore,
  };
}
