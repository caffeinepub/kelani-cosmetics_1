import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetCategoryProductsPaginated } from '../../hooks/useCategoryProductsPaginated';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import { useGetCategoryById } from '../../hooks/useQueries';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import ProductGrid from '../../components/public/products/ProductGrid';
import { Button } from '../../components/ui/button';
import type { ProductWithSale } from '../../backend';

export default function CategoryPage() {
  const { id } = useParams({ from: '/public/category/$id' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [accumulatedProducts, setAccumulatedProducts] = useState<ProductWithSale[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const currentCategoryIdRef = useRef<string | undefined>(id);

  const { data: storeDetailsArray } = useBothStoreDetails();

  const categoryIdNum = id ? Number(id) : 0;
  const isValidCategoryId = Boolean(id && id !== '0');

  const { data: category } = useGetCategoryById(categoryIdNum);

  const {
    products: currentPageProducts,
    totalCount: fetchedTotalCount,
    isLoading,
    error,
    refetch,
  } = useGetCategoryProductsPaginated(categoryIdNum, page, pageSize);

  // Calculate hasMore based on accumulated products vs total count
  const hasMore = accumulatedProducts.length < totalCount && totalCount > 0;

  // Reset state when category changes
  useEffect(() => {
    if (currentCategoryIdRef.current !== id) {
      // Category changed - reset everything
      currentCategoryIdRef.current = id;
      setPage(0);
      setAccumulatedProducts([]);
      setTotalCount(0);
      
      // Clear React Query cache for previous category
      queryClient.removeQueries({ queryKey: ['category-products'], exact: false });
    }
  }, [id, queryClient]);

  // Scroll to top when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['category-products'], exact: false });
    };
  }, [queryClient]);

  // Accumulate products when new page data arrives
  useEffect(() => {
    if (currentPageProducts.length > 0 && !isLoading) {
      // Only accumulate if this is for the current category
      if (currentCategoryIdRef.current === id) {
        setAccumulatedProducts((prev) => {
          // Deduplicate by barcode
          const existingBarcodes = new Set(prev.map((p) => p.product.barcode));
          const newProducts = currentPageProducts.filter(
            (p) => !existingBarcodes.has(p.product.barcode)
          );
          
          // Combine and maintain featured-first ordering
          const combined = [...prev, ...newProducts];
          return combined.sort((a, b) => {
            // Featured products first
            if (a.product.isFeatured && !b.product.isFeatured) return -1;
            if (!a.product.isFeatured && b.product.isFeatured) return 1;
            return 0;
          });
        });
      }
    }
  }, [currentPageProducts, isLoading, id]);

  // Update total count when fetched
  useEffect(() => {
    if (fetchedTotalCount > 0) {
      setTotalCount(fetchedTotalCount);
    }
  }, [fetchedTotalCount]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && currentCategoryIdRef.current === id) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore, id]);

  // Use infinite scroll hook
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: handleLoadMore,
    enabled: isValidCategoryId && accumulatedProducts.length > 0,
    threshold: 500,
  });

  // Retry handler that uses refetch instead of reload
  const handleRetry = useCallback(() => {
    setPage(0);
    setAccumulatedProducts([]);
    setTotalCount(0);
    refetch();
  }, [refetch]);

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

  // Initial loading state (page 0, no accumulated products yet)
  if (isLoading && page === 0 && accumulatedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

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

      {category && (
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{category.name}</h1>
        </div>
      )}

      {accumulatedProducts.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-lg text-muted-foreground">No hay productos en esta categoría</p>
        </div>
      ) : (
        <>
          <ProductGrid
            products={accumulatedProducts}
            storeDetails={storeDetailsArray || []}
          />

          {/* Subsequent loading state (after at least one page is displayed) */}
          {isLoading && page > 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Cargando más productos...</p>
            </div>
          )}

          {/* End of content message */}
          {!hasMore && accumulatedProducts.length > 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Has visto todos los productos de esta categoría</p>
            </div>
          )}

          {/* Sentinel element for intersection observer */}
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
