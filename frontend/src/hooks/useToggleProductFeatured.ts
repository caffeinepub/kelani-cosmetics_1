import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useActor } from './useActor';
import { reportErrorWithToast } from '../utils/reportErrorWithToast';
import type { UIProduct } from './useProductQueries';

/**
 * Mutation hook for toggling a product's featured status.
 * Fetches the current photo before calling updateProduct to avoid clearing it.
 */
export function useToggleProductFeatured() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [loadingBarcode, setLoadingBarcode] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (product: UIProduct) => {
      if (!actor) throw new Error('Actor not available');

      // Fetch the current photo to preserve it during the update
      let currentPhoto: Uint8Array | null = null;
      try {
        currentPhoto = await actor.getProductPhoto(product.barcode);
      } catch {
        currentPhoto = null;
      }

      return actor.updateProduct(
        product.barcode,
        product.name,
        BigInt(product.categoryId),
        product.description ?? null,
        product.price ?? null,
        product.inStock,
        !product.isFeatured,
        currentPhoto,
        product.store1InStock,
        product.store2InStock
      );
    },
    onMutate: (product: UIProduct) => {
      setLoadingBarcode(product.barcode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      reportErrorWithToast(error, 'Error al cambiar estado destacado');
    },
    onSettled: () => {
      setLoadingBarcode(null);
    },
  });

  return {
    ...mutation,
    loadingBarcode,
    toggleFeatured: (product: UIProduct) => mutation.mutate(product),
  };
}
