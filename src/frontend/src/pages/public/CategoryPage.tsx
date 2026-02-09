import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useActor } from '../../hooks/useActor';
import { useGetCategoryById } from '../../hooks/useQueries';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import ProductGrid from '../../components/public/products/ProductGrid';
import { Button } from '../../components/ui/button';
import type { ProductWithSale } from '../../backend';

const PAGE_SIZE = 15;

export default function CategoryPage() {
  const { id } = useParams({ from: '/public/category/$id' });
  const navigate = useNavigate();
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = useState<typeof rawActor>(null);

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
  const [products, setProducts] = useState<ProductWithSale[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Scroll to top when category ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  // Stabilize actor reference
  useEffect(() => {
    if (rawActor && !actorFetching) {
      setStableActor(rawActor);
    }
  }, [rawActor, actorFetching]);

  // Reset state when category changes
  useEffect(() => {
    setProducts([]);
    setCurrentPage(0);
    setTotalCount(0);
    setProductError(null);
    setInitialLoadComplete(false);
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

  // Load products for current page
  useEffect(() => {
    if (!stableActor || !isValidId || categoryLoading || categoryError) {
      return;
    }

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setProductError(null);

      try {
        const response = await stableActor.getProductsPageFeaturedFirst(
          '',
          BigInt(categoryId),
          BigInt(currentPage),
          BigInt(PAGE_SIZE)
        );

        const newProducts: ProductWithSale[] = response.items.map((product) => ({
          product,
          salePrice: undefined,
          discountPercentage: undefined,
          isOnSale: false,
        }));

        // Deduplicate by barcode when appending
        setProducts((prev) => {
          if (currentPage === 0) {
            return newProducts;
          }
          const existingBarcodes = new Set(prev.map((p) => p.product.barcode));
          const uniqueNewProducts = newProducts.filter(
            (p) => !existingBarcodes.has(p.product.barcode)
          );
          return [...prev, ...uniqueNewProducts];
        });

        setTotalCount(Number(response.totalCount));
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error loading products:', error);
        setProductError('Error al cargar los productos');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [stableActor, categoryId, currentPage, isValidId, categoryLoading, categoryError]);

  // Calculate hasMore
  const hasMore = products.length < totalCount;

  // Load more handler
  const handleLoadMore = () => {
    if (!isLoadingProducts && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Retry handler
  const handleRetry = () => {
    setProductError(null);
    setCurrentPage(0);
    setProducts([]);
    setInitialLoadComplete(false);
  };

  // Infinite scroll hook
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingProducts,
    onLoadMore: handleLoadMore,
    enabled: initialLoadComplete && products.length > 0 && !productError,
    threshold: 500,
  });

  // Show full-page spinner during initial load
  const showInitialSpinner =
    !stableActor || actorFetching || categoryLoading || (currentPage === 0 && isLoadingProducts);

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
  const productCountText =
    totalCount === 1 ? '1 producto' : `${totalCount} productos`;

  return (
    <div className="space-y-8 pb-12">
      {/* Category Header */}
      <div className="py-8 space-y-4">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </button>

        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {category.name}
          </h1>
          <p className="text-lg text-muted-foreground">{productCountText}</p>
        </div>
      </div>

      {/* Error State */}
      {productError && (
        <div className="text-center py-12 space-y-4">
          <p className="text-destructive">{productError}</p>
          <Button onClick={handleRetry} variant="outline">
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!productError && initialLoadComplete && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No hay productos en esta categoría
          </p>
        </div>
      )}

      {/* Product Grid */}
      {!productError && products.length > 0 && (
        <>
          <ProductGrid products={products} storeDetails={storeDetails} />

          {/* Loading More Indicator */}
          {isLoadingProducts && currentPage > 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">
                Cargando más productos...
              </span>
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
