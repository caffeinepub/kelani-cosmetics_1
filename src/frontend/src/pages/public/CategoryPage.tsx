import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetCategoryProductsPaginated } from '../../hooks/useCategoryProductsPaginated';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import { useGetCategoryById } from '../../hooks/useQueries';
import ProductGrid from '../../components/public/products/ProductGrid';
import { Button } from '../../components/ui/button';

export default function CategoryPage() {
  const { id } = useParams({ from: '/public/category/$id' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: storeDetailsArray } = useBothStoreDetails();

  const categoryIdNum = id ? Number(id) : 0;
  const isValidCategoryId = id && id !== '0';

  const { data: category } = useGetCategoryById(categoryIdNum);

  const {
    products,
    totalCount,
    isLoading,
    error,
  } = useGetCategoryProductsPaginated(categoryIdNum, page, pageSize);

  const hasMore = products.length > 0 && products.length + page * pageSize < totalCount;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['category-products'], exact: false });
    };
  }, [queryClient]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 500;

      if (scrollPosition >= threshold) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleLoadMore, isLoading, hasMore]);

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

  if (isLoading && page === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-lg text-destructive">Error al cargar los productos</p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} variant="outline">
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

      {products.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-lg text-muted-foreground">No hay productos en esta categoría</p>
        </div>
      ) : (
        <>
          <ProductGrid
            products={products.map((p) => ({
              product: p.product,
              salePrice: p.salePrice,
              discountPercentage: p.discountPercentage,
              isOnSale: p.isOnSale,
            }))}
            storeDetails={storeDetailsArray || []}
          />

          {isLoading && page > 0 && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!hasMore && products.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay más productos</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
