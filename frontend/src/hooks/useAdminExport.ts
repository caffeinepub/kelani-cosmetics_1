import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
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
  const actorState = useActor();
  const rawActor = actorState.actor;
  const actorFetching = actorState.isFetching;

  const [stableActor, setStableActor] = React.useState<typeof rawActor>(null);

  // Stabilize actor reference
  React.useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  return useQuery<{
    categories: number;
    products: number;
    featured: number;
    onSale: number;
  }>({
    queryKey: QUERY_KEYS.exportStatistics,
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');

      try {
        const [categories, totalProducts, featuredProducts, activeSales] = await Promise.all([
          stableActor.getAllCategories(),
          stableActor.getTotalProductCount(),
          stableActor.getFeaturedProducts(),
          stableActor.getActiveSales(),
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
    enabled: Boolean(stableActor) && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
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
