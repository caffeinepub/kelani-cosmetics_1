import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useStableActorQuery } from './useStableActorQuery';
import { reportErrorWithToast } from '../utils/reportErrorWithToast';
import type { ExportPayload } from '../backend';

// Query Keys
const QUERY_KEYS = {
  exportData: ['export-data'] as const,
  exportStatistics: ['export-data', 'statistics'] as const,
};

// ============================================================================
// EXPORT QUERIES
// ============================================================================

/**
 * Fetch export statistics (counts)
 */
export function useExportStatistics() {
  return useStableActorQuery<{
    categories: number;
    products: number;
    featured: number;
    onSale: number;
  }>(
    async (actor) => {
      try {
        const [categories, totalProducts, featuredProducts, activeSales] = await Promise.all([
          actor.getAllCategories(),
          actor.getTotalProductCount(),
          actor.getFeaturedProducts(),
          actor.getActiveSales(),
        ]);

        return {
          categories: categories.length,
          products: Number(totalProducts),
          featured: featuredProducts.length,
          onSale: activeSales.length,
        };
      } catch (error) {
        reportErrorWithToast(error, 'Error al cargar las estadísticas', {
          operation: 'exportStatistics',
        });
        throw error;
      }
    },
    QUERY_KEYS.exportStatistics,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );
}

// ============================================================================
// EXPORT MUTATIONS
// ============================================================================

/**
 * Export all data
 */
export function useExportData() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (): Promise<ExportPayload> => {
      if (!actor) throw new Error('Actor not available');

      return await actor.exportAllData();
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al exportar los datos', {
        operation: 'exportAllData',
      });
    },
  });
}
