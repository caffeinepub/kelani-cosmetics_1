import React, { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useHomepageCategoriesInfinite } from '../../../hooks/useHomepageCategoriesInfinite';
import { useBothStoreDetails } from '../../../hooks/useBothStoreDetails';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import CategorySection from './CategorySection';
import { throttle } from '../../../utils/throttle';

const PAGE_SIZE = 5;

const HomepageCategoriesSection = React.memo(function HomepageCategoriesSection() {
  const isMobile = useIsMobile();
  const { categories, isLoading, error, hasMore, loadMore } = useHomepageCategoriesInfinite(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch store details for modal
  const { data: storeDetailsArray } = useBothStoreDetails();
  const storeDetails = storeDetailsArray?.[0] ?? null;

  const handleScroll = useCallback(
    throttle(() => {
      if (isLoadingMore || !hasMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 500) {
        setIsLoadingMore(true);
        loadMore();
        // Reset loading state after a short delay
        setTimeout(() => setIsLoadingMore(false), 500);
      }
    }, 300),
    [hasMore, isLoadingMore, loadMore]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar las categorías</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay categorías disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {categories.map((category) => (
        <CategorySection
          key={category.categoryId}
          category={category}
          isMobile={isMobile}
          storeDetails={storeDetails}
        />
      ))}

      {isLoadingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Cargando más categorías...</span>
        </div>
      )}

      {!hasMore && !isLoadingMore && categories.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Has visto todas las categorías disponibles
          </p>
        </div>
      )}
    </div>
  );
});

export default HomepageCategoriesSection;
