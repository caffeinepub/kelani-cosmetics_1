import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetCategoryById } from '../../hooks/useQueries';
import { useGetCategoryProductsPaginated } from '../../hooks/useCategoryProductsPaginated';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import ProductGrid from '../../components/public/products/ProductGrid';
import { Button } from '../../components/ui/button';
import type { ProductWithSale } from '../../backend';

const PAGE_SIZE = 15;

export default function CategoryPage() {
  const { id } = useParams({ from: '/public/category/$id' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch store details for modal
  const { data: storeDetailsArray } = useBothStoreDetails();
  const storeDetails = storeDetailsArray?.[0] ?? null;

  // Parse category ID
  const categoryId = parseInt(id, 10);
  const isValidId = !isNaN(categoryId) && categoryId > 0;

  // Fetch category details
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetCategoryById(isValidId ? categoryId : null);

  // Product pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [allProducts, setAllProducts] = useState<ProductWithSale[]>([]);

  // Fetch products for current page
  const {
    products: pageProducts,
    totalCount,
    isLoading: isLoadingProducts,
    error: productError,
  } = useGetCategoryProductsPaginated(isValidId ? categoryId : null, currentPage, PAGE_SIZE);

  // Scroll to top when category ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  // Reset state when category changes
  useEffect(() => {
    setAllProducts([]);
    setCurrentPage(0);
  }, [categoryId]);

  // Redirect if invalid category ID
  useEffect(() => {
    if (!isValidId) {
      navigate({ to: '/' });
      return;
    }
  }, [isValidId, navigate]);

  // Redirect if category not found after loading
  useEffect(() => {
    if (!categoryLoading && categoryError) {
      navigate({ to: '/' });
    }
  }, [categoryLoading, categoryError, navigate]);

  // Accumulate products as pages load
  useEffect(() => {
    if (pageProducts.length > 0) {
      setAllProducts((prev) => {
        if (currentPage === 0) {
          return pageProducts;
        }
        const existingBarcodes = new Set(prev.map((p) => p.product.barcode));
        const uniqueNewProducts = pageProducts.filter(
          (p) => !existingBarcodes.has(p.product.barcode)
        );
        return [...prev, ...uniqueNewProducts];
      });
    }
  }, [pageProducts, currentPage]);

  // Calculate hasMore
  const hasMore = allProducts.length < totalCount;

  // Load more handler
  const handleLoadMore = () => {
    if (!isLoadingProducts && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Retry handler
  const handleRetry = () => {
    setCurrentPage(0);
    setAllProducts([]);
  };

  // Infinite scroll hook
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingProducts,
    onLoadMore: handleLoadMore,
    enabled: allProducts.length > 0 && !productError,
    threshold: 500,
  });

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['category'], exact: false });
      queryClient.removeQueries({ queryKey: ['category-products'], exact: false });
    };
  }, [queryClient]);

  // Show full-page spinner during initial load
  const showInitialSpinner = categoryLoading || (currentPage === 0 && isLoadingProducts);

  if (showInitialSpinner) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  // Product count with proper pluralization
  const productCountText = totalCount === 1 ? '1 producto' : `${totalCount} productos`;

  return (
    <div className="space-y-8 pb-12">
      {/* Category Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </button>

        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{category.name}</h1>
          <p className="text-lg text-muted-foreground">{productCountText}</p>
        </div>
      </div>

      {/* Error State */}
      {productError && (
        <div className="text-center py-12 space-y-4">
          <p className="text-destructive">Error al cargar los productos</p>
          <Button onClick={handleRetry} variant="outline">
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!productError && !isLoadingProducts && allProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay productos en esta categoría</p>
        </div>
      )}

      {/* Product Grid */}
      {!productError && allProducts.length > 0 && (
        <>
          <ProductGrid products={allProducts} storeDetails={storeDetails} />

          {/* Loading More Indicator */}
          {isLoadingProducts && currentPage > 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Cargando más productos...</span>
            </div>
          )}

          {/* End of Content Message */}
          {!hasMore && !isLoadingProducts && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                Has visto todos los productos de esta categoría
              </p>
            </div>
          )}

          {/* Sentinel element for infinite scroll */}
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
