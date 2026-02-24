import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product as BackendProduct, PaginatedResponse, ProductV2, ProductWithSale } from '../backend';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';

export interface Product {
  barcode: string;
  name: string;
  categoryId: number;
  categoryName?: string;
  description?: string;
  price?: number;
  inStock: boolean;
  isFeatured: boolean;
  photo?: Uint8Array;
  photoUrl?: string;
  createdDate: bigint;
  lastUpdatedDate: bigint;
  store1InStock: boolean;
  store2InStock: boolean;
  // Sale-aware fields
  salePrice?: number;
  discountPercentage?: number;
  isOnSale: boolean;
}

function mapBackendProduct(backendProduct: BackendProduct, categoryName?: string, photoUrl?: string): Product {
  return {
    barcode: backendProduct.barcode,
    name: backendProduct.name,
    categoryId: Number(backendProduct.categoryId),
    categoryName,
    description: backendProduct.description,
    price: backendProduct.price,
    inStock: backendProduct.inStock,
    isFeatured: backendProduct.isFeatured,
    photo: backendProduct.photo,
    photoUrl,
    createdDate: backendProduct.createdDate,
    lastUpdatedDate: backendProduct.lastUpdatedDate,
    store1InStock: backendProduct.store1InStock,
    store2InStock: backendProduct.store2InStock,
    // Default sale fields - backend doesn't provide these for single product
    salePrice: undefined,
    discountPercentage: undefined,
    isOnSale: false,
  };
}

function mapProductWithSaleToProduct(productWithSale: ProductWithSale): Product {
  return {
    barcode: productWithSale.product.barcode,
    name: productWithSale.product.name,
    categoryId: Number(productWithSale.product.categoryId),
    categoryName: undefined,
    description: productWithSale.product.description,
    price: productWithSale.product.price,
    inStock: productWithSale.product.inStock,
    isFeatured: productWithSale.product.isFeatured,
    photo: productWithSale.product.photo,
    photoUrl: undefined,
    createdDate: productWithSale.product.createdDate,
    lastUpdatedDate: productWithSale.product.lastUpdatedDate,
    store1InStock: productWithSale.product.store1InStock,
    store2InStock: productWithSale.product.store2InStock,
    // Map sale fields from backend
    salePrice: productWithSale.salePrice,
    discountPercentage: productWithSale.discountPercentage,
    isOnSale: productWithSale.isOnSale,
  };
}

function mapProductV2ToProduct(productV2: ProductV2): Product {
  return {
    barcode: productV2.barcode,
    name: productV2.name,
    categoryId: Number(productV2.categoryId),
    categoryName: productV2.categoryName,
    description: productV2.description,
    price: productV2.price,
    inStock: productV2.inStock,
    isFeatured: productV2.isFeatured,
    photo: productV2.photo,
    photoUrl: undefined,
    createdDate: productV2.createdDate,
    lastUpdatedDate: productV2.lastUpdatedDate,
    store1InStock: productV2.store1InStock,
    store2InStock: productV2.store2InStock,
    // Default sale fields
    salePrice: undefined,
    discountPercentage: undefined,
    isOnSale: false,
  };
}

export function useGetProductsPage(
  search: string,
  categoryId: number | null,
  page: number,
  pageSize: number
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ items: Product[]; totalCount: number }>({
    queryKey: ['products', 'page', search, categoryId, page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');

      const response: PaginatedResponse = await actor.getProductsPage(
        search,
        categoryId !== null ? BigInt(categoryId) : null,
        BigInt(page),
        BigInt(pageSize)
      );

      return {
        items: response.items.map((item) => mapProductV2ToProduct(item)),
        totalCount: Number(response.totalCount),
      };
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useGetProduct(barcode: string) {
  const { actor: rawActor, isFetching: actorFetching } = useActor();
  const [stableActor, setStableActor] = useState<typeof rawActor>(null);

  // Stabilize actor reference
  useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  const query = useQuery<Product>({
    queryKey: ['product', barcode],
    queryFn: async () => {
      if (!stableActor) throw new Error('Actor not available');
      const productWithSale = await stableActor.getProduct(barcode);
      return mapProductWithSaleToProduct(productWithSale);
    },
    enabled: !!stableActor && !!barcode,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: {
      barcode: string;
      name: string;
      categoryId: number;
      description?: string;
      price?: number;
      store1InStock: boolean;
      store2InStock: boolean;
      isFeatured: boolean;
      photo?: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');

      // Derive legacy inStock from store flags for transition compatibility
      const inStock = product.store1InStock || product.store2InStock;

      const backendProduct = await actor.createProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        inStock,
        product.isFeatured,
        product.photo ?? null,
        product.store1InStock,
        product.store2InStock
      );

      return mapBackendProduct(backendProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reportSuccessWithToast('Producto creado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al crear el producto');
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: {
      barcode: string;
      name: string;
      categoryId: number;
      description?: string;
      price?: number;
      store1InStock: boolean;
      store2InStock: boolean;
      isFeatured: boolean;
      photo?: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');

      // Derive legacy inStock from store flags for transition compatibility
      const inStock = product.store1InStock || product.store2InStock;

      const backendProduct = await actor.updateProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        inStock,
        product.isFeatured,
        product.photo ?? null,
        product.store1InStock,
        product.store2InStock
      );

      return mapBackendProduct(backendProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reportSuccessWithToast('Producto actualizado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al actualizar el producto');
    },
  });
}

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
      reportSuccessWithToast('Producto eliminado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al eliminar el producto');
    },
  });
}

export function useToggleStoreStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      product,
      storeNumber,
    }: {
      product: Product;
      storeNumber: 1 | 2;
    }) => {
      if (!actor) throw new Error('Actor not available');

      // Toggle the specific store's stock
      const newStore1InStock = storeNumber === 1 ? !product.store1InStock : product.store1InStock;
      const newStore2InStock = storeNumber === 2 ? !product.store2InStock : product.store2InStock;

      // Derive legacy inStock from store flags
      const inStock = newStore1InStock || newStore2InStock;

      const backendProduct = await actor.updateProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        inStock,
        product.isFeatured,
        product.photo ?? null,
        newStore1InStock,
        newStore2InStock
      );

      return mapBackendProduct(backendProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al cambiar el estado de stock');
    },
  });
}

export function useToggleProductFeatured() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');

      // Derive legacy inStock from store flags
      const inStock = product.store1InStock || product.store2InStock;
      
      // Toggle the featured status by updating the product
      const backendProduct = await actor.updateProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        inStock,
        !product.isFeatured, // Toggle featured status
        product.photo ?? null,
        product.store1InStock,
        product.store2InStock
      );

      return mapBackendProduct(backendProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al cambiar el estado destacado');
    },
  });
}

export function useGetProductPhoto(barcode: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Uint8Array>({
    queryKey: ['product', barcode, 'photo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProductPhoto(barcode);
    },
    enabled: !!actor && !actorFetching && !!barcode,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function useGetFeaturedProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const backendProducts = await actor.getFeaturedProducts();
      return backendProducts.map((item) => mapBackendProduct(item));
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
