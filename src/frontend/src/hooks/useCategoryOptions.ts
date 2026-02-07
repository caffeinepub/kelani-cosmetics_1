import { useMemo } from 'react';
import { useGetAllCategories } from './useQueries';

export interface CategoryOption {
  value: string;
  label: string;
}

/**
 * Hook that provides category options for dropdowns
 * Maps backend categories to stable dropdown options with proper error handling
 */
export function useCategoryOptions() {
  const { data: categories = [], isLoading, error } = useGetAllCategories();

  const options = useMemo<CategoryOption[]>(() => {
    return categories.map((cat) => ({
      value: cat.categoryId.toString(),
      label: cat.name,
    }));
  }, [categories]);

  return {
    options,
    isLoading,
    error,
    isEmpty: !isLoading && options.length === 0,
  };
}
