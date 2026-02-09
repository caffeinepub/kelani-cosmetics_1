import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import HomeHeroSection from '../../components/public/home/HomeHeroSection';
import HomepageCategoriesSection from '../../components/public/home/HomepageCategoriesSection';

export default function HomePage() {
  const queryClient = useQueryClient();

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['categories'], exact: false });
      queryClient.removeQueries({ queryKey: ['featured-products'], exact: false });
      queryClient.removeQueries({ queryKey: ['category-products'], exact: false });
    };
  }, [queryClient]);

  return (
    <div className="space-y-8">
      <HomeHeroSection />
      <HomepageCategoriesSection />
    </div>
  );
}
