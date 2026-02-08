import { useQuery, useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ExportPayload } from '../backend';

interface ExportStatistics {
  totalCategories: number;
  totalProducts: number;
  featuredProducts: number;
  onSaleProducts: number;
}

/**
 * Hook to fetch live export statistics
 */
export function useExportStatistics() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExportStatistics>({
    queryKey: ['export-statistics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');

      try {
        const [categories, featuredProducts, activeSales] = await Promise.all([
          actor.getAllCategories(),
          actor.getFeaturedProducts(),
          actor.getActiveSales(),
        ]);

        // Get total product count
        const totalProducts = await actor.getTotalProductCount();

        return {
          totalCategories: categories.length,
          totalProducts: Number(totalProducts),
          featuredProducts: featuredProducts.length,
          onSaleProducts: activeSales.length,
        };
      } catch (error) {
        console.error('Error fetching export statistics:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

/**
 * Hook to export all data
 */
export function useExportData() {
  const { actor } = useActor();

  return useMutation<ExportPayload, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');

      try {
        const exportData = await actor.exportAllData();
        return exportData;
      } catch (error) {
        console.error('Error exporting data:', error);
        throw error;
      }
    },
  });
}
