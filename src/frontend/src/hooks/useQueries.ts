import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';
import type { Category as BackendCategory } from '../backend';
import { numberToBigInt, bigIntToNumber, convertReorderArrayToBigInt } from '../utils/categoryNumeric';

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

  return useQuery<Category | null>({
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
    enabled: Boolean(stableActor) && !actorFetching && categoryId !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
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
      
      const backendCategory = await actor.createCategory(name, numberToBigInt(order));
      return backendCategoryToUI(backendCategory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      reportSuccessWithToast('Categoría creada exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(
        error,
        'Error al crear la categoría',
        { operation: 'createCategory' }
      );
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
      
      const backendCategory = await actor.updateCategory(
        numberToBigInt(categoryId),
        name,
        numberToBigInt(order)
      );
      return backendCategoryToUI(backendCategory);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.category(variables.categoryId) });
      reportSuccessWithToast('Categoría actualizada exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(
        error,
        'Error al actualizar la categoría',
        { operation: 'updateCategory' }
      );
    },
  });
}

/**
 * Extract Spanish error message from backend trap
 */
function extractBackendErrorMessage(error: unknown): string | null {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message);
    // Check if the message contains the specific Spanish error about products
    if (message.includes('No se puede eliminar') || message.includes('productos asociados')) {
      return message;
    }
  }
  return null;
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
      
      return await actor.deleteCategory(numberToBigInt(categoryId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      reportSuccessWithToast('Categoría eliminada exitosamente');
    },
    onError: (error) => {
      // Try to extract the backend's Spanish error message
      const backendMessage = extractBackendErrorMessage(error);
      
      if (backendMessage) {
        // Display the exact backend error message
        reportErrorWithToast(
          error,
          backendMessage,
          { operation: 'deleteCategory' }
        );
      } else {
        // Fallback to generic error
        reportErrorWithToast(
          error,
          'Error al eliminar la categoría',
          { operation: 'deleteCategory' }
        );
      }
    },
  });
}

/**
 * Reorder multiple categories
 */
export function useReorderCategories() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOrder: Array<[number, number]>) => {
      if (!actor) throw new Error('Actor not available');
      
      const bigIntOrder = convertReorderArrayToBigInt(newOrder);
      return await actor.reorderCategories(bigIntOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
      reportSuccessWithToast('Orden actualizado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(
        error,
        'Error al reordenar las categorías',
        { operation: 'reorderCategories' }
      );
    },
  });
}
