import { Loader2 } from 'lucide-react';
import SearchResultItem from './SearchResultItem';
import type { HomepageSearchResult } from '@/backend';

interface AutocompleteDropdownProps {
  results: HomepageSearchResult[];
  isLoading: boolean;
  error: Error | null;
  onSelect: (result: HomepageSearchResult) => void;
  activeIndex: number;
  onMouseEnter: (index: number) => void;
}

export default function AutocompleteDropdown({
  results,
  isLoading,
  error,
  onSelect,
  activeIndex,
  onMouseEnter,
}: AutocompleteDropdownProps) {
  return (
    <div
      id="search-results"
      role="listbox"
      className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 text-sm text-destructive">
          Error al buscar productos
        </div>
      )}

      {!isLoading && !error && results.length === 0 && (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          No se encontraron productos
        </div>
      )}

      {!isLoading && !error && results.length > 0 && (
        <div>
          {results.map((result, index) => (
            <SearchResultItem
              key={result.barcode}
              result={result}
              isActive={index === activeIndex}
              onClick={() => onSelect(result)}
              onMouseEnter={() => onMouseEnter(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
