import React, { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useHomepageCategoriesInfinite } from '../../../hooks/useHomepageCategoriesInfinite';
import { throttle } from '../../../utils/throttle';
import CategorySection from './CategorySection';
import { useIsMobile } from '../../../hooks/useMediaQuery';

const HomepageCategoriesSection = React.memo(function HomepageCategoriesSection() {
  const isMobile = useIsMobile();
  // Fixed page size of 5 categories per load for all devices
  const pageSize = 5;

  const { categories, isLoading, isFetchingMore, hasMore, error, loadMore } =
    useHomepageCategoriesInfinite(pageSize);

  // Scroll handler with throttling
  const handleScroll = useCallback(
    throttle(() => {
      // Calculate distance to bottom
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

      // Trigger load when within 500px of bottom
      if (distanceToBottom <= 500 && hasMore && !isFetchingMore) {
        loadMore();
      }
    }, 200), // Throttle to 200ms
    [hasMore, isFetchingMore, loadMore]
  );

  // Attach scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

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

      {/* Loading indicator when fetching more */}
      {isFetchingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Cargando más categorías...</span>
        </div>
      )}

      {/* End of content message */}
      {!hasMore && categories.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No hay más categorías para mostrar</p>
        </div>
      )}
    </div>
  );
});

export default HomepageCategoriesSection;
