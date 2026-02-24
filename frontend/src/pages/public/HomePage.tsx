import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import { useHomepageCategoriesInfinite } from '../../hooks/useHomepageCategoriesInfinite';
import HomeHeroSection from '../../components/public/home/HomeHeroSection';
import HomepageCategoriesSection from '../../components/public/home/HomepageCategoriesSection';
import SeoHead from '../../components/seo/SeoHead';
import { homePageSeo } from '../../components/seo/seoPresets';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function HomePage() {
  const queryClient = useQueryClient();
  const { data: storeDetailsArray } = useBothStoreDetails();
  
  // Check initial loading state for categories
  const { isLoading: categoriesLoading, error: categoriesError } = useHomepageCategoriesInfinite(3);

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['categories'], exact: false });
      queryClient.removeQueries({ queryKey: ['featured-products'], exact: false });
      queryClient.removeQueries({ queryKey: ['category-products'], exact: false });
    };
  }, [queryClient]);

  // Show initial loading spinner
  if (categoriesLoading) {
    return (
      <>
        <SeoHead meta={homePageSeo} />
        <LoadingSpinner message="Cargando productos..." />
      </>
    );
  }

  // Show error state with retry
  if (categoriesError) {
    return (
      <>
        <SeoHead meta={homePageSeo} />
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <p className="text-lg text-destructive">Error al cargar los productos</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Reintentar
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead meta={homePageSeo} />
      <div className="space-y-8">
        <HomeHeroSection storeDetails={storeDetailsArray || []} />
        <HomepageCategoriesSection storeDetails={storeDetailsArray || []} />
      </div>
    </>
  );
}
