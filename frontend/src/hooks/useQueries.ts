import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';
import type { Category as BackendCategory } from '../backend';
import { numberToBigInt, bigIntToNumber } from '../utils/categoryNumeric';

// UI Category type with number fields for easier manipulation
export interface Category {
  categoryId: number;
  name: string;
  order: number;
  createdDate: number;
  lastUpdatedDate: number;
}

/**
 * Convert backend Category (with bigint fields) to UI Category (with number fields)
 */
function backendCategoryToUI(backendCat: BackendCategory): Category {
  return {
    categoryId: bigIntToNumber(backendCat.categoryId),
    name: backendCat.name,
    order: bigIntToNumber(backendCat.order),
    createdDate: bigIntToNumber(backendCat.createdDate),
    lastUpdatedDate: bigIntToNumber(backendCat.lastUpdatedDate),
  };
}

// Query Keys
const QUERY_KEYS = {
  categories: ['categories'] as const,
  category: (id: number) => ['category', id] as const,
};

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

/**
 * Fetch all categories sorted by order
 */
export function useGetAllCategories() {
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

  return useQuery<Category[]>({
    queryKey: QUERY_KEYS.categories,
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');
      
      try {
        const backendCategories = await stableActor.getAllCategories();
        return backendCategories.map(backendCategoryToUI);
      } catch (error) {
        reportErrorWithToast(
          error,
          'Error al cargar las categorías',
          { operation: 'getAllCategories' }
        );
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

/**
 * Fetch single category by ID
 */
export function useGetCategoryById(categoryId: number | null) {
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

  const query = useQuery<Category | null>({
    queryKey: QUERY_KEYS.category(categoryId ?? 0),
    queryFn: async ({ signal }) => {
      if (!stableActor || categoryId === null) return null;
      if (signal?.aborted) throw new Error('Query aborted');
      
      try {
        const result = await stableActor.getCategoryById(numberToBigInt(categoryId));
        return result ? backendCategoryToUI(result) : null;
      } catch (error) {
        reportErrorWithToast(
          error,
          'Error al cargar la categoría',
          { operation: 'getCategoryById', additionalInfo: { categoryId } }
        );
        throw error;
      }
    },
    enabled: Boolean(stableActor) && categoryId !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isInitialLoading: actorFetching || (!stableActor) || query.isLoading,
    isFetched: !!stableActor && query.isFetched,
  };
}

// ============================================================================
// CATEGORY MUTATIONS
// ============================================================================

/**
 * Create new category
 */
export function useCreateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, order }: { name: string; order: number }) => {
      if (!actor) throw new Error('Actor not available');
      
      const backendCat = await actor.createCategory(name, numberToBigInt(order));
      return backendCategoryToUI(backendCat);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      reportSuccessWithToast('Categoría creada exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al crear la categoría');
    },
  });
}

/**
 * Update existing category
 */
export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      name,
      order,
    }: {
      categoryId: number;
      name: string;
      order: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const backendCat = await actor.updateCategory(
        numberToBigInt(categoryId),
        name,
        numberToBigInt(order)
      );
      return backendCategoryToUI(backendCat);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      reportSuccessWithToast('Categoría actualizada exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al actualizar la categoría');
    },
  });
}

/**
 * Delete category
 */
export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(numberToBigInt(categoryId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      reportSuccessWithToast('Categoría eliminada exitosamente');
    },
    onError: (error: any) => {
      // Extract Spanish error message from backend if available
      const errorMessage = error?.message || 'Error al eliminar la categoría';
      reportErrorWithToast(error, errorMessage);
    },
  });
}

/**
 * Reorder categories
 */
export function useReorderCategories() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOrder: Array<[number, number]>) => {
      if (!actor) throw new Error('Actor not available');
      
      // Convert [number, number][] to [bigint, bigint][] for backend
      const bigIntOrder: Array<[bigint, bigint]> = newOrder.map(([id, order]) => [
        numberToBigInt(id),
        numberToBigInt(order),
      ]);
      
      return actor.reorderCategories(bigIntOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      reportSuccessWithToast('Orden actualizado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al reordenar las categorías');
    },
  });
}
