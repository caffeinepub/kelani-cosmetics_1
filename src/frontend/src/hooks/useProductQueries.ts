import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';
import type { Product as BackendProduct, PaginatedResponse } from '../backend';
import { numberToBigInt, bigIntToNumber } from '../utils/categoryNumeric';

// UI Product type with number fields for easier manipulation
export interface Product {
  barcode: string;
  name: string;
  categoryId: number;
  description?: string;
  price?: number;
  inStock: boolean;
  isFeatured: boolean;
  photo?: Uint8Array;
  createdDate: number;
  lastUpdatedDate: number;
}

/**
 * Convert backend Product (with bigint fields) to UI Product (with number fields)
 */
function backendProductToUI(backendProduct: BackendProduct): Product {
  return {
    barcode: backendProduct.barcode,
    name: backendProduct.name,
    categoryId: bigIntToNumber(backendProduct.categoryId),
    description: backendProduct.description,
    price: backendProduct.price,
    inStock: backendProduct.inStock,
    isFeatured: backendProduct.isFeatured,
    photo: backendProduct.photo,
    createdDate: bigIntToNumber(backendProduct.createdDate),
    lastUpdatedDate: bigIntToNumber(backendProduct.lastUpdatedDate),
  };
}

// Query Keys
const QUERY_KEYS = {
  products: (search: string, categoryId: number | null, page: number, pageSize: number) =>
    ['products', search, categoryId, page, pageSize] as const,
  product: (barcode: string) => ['product', barcode] as const,
};

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

/**
 * Fetch paginated products with search and filter
 */
export function useGetProductsPage(
  search: string,
  categoryId: number | null,
  page: number,
  pageSize: number
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ items: Product[]; totalCount: number }>({
    queryKey: QUERY_KEYS.products(search, categoryId, page, pageSize),
    queryFn: async ({ signal }) => {
      if (!actor) throw new Error('Actor not available');

      try {
        const response: PaginatedResponse = await actor.getProductsPage(
          search,
          categoryId !== null ? numberToBigInt(categoryId) : null,
          BigInt(page),
          BigInt(pageSize)
        );

        return {
          items: response.items.map(backendProductToUI),
          totalCount: bigIntToNumber(response.totalCount),
        };
      } catch (error) {
        reportErrorWithToast(error, 'Failed to load products', {
          operation: 'getProductsPage',
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

/**
 * Fetch single product by barcode
 */
export function useGetProduct(barcode: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: QUERY_KEYS.product(barcode ?? ''),
    queryFn: async () => {
      if (!actor || !barcode) return null;

      try {
        const result = await actor.getProduct(barcode);
        return backendProductToUI(result);
      } catch (error) {
        reportErrorWithToast(error, 'Failed to load product', {
          operation: 'getProduct',
          additionalInfo: { barcode },
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!barcode,
    retry: 1,
  });
}

// ============================================================================
// PRODUCT MUTATIONS
// ============================================================================

/**
 * Create new product
 */
export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      barcode,
      name,
      categoryId,
      description,
      price,
      inStock,
      isFeatured,
      photo,
    }: {
      barcode: string;
      name: string;
      categoryId: number;
      description?: string;
      price?: number;
      inStock: boolean;
      isFeatured: boolean;
      photo?: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');

      const backendProduct = await actor.createProduct(
        barcode,
        name,
        numberToBigInt(categoryId),
        description ?? null,
        price ?? null,
        inStock,
        isFeatured,
        photo ?? null
      );
      return backendProductToUI(backendProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reportSuccessWithToast('Product created successfully');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Failed to create product', {
        operation: 'createProduct',
      });
    },
  });
}

/**
 * Update existing product
 */
export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      barcode,
      name,
      categoryId,
      description,
      price,
      inStock,
      isFeatured,
      photo,
    }: {
      barcode: string;
      name: string;
      categoryId: number;
      description?: string;
      price?: number;
      inStock: boolean;
      isFeatured: boolean;
      photo?: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');

      const backendProduct = await actor.updateProduct(
        barcode,
        name,
        numberToBigInt(categoryId),
        description ?? null,
        price ?? null,
        inStock,
        isFeatured,
        photo ?? null
      );
      return backendProductToUI(backendProduct);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(variables.barcode) });
      reportSuccessWithToast('Product updated successfully');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Failed to update product', {
        operation: 'updateProduct',
      });
    },
  });
}

/**
 * Delete product
 */
export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ barcode, password }: { barcode: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');

      await actor.deleteProduct(barcode, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reportSuccessWithToast('Product deleted successfully');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Failed to delete product', {
        operation: 'deleteProduct',
      });
    },
  });
}

/**
 * Toggle product in-stock status
 */
export function useToggleProductInStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (barcode: string) => {
      if (!actor) throw new Error('Actor not available');

      const newStatus = await actor.toggleProductInStock(barcode);
      return { barcode, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reportSuccessWithToast('Stock status updated');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Failed to update stock status', {
        operation: 'toggleProductInStock',
      });
    },
  });
}

/**
 * Upload product photo
 */
export function useUploadProductPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ barcode, photo }: { barcode: string; photo: Uint8Array }) => {
      if (!actor) throw new Error('Actor not available');

      const backendProduct = await actor.uploadProductPhoto(barcode, photo);
      return backendProductToUI(backendProduct);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(variables.barcode) });
      reportSuccessWithToast('Photo uploaded successfully');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Failed to upload photo', {
        operation: 'uploadProductPhoto',
      });
    },
  });
}
