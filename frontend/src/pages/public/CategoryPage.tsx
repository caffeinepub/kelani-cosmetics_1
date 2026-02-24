import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useGetCategoryProductsPaginated } from '../../hooks/useCategoryProductsPaginated';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import { useGetCategoryById } from '../../hooks/useQueries';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useIsMobile } from '../../hooks/useMediaQuery';
import ProductGrid from '../../components/public/products/ProductGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/button';
import type { ProductWithSale } from '../../backend';

const MIN_LOADING_DURATION_MS = 800;

export default function CategoryPage() {
  const { id } = useParams({ from: '/public/category/$id' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [accumulatedProducts, setAccumulatedProducts] = useState<ProductWithSale[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Separate loading state for pagination (not initial load)
  // isLoadingMore controls only the spinner — products are appended independently
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Device detection for responsive page size
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 5 : 10;

  const currentCategoryIdRef = useRef<string | undefined>(id);
  const previousPageSizeRef = useRef<number>(pageSize);

  // Track which pages have already been processed to prevent duplicates
  const processedPagesRef = useRef<Set<string>>(new Set());

  // Independent minimum-duration timer for the spinner
  const minDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: storeDetailsArray } = useBothStoreDetails();

  const categoryIdNum = id ? Number(id) : 0;
  const isValidCategoryId = Boolean(id && id !== '0');

  const { data: category, isInitialLoading: categoryLoading, isFetched: categoryFetched } = useGetCategoryById(categoryIdNum);

  const {
    products: currentPageProducts,
    totalCount: fetchedTotalCount,
    isLoading,
    isInitialLoading,
    isFetched,
    error,
    refetch,
  } = useGetCategoryProductsPaginated(categoryIdNum, page, pageSize);

  // Calculate hasMore based on accumulated products vs total count
  const hasMore = accumulatedProducts.length < totalCount && totalCount > 0;

  // Cleanup minimum duration timer
  const clearMinDurationTimer = useCallback(() => {
    if (minDurationTimerRef.current !== null) {
      clearTimeout(minDurationTimerRef.current);
      minDurationTimerRef.current = null;
    }
  }, []);

  // Reset state when category changes
  useEffect(() => {
    if (currentCategoryIdRef.current !== id) {
      currentCategoryIdRef.current = id;
      setPage(0);
      setAccumulatedProducts([]);
      setTotalCount(0);
      setIsLoadingMore(false);
      previousPageSizeRef.current = pageSize;
      processedPagesRef.current = new Set();
      clearMinDurationTimer();

      queryClient.removeQueries({ queryKey: ['category-products'], exact: false });
    }
  }, [id, queryClient, pageSize, clearMinDurationTimer]);

  // Reset state when pageSize changes (device orientation/resize)
  useEffect(() => {
    if (previousPageSizeRef.current !== pageSize && accumulatedProducts.length > 0) {
      previousPageSizeRef.current = pageSize;
      setPage(0);
      setAccumulatedProducts([]);
      setTotalCount(0);
      setIsLoadingMore(false);
      processedPagesRef.current = new Set();
      clearMinDurationTimer();

      queryClient.removeQueries({ queryKey: ['category-products'], exact: false });
    }
  }, [pageSize, queryClient, accumulatedProducts.length, clearMinDurationTimer]);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMinDurationTimer();
      queryClient.removeQueries({ queryKey: ['category-products'], exact: false });
    };
  }, [queryClient, clearMinDurationTimer]);

  // When page > 0 and loading starts, begin the independent spinner timer
  useEffect(() => {
    if (page > 0 && isLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      clearMinDurationTimer();
      // Spinner hides after minimum duration — independent of when products arrive
      minDurationTimerRef.current = setTimeout(() => {
        setIsLoadingMore(false);
        minDurationTimerRef.current = null;
      }, MIN_LOADING_DURATION_MS);
    }
  }, [page, isLoading, isLoadingMore, clearMinDurationTimer]);

  // Accumulate products immediately when new page data arrives
  // Products are appended right away — no buffering, no waiting for spinner
  useEffect(() => {
    if (currentPageProducts.length === 0) return;
    if (currentCategoryIdRef.current !== id) return;

    const pageKey = `${id}-${page}-${pageSize}`;

    if (processedPagesRef.current.has(pageKey)) return;
    processedPagesRef.current.add(pageKey);

    if (page === 0) {
      // Initial page: replace accumulated products
      setAccumulatedProducts(currentPageProducts);
    } else {
      // Pagination: immediately append with barcode-based deduplication
      setAccumulatedProducts((prev) => {
        const existingBarcodes = new Set(prev.map((p) => p.product.barcode));
        const newProducts = currentPageProducts.filter((p) => !existingBarcodes.has(p.product.barcode));
        if (newProducts.length === 0) return prev;
        return [...prev, ...newProducts];
      });
    }
  }, [currentPageProducts, id, page, pageSize]);

  // Update total count when fetched
  useEffect(() => {
    if (fetchedTotalCount > 0) {
      setTotalCount(fetchedTotalCount);
    }
  }, [fetchedTotalCount]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore && currentCategoryIdRef.current === id) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, isLoadingMore, hasMore, id]);

  // Use infinite scroll hook
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: handleLoadMore,
    enabled: isValidCategoryId && accumulatedProducts.length > 0,
    threshold: 500,
  });

  // Retry handler
  const handleRetry = useCallback(() => {
    setPage(0);
    setAccumulatedProducts([]);
    setTotalCount(0);
    setIsLoadingMore(false);
    processedPagesRef.current = new Set();
    clearMinDurationTimer();
    refetch();
  }, [refetch, clearMinDurationTimer]);

  if (!isValidCategoryId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-lg text-muted-foreground">Categoría no encontrada</p>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    );
  }

  // Initial loading state — show full-page spinner until actor is ready and first fetch completes
  if (isInitialLoading || !isFetched || categoryLoading || !categoryFetched) {
    return <LoadingSpinner message="Cargando productos..." />;
  }

  // Only show error after initial loading completes and no products are loaded
  if (error && accumulatedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-lg text-destructive">Error al cargar los productos</p>
        <div className="flex gap-3">
          <Button onClick={handleRetry} variant="outline">
            Reintentar
          </Button>
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </button>
      </div>

      {/* Category title */}
      {category && (
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{category.name}</h1>
        </div>
      )}

      {/* Empty state — only shown when no products and not loading */}
      {accumulatedProducts.length === 0 && !isLoading && !isLoadingMore ? (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-lg text-muted-foreground">No hay productos en esta categoría</p>
        </div>
      ) : (
        <>
          {/* ProductGrid — always visible, never hidden during pagination */}
          <ProductGrid
            products={accumulatedProducts}
            storeDetails={storeDetailsArray || []}
          />

          {/* Inline pagination loading spinner — appears below grid, never replaces it */}
          {isLoadingMore && (
            <LoadingSpinner message="Cargando más productos..." size="md" inline />
          )}

          {/* End of content message */}
          {!hasMore && accumulatedProducts.length > 0 && !isLoadingMore && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Has visto todos los productos de esta categoría</p>
            </div>
          )}

          {/* Sentinel element for IntersectionObserver — always present */}
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
