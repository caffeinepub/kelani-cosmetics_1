import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useStableActorQuery } from './useStableActorQuery';
import type { ProductV2Light, ProductWithSale, PaginatedResponse } from '../backend';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';

// UI-facing product type for list views (no photo field — fetched lazily)
export interface UIProduct {
  barcode: string;
  name: string;
  categoryId: number;
  categoryName: string;
  description?: string;
  price?: number;
  inStock: boolean;
  isFeatured: boolean;
  createdDate: bigint;
  lastUpdatedDate: bigint;
  store1InStock: boolean;
  store2InStock: boolean;
}

// Flattened product type for product detail page (includes sale info)
export interface FlatProduct {
  barcode: string;
  name: string;
  categoryId: number;
  description?: string;
  price?: number;
  inStock: boolean;
  isFeatured: boolean;
  createdDate: bigint;
  lastUpdatedDate: bigint;
  store1InStock: boolean;
  store2InStock: boolean;
  // Sale fields
  isOnSale: boolean;
  salePrice?: number;
  discountPercentage?: number;
}

// Keep legacy alias for components that still use Product
export type Product = UIProduct;

function mapProductV2LightToUI(p: ProductV2Light): UIProduct {
  return {
    barcode: p.barcode,
    name: p.name,
    categoryId: Number(p.categoryId),
    categoryName: p.categoryName,
    description: p.description,
    price: p.price,
    inStock: p.inStock,
    isFeatured: p.isFeatured,
    createdDate: p.createdDate,
    lastUpdatedDate: p.lastUpdatedDate,
    store1InStock: p.store1InStock,
    store2InStock: p.store2InStock,
  };
}

function mapProductWithSaleToFlat(pws: ProductWithSale): FlatProduct {
  return {
    barcode: pws.product.barcode,
    name: pws.product.name,
    categoryId: Number(pws.product.categoryId),
    description: pws.product.description,
    price: pws.product.price,
    inStock: pws.product.inStock,
    isFeatured: pws.product.isFeatured,
    createdDate: pws.product.createdDate,
    lastUpdatedDate: pws.product.lastUpdatedDate,
    store1InStock: pws.product.store1InStock,
    store2InStock: pws.product.store2InStock,
    isOnSale: pws.isOnSale,
    salePrice: pws.salePrice,
    discountPercentage: pws.discountPercentage,
  };
}

export function useGetProductsPage(
  search: string,
  categoryId: number | null,
  page: number,
  pageSize: number
) {
  return useStableActorQuery<{ items: UIProduct[]; totalCount: number }>(
    async (actor) => {
      const response: PaginatedResponse = await actor.getProductsPage(
        search,
        categoryId !== null ? BigInt(categoryId) : null,
        BigInt(page),
        BigInt(pageSize)
      );
      return {
        items: response.items.map(mapProductV2LightToUI),
        totalCount: Number(response.totalCount),
      };
    },
    ['products', 'page', search, categoryId, page, pageSize] as const,
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );
}

export function useGetProduct(barcode: string) {
  const query = useStableActorQuery<FlatProduct>(
    async (actor) => {
      const pws = await actor.getProduct(barcode);
      return mapProductWithSaleToFlat(pws);
    },
    ['product', barcode] as const,
    {
      enabled: !!barcode,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  return {
    ...query,
    isInitialLoading: query.isLoading,
  };
}

export function useGetProductPhoto(barcode: string) {
  return useStableActorQuery<Uint8Array>(
    async (actor) => {
      return actor.getProductPhoto(barcode);
    },
    ['product-photo', barcode] as const,
    {
      enabled: !!barcode,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      barcode: string;
      name: string;
      categoryId: number;
      description: string | null;
      price: number | null;
      inStock: boolean;
      isFeatured: boolean;
      photo: Uint8Array | null;
      store1InStock: boolean;
      store2InStock: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(
        params.barcode,
        params.name,
        BigInt(params.categoryId),
        params.description,
        params.price,
        params.inStock,
        params.isFeatured,
        params.photo,
        params.store1InStock,
        params.store2InStock
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reportSuccessWithToast('Producto creado correctamente');
    },
    onError: (error: unknown) => {
      reportErrorWithToast(error, 'Error al crear producto');
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      barcode: string;
      name: string;
      categoryId: number;
      description: string | null;
      price: number | null;
      inStock: boolean;
      isFeatured: boolean;
      photo: Uint8Array | null;
      store1InStock: boolean;
      store2InStock: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(
        params.barcode,
        params.name,
        BigInt(params.categoryId),
        params.description,
        params.price,
        params.inStock,
        params.isFeatured,
        params.photo,
        params.store1InStock,
        params.store2InStock
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reportSuccessWithToast('Producto actualizado correctamente');
    },
    onError: (error: unknown) => {
      reportErrorWithToast(error, 'Error al actualizar producto');
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { barcode: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(params.barcode, params.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reportSuccessWithToast('Producto eliminado correctamente');
    },
    onError: (error: unknown) => {
      reportErrorWithToast(error, 'Error al eliminar producto');
    },
  });
}

// Toggle store-specific stock without touching the photo
export function useToggleStoreStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      product: UIProduct;
      store: 1 | 2;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const { product, store } = params;

      // Fetch the current photo to preserve it during the update
      let currentPhoto: Uint8Array | null = null;
      try {
        currentPhoto = await actor.getProductPhoto(product.barcode);
      } catch {
        currentPhoto = null;
      }

      const newStore1InStock = store === 1 ? !product.store1InStock : product.store1InStock;
      const newStore2InStock = store === 2 ? !product.store2InStock : product.store2InStock;
      const newInStock = newStore1InStock || newStore2InStock;

      return actor.updateProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        newInStock,
        product.isFeatured,
        currentPhoto,
        newStore1InStock,
        newStore2InStock
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reportSuccessWithToast('Stock actualizado correctamente');
    },
    onError: (error: unknown) => {
      reportErrorWithToast(error, 'Error al actualizar el stock');
    },
  });
}

export function useUploadProductPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { barcode: string; photo: Uint8Array }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadProductPhoto(params.barcode, params.photo);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-photo', variables.barcode] });
      reportSuccessWithToast('Foto subida correctamente');
    },
    onError: (error: unknown) => {
      reportErrorWithToast(error, 'Error al subir la foto');
    },
  });
}
