import { useState, useEffect } from 'react';
import { useStableActorQuery } from './useStableActorQuery';
import { reportErrorWithToast } from '../utils/reportErrorWithToast';
import type { Product as BackendProduct } from '../backend';
import { bigIntToNumber } from '../utils/categoryNumeric';

// UI Product type for search results
export interface ProductSearchResult {
  barcode: string;
  name: string;
  categoryId: number;
  price: number;
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
    categoryId: bigIntToNumber(backendProduct.categoryId),
    price: backendProduct.price,
  };
}

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_MS = 300;

// Query Keys
const QUERY_KEYS = {
  productSearch: (search: string) => ['products', 'search', search] as const,
};

/**
 * Search products for sale item creation/editing
 */
export function useProductSearchForSales(searchQuery: string) {
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const shouldSearch = debouncedSearch.length >= MIN_SEARCH_LENGTH;

  return useStableActorQuery<ProductSearchResult[]>(
    async (actor) => {
      try {
        const results = await actor.filterProductsForSales(debouncedSearch);
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
    QUERY_KEYS.productSearch(debouncedSearch),
    {
      enabled: shouldSearch,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );
}
