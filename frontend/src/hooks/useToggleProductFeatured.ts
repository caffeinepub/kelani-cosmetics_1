import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product } from './useProductQueries';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';

export function useToggleProductFeatured() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error('Actor not available');

      // Toggle the featured status
      const newFeaturedStatus = !product.isFeatured;

      // Derive legacy inStock from store flags
      const inStock = product.store1InStock || product.store2InStock;

      // Call updateProduct with all existing fields, only changing isFeatured
      const updatedProduct = await actor.updateProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        inStock,
        newFeaturedStatus,
        product.photo ?? null,
        product.store1InStock,
        product.store2InStock
      );

      return updatedProduct;
    },
    onMutate: async (product) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['products']);

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ['products'] }, (old: any) => {
        if (!old) return old;
        
        // Handle paginated response structure
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((p: Product) =>
                p.barcode === product.barcode
                  ? { ...p, isFeatured: !p.isFeatured }
                  : p
              ),
            })),
          };
        }

        // Handle direct array or object with items
        if (Array.isArray(old)) {
          return old.map((p: Product) =>
            p.barcode === product.barcode
              ? { ...p, isFeatured: !p.isFeatured }
              : p
          );
        }

        if (old.items) {
          return {
            ...old,
            items: old.items.map((p: Product) =>
              p.barcode === product.barcode
                ? { ...p, isFeatured: !p.isFeatured }
                : p
            ),
          };
        }

        return old;
      });

      return { previousData };
    },
    onError: (error, product, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['products'], context.previousData);
      }
      reportErrorWithToast(error, 'Error al actualizar el estado destacado');
    },
    onSuccess: (data) => {
      reportSuccessWithToast(
        data.isFeatured
          ? 'Producto marcado como destacado'
          : 'Producto desmarcado como destacado'
      );
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
