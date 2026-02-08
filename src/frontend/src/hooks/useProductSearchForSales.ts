import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { reportErrorWithToast } from '../utils/reportErrorWithToast';
import type { Product as BackendProduct } from '../backend';
import { bigIntToNumber } from '../utils/categoryNumeric';

export interface ProductSearchResult {
  barcode: string;
  name: string;
  price: number;
  categoryId: number;
  description?: string;
}

/**
 * Convert backend Product to search result
 */
function backendProductToSearchResult(backendProduct: BackendProduct): ProductSearchResult | null {
  // Only include products with prices
  if (!backendProduct.price) return null;
  
  return {
    barcode: backendProduct.barcode,
    name: backendProduct.name,
    price: backendProduct.price,
    categoryId: bigIntToNumber(backendProduct.categoryId),
    description: backendProduct.description,
  };
}

/**
 * Search products for sale item creation (debounced, minimum 2 characters)
 */
export function useProductSearchForSales(searchQuery: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const enabled = searchQuery.length >= 2;

  return useQuery<ProductSearchResult[]>({
    queryKey: ['productSearchForSales', searchQuery],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');

      try {
        const results: BackendProduct[] = await actor.filterProductsForSales(searchQuery);
        return results
          .map(backendProductToSearchResult)
          .filter((item): item is ProductSearchResult => item !== null);
      } catch (error) {
        reportErrorWithToast(error, 'Error al buscar productos', {
          operation: 'filterProductsForSales',
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && enabled,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
}
