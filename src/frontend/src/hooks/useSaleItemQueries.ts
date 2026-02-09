import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';
import type { SaleItem as BackendSaleItem, SaleItemArray } from '../backend';
import { numberToBigInt, bigIntToNumber } from '../utils/categoryNumeric';
import { 
  dateStringToNanosecondsBigInt, 
  timestampToDateString,
  getCurrentTimestampBigInt 
} from '../utils/adminDate';

// UI SaleItem type - keeping timestamps as bigint for safe comparison
export interface SaleItem {
  saleId: number;
  productBarcode: string;
  barcode: string;
  name: string;
  description?: string;
  price?: number;
  salePrice: number;
  discountPercentage: number;
  categoryId: number;
  categoryName: string;
  startDate: bigint; // Changed to bigint for safe comparison
  endDate: bigint;   // Changed to bigint for safe comparison
  isActive: boolean;
  createdDate: bigint;
  lastUpdatedDate: bigint;
}

/**
 * Convert backend SaleItem (with bigint fields) to UI SaleItem
 * Keeps timestamps as bigint to avoid unsafe number conversions
 */
function backendSaleItemToUI(backendSaleItem: BackendSaleItem): SaleItem {
  return {
    saleId: bigIntToNumber(backendSaleItem.saleId),
    productBarcode: backendSaleItem.productBarcode,
    barcode: backendSaleItem.barcode,
    name: backendSaleItem.name,
    description: backendSaleItem.description,
    price: backendSaleItem.price,
    salePrice: backendSaleItem.salePrice,
    discountPercentage: backendSaleItem.discountPercentage,
    categoryId: bigIntToNumber(backendSaleItem.categoryId),
    categoryName: backendSaleItem.categoryName,
    startDate: backendSaleItem.startDate, // Keep as bigint
    endDate: backendSaleItem.endDate,     // Keep as bigint
    isActive: backendSaleItem.isActive,
    createdDate: backendSaleItem.createdDate,
    lastUpdatedDate: backendSaleItem.lastUpdatedDate,
  };
}

/**
 * Determine sale status based on dates and active flag
 * Uses BigInt-safe timestamp comparison
 */
export function getSaleStatus(saleItem: SaleItem): 'active' | 'upcoming' | 'expired' {
  const now = getCurrentTimestampBigInt();
  
  if (now < saleItem.startDate) {
    return 'upcoming';
  } else if (now > saleItem.endDate) {
    return 'expired';
  } else if (saleItem.isActive) {
    return 'active';
  } else {
    return 'expired'; // Inactive within date range treated as expired
  }
}

// Query Keys
const QUERY_KEYS = {
  saleItems: (search: string, page: number, pageSize: number, includeInactive: boolean) =>
    ['sale-items', search, page, pageSize, includeInactive] as const,
};

// ============================================================================
// SALE ITEM QUERIES
// ============================================================================

/**
 * Fetch paginated sale items with search
 */
export function useGetSaleItemsPage(
  search: string,
  page: number,
  pageSize: number,
  includeInactive: boolean
) {
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

  return useQuery<{ items: SaleItem[]; totalCount: number }>({
    queryKey: QUERY_KEYS.saleItems(search, page, pageSize, includeInactive),
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');

      try {
        const response: SaleItemArray = await stableActor.getSaleItemsPage(
          search,
          BigInt(page),
          BigInt(pageSize),
          includeInactive
        );

        const items = response.items.map(backendSaleItemToUI);

        return {
          items,
          totalCount: Number(response.totalCount),
        };
      } catch (error) {
        reportErrorWithToast(error, 'Error al cargar los productos en oferta', {
          operation: 'getSaleItemsPage',
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
// SALE ITEM MUTATIONS
// ============================================================================

/**
 * Create new sale item
 * Uses BigInt-safe date conversion
 */
export function useCreateSaleItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productBarcode,
      salePrice,
      startDate,
      endDate,
    }: {
      productBarcode: string;
      salePrice: number;
      startDate: string;
      endDate: string;
    }) => {
      if (!actor) throw new Error('Actor not available');

      try {
        // Convert dates to BigInt nanoseconds directly - no unsafe number conversion
        const startTimestamp = dateStringToNanosecondsBigInt(startDate);
        const endTimestamp = dateStringToNanosecondsBigInt(endDate);

        const backendSaleItem = await actor.createSaleItem(
          productBarcode,
          salePrice,
          startTimestamp, // Pass bigint directly
          endTimestamp    // Pass bigint directly
        );
        return backendSaleItemToUI(backendSaleItem);
      } catch (error) {
        console.error('Create sale item error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-items'] });
      reportSuccessWithToast('Producto en oferta creado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al crear el producto en oferta', {
        operation: 'createSaleItem',
      });
    },
  });
}

/**
 * Update existing sale item
 * Uses BigInt-safe date conversion
 */
export function useUpdateSaleItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      saleId,
      salePrice,
      startDate,
      endDate,
    }: {
      saleId: number;
      salePrice: number;
      startDate: string;
      endDate: string;
    }) => {
      if (!actor) throw new Error('Actor not available');

      try {
        // Convert dates to BigInt nanoseconds directly - no unsafe number conversion
        const startTimestamp = dateStringToNanosecondsBigInt(startDate);
        const endTimestamp = dateStringToNanosecondsBigInt(endDate);

        const backendSaleItem = await actor.updateSaleItem(
          numberToBigInt(saleId),
          salePrice,
          startTimestamp, // Pass bigint directly
          endTimestamp    // Pass bigint directly
        );
        return backendSaleItemToUI(backendSaleItem);
      } catch (error) {
        console.error('Update sale item error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-items'] });
      reportSuccessWithToast('Producto en oferta actualizado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al actualizar el producto en oferta', {
        operation: 'updateSaleItem',
      });
    },
  });
}

/**
 * Delete sale item
 */
export function useDeleteSaleItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: number) => {
      if (!actor) throw new Error('Actor not available');

      return await actor.deleteSaleItem(numberToBigInt(saleId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-items'] });
      reportSuccessWithToast('Producto en oferta eliminado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al eliminar el producto en oferta', {
        operation: 'deleteSaleItem',
      });
    },
  });
}

/**
 * Toggle sale item active status
 */
export function useToggleSaleItemActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: number) => {
      if (!actor) throw new Error('Actor not available');

      const newStatus = await actor.toggleSaleItemActiveStatus(numberToBigInt(saleId));
      return { saleId, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-items'] });
      reportSuccessWithToast('Estado actualizado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al actualizar el estado', {
        operation: 'toggleSaleItemActive',
      });
    },
  });
}
