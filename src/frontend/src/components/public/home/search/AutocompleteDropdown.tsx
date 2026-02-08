import { Loader2 } from 'lucide-react';
import SearchResultItem from './SearchResultItem';
import type { HomepageSearchResult } from '../../../../backend';

interface AutocompleteDropdownProps {
  results: HomepageSearchResult[];
  isLoading: boolean;
  error: Error | null;
  activeIndex: number;
  onSelect: (result: HomepageSearchResult) => void;
  onMouseEnter: (index: number) => void;
}

export default function AutocompleteDropdown({
  results,
  isLoading,
  error,
  activeIndex,
  onSelect,
  onMouseEnter,
}: AutocompleteDropdownProps) {
  return (
    <div
      id="search-results"
      role="listbox"
      className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !isLoading && (
        <div className="px-4 py-3 text-sm text-destructive">
          Error al buscar productos. Por favor, intenta de nuevo.
        </div>
      )}

      {!isLoading && !error && results.length === 0 && (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          No se encontraron productos
        </div>
      )}

      {!isLoading && !error && results.length > 0 && (
        <div className="py-1">
          {results.map((result, index) => (
            <SearchResultItem
              key={result.barcode}
              result={result}
              isActive={index === activeIndex}
              onClick={() => onSelect(result)}
              onMouseEnter={() => onMouseEnter(index)}
              id={`search-result-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
