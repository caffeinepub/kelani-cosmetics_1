import { useParams, useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCategoryProductsInfinite } from '../../hooks/useCategoryProductsInfinite';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import { useGetCategoryById } from '../../hooks/useQueries';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useIsMobile } from '../../hooks/useMediaQuery';
import ProductGrid from '../../components/public/products/ProductGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function CategoryPage() {
  const { id } = useParams({ from: '/public/category/$id' });
  const navigate = useNavigate();

  const isMobile = useIsMobile();
  const pageSize = isMobile ? 5 : 10;

  const categoryIdNum = id ? Number(id) : null;
  const isValidCategoryId = Boolean(id && id !== '0');

  const {
    products,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
  } = useCategoryProductsInfinite(isValidCategoryId ? categoryIdNum : null, pageSize);

  const { data: storeDetailsArray } = useBothStoreDetails();

  const {
    data: category,
    isInitialLoading: categoryLoading,
    isFetched: categoryFetched,
  } = useGetCategoryById(categoryIdNum ?? 0);

  // Stable loadMore callback for the scroll hook
  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  // Infinite scroll sentinel
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: handleLoadMore,
    enabled: isValidCategoryId && products.length > 0,
    threshold: 500,
  });

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

  // Initial loading — show full-page spinner until actor is ready and first fetch completes
  if (isLoading || categoryLoading || !categoryFetched) {
    return <LoadingSpinner message="Cargando productos..." />;
  }

  // Error state — only shown when no products are loaded
  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-lg text-destructive">Error al cargar los productos</p>
        <div className="flex gap-3">
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
      {products.length === 0 && !isLoadingMore ? (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-lg text-muted-foreground">No hay productos en esta categoría</p>
        </div>
      ) : (
        <>
          {/* ProductGrid — always visible, never hidden during pagination */}
          <ProductGrid
            products={products}
            storeDetails={storeDetailsArray || []}
          />

          {/* Inline pagination loading spinner — appears below grid, never replaces it */}
          {isLoadingMore && (
            <LoadingSpinner message="Cargando más productos..." size="md" inline />
          )}

          {/* End of content message */}
          {!hasMore && products.length > 0 && !isLoadingMore && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay más productos en esta categoría</p>
            </div>
          )}

          {/* Sentinel element for IntersectionObserver — always present */}
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
