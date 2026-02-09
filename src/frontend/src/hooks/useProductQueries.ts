import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product as BackendProduct, PaginatedResponse, ProductV2 } from '../backend';
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
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', barcode],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const backendProduct = await actor.getProduct(barcode);
      return mapBackendProduct(backendProduct);
    },
    enabled: !!actor && !actorFetching && !!barcode,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
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
      inStock: boolean;
      isFeatured: boolean;
      photo?: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');

      const backendProduct = await actor.createProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        product.inStock,
        product.isFeatured,
        product.photo ?? null
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
      inStock: boolean;
      isFeatured: boolean;
      photo?: Uint8Array;
    }) => {
      if (!actor) throw new Error('Actor not available');

      const backendProduct = await actor.updateProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        product.inStock,
        product.isFeatured,
        product.photo ?? null
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

export function useToggleProductInStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (barcode: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleProductInStock(barcode);
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
      
      // Toggle the featured status by updating the product
      const backendProduct = await actor.updateProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        product.inStock,
        !product.isFeatured, // Toggle featured status
        product.photo ?? null
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
