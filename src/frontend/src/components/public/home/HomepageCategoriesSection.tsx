import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useHomepageCategoriesInfinite } from '../../../hooks/useHomepageCategoriesInfinite';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import CategorySection from './CategorySection';

const HomepageCategoriesSection = React.memo(function HomepageCategoriesSection() {
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 5;

  const { categories, isLoading, isFetchingMore, hasMore, error, loadMore } =
    useHomepageCategoriesInfinite(pageSize);

  const [sentinelRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Trigger load more when sentinel is visible
  useEffect(() => {
    if (isIntersecting && hasMore && !isFetchingMore) {
      loadMore();
    }
  }, [isIntersecting, hasMore, isFetchingMore, loadMore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="space-y-12">
      {categories.map((category) => (
        <CategorySection
          key={Number(category.categoryId)}
          category={category}
          isMobile={isMobile}
        />
      ))}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef as React.RefObject<HTMLDivElement>} className="py-8">
          {isFetchingMore && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Cargando más categorías...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && categories.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No hay más categorías para mostrar</p>
        </div>
      )}
    </div>
  );
});

export default HomepageCategoriesSection;
