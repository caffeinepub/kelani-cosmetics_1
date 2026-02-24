import { memo } from 'react';
import { useHomepageCategoriesInfinite } from '../../../hooks/useHomepageCategoriesInfinite';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import CategorySection from './CategorySection';
import LoadingSpinner from '../../LoadingSpinner';
import type { StoreDetails } from '../../../backend';

interface HomepageCategoriesSectionProps {
  storeDetails: StoreDetails[];
}

function HomepageCategoriesSection({ storeDetails }: HomepageCategoriesSectionProps) {
  const { categories, hasMore, isLoading, isFetchingMore, loadMore, totalCategories } = useHomepageCategoriesInfinite(3);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isFetchingMore,
    onLoadMore: loadMore,
    enabled: categories.length > 0,
    threshold: 500,
  });

  // Initial loading is handled by HomePage
  if (categories.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No hay categorías disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <CategorySection
          key={category.categoryId.toString()}
          category={category}
          storeDetails={storeDetails}
        />
      ))}

      {/* Infinite scroll loading indicator */}
      {isFetchingMore && (
        <LoadingSpinner message="Cargando más categorías..." size="md" inline />
      )}

      {/* End of content message */}
      {!hasMore && categories.length > 0 && categories.length >= totalCategories && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay más categorías para mostrar</p>
        </div>
      )}

      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
    </div>
  );
}

export default memo(HomepageCategoriesSection);
