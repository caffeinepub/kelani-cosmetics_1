import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';
import type { SaleItem as BackendSaleItem, SaleItemArray } from '../backend';
import { numberToBigInt, bigIntToNumber } from '../utils/categoryNumeric';
import { dateStringToTimestamp, timestampToDateString } from '../utils/adminDate';
import type { SaleStatus } from '../pages/admin/OnSaleProductsPage';

// UI SaleItem type with number fields for easier manipulation
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
  startDate: number;
  endDate: number;
  isActive: boolean;
  createdDate: number;
  lastUpdatedDate: number;
}

/**
 * Convert backend SaleItem (with bigint fields) to UI SaleItem (with number fields)
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
    startDate: bigIntToNumber(backendSaleItem.startDate),
    endDate: bigIntToNumber(backendSaleItem.endDate),
    isActive: backendSaleItem.isActive,
    createdDate: bigIntToNumber(backendSaleItem.createdDate),
    lastUpdatedDate: bigIntToNumber(backendSaleItem.lastUpdatedDate),
  };
}

/**
 * Determine sale status based on dates and active flag
 */
export function getSaleStatus(saleItem: SaleItem): 'active' | 'upcoming' | 'expired' {
  const now = Date.now() * 1_000_000; // Convert to nanoseconds
  
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

/**
 * Filter sale items by status on the client side
 */
function filterByStatus(items: SaleItem[], status: SaleStatus): SaleItem[] {
  if (status === 'all') return items;
  
  return items.filter(item => getSaleStatus(item) === status);
}

/**
 * Filter sale items by date range on the client side
 */
function filterByDateRange(items: SaleItem[], startDate: string, endDate: string): SaleItem[] {
  if (!startDate && !endDate) return items;
  
  const startTimestamp = startDate ? dateStringToTimestamp(startDate) : null;
  const endTimestamp = endDate ? dateStringToTimestamp(endDate) : null;
  
  return items.filter(item => {
    if (startTimestamp && item.endDate < startTimestamp) return false;
    if (endTimestamp && item.startDate > endTimestamp) return false;
    return true;
  });
}

// Query Keys
const QUERY_KEYS = {
  saleItems: (search: string, page: number, pageSize: number, status: SaleStatus, startDate: string, endDate: string) =>
    ['saleItems', search, page, pageSize, status, startDate, endDate] as const,
  saleItem: (saleId: number) => ['saleItem', saleId] as const,
};

// ============================================================================
// SALE ITEM QUERIES
// ============================================================================

/**
 * Fetch paginated sale items with search and filters
 */
export function useGetSaleItemsPage(
  search: string,
  page: number,
  pageSize: number,
  status: SaleStatus,
  startDate: string,
  endDate: string
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ items: SaleItem[]; totalCount: number }>({
    queryKey: QUERY_KEYS.saleItems(search, page, pageSize, status, startDate, endDate),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');

      try {
        // Backend doesn't support status/date filters yet, so we fetch all and filter client-side
        const response: SaleItemArray = await actor.getSaleItemsPage(
          search,
          BigInt(page),
          BigInt(pageSize),
          true // includeInactive = true to get all items
        );

        let items = response.items.map(backendSaleItemToUI);
        
        // Apply client-side filters
        items = filterByStatus(items, status);
        items = filterByDateRange(items, startDate, endDate);

        return {
          items,
          totalCount: items.length,
        };
      } catch (error) {
        reportErrorWithToast(error, 'Error al cargar productos en oferta', {
          operation: 'getSaleItemsPage',
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

// ============================================================================
// SALE ITEM MUTATIONS
// ============================================================================

/**
 * Create new sale item
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

      const startTimestamp = dateStringToTimestamp(startDate);
      const endTimestamp = dateStringToTimestamp(endDate);

      const backendSaleItem = await actor.createSaleItem(
        productBarcode,
        salePrice,
        BigInt(startTimestamp),
        BigInt(endTimestamp)
      );
      return backendSaleItemToUI(backendSaleItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saleItems'] });
      reportSuccessWithToast('Producto en oferta creado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al crear producto en oferta', {
        operation: 'createSaleItem',
      });
    },
  });
}

/**
 * Update existing sale item
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

      const startTimestamp = dateStringToTimestamp(startDate);
      const endTimestamp = dateStringToTimestamp(endDate);

      const backendSaleItem = await actor.updateSaleItem(
        numberToBigInt(saleId),
        salePrice,
        BigInt(startTimestamp),
        BigInt(endTimestamp)
      );
      return backendSaleItemToUI(backendSaleItem);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saleItems'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.saleItem(variables.saleId) });
      reportSuccessWithToast('Producto en oferta actualizado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al actualizar producto en oferta', {
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

      await actor.deleteSaleItem(numberToBigInt(saleId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saleItems'] });
      reportSuccessWithToast('Producto en oferta eliminado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al eliminar producto en oferta', {
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
      queryClient.invalidateQueries({ queryKey: ['saleItems'] });
      reportSuccessWithToast('Estado actualizado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al actualizar estado', {
        operation: 'toggleSaleItemActiveStatus',
      });
    },
  });
}
