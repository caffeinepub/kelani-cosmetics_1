import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useHomepageAutocomplete } from '../../../../hooks/useHomepageAutocomplete';
import { useProductModalNavigation } from '../../../../hooks/useProductModalNavigation';
import AutocompleteDropdown from './AutocompleteDropdown';
import type { HomepageSearchResult, StoreDetails, ProductWithSale } from '../../../../backend';

interface SearchBarProps {
  storeDetails: StoreDetails[];
}

/**
 * Convert a HomepageSearchResult into a ProductWithSale shape so it can be
 * passed to openModalWithHistory which now only accepts ProductWithSale.
 */
function toProductWithSale(result: HomepageSearchResult): ProductWithSale {
  return {
    isOnSale: result.saleIsActive,
    salePrice: result.salePrice,
    discountPercentage: result.salePercentage,
    product: {
      barcode: result.barcode,
      name: result.name,
      categoryId: result.categoryId,
      description: undefined,
      price: result.price,
      inStock: true,
      isFeatured: false,
      photo: undefined,
      createdDate: 0n,
      lastUpdatedDate: 0n,
      store1InStock: true,
      store2InStock: true,
    },
  };
}

export default function SearchBar({ storeDetails: _storeDetails }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, error } = useHomepageAutocomplete(query);
  const { openModalWithHistory } = useProductModalNavigation();

  const showDropdown = isFocused && query.length >= 2;

  const handleSelect = (result: HomepageSearchResult) => {
    setQuery('');
    setIsFocused(false);
    setActiveIndex(-1);
    inputRef.current?.blur();

    // Pass product data only — no pre-loaded photo URL.
    // The modal will lazily fetch the photo via getProductPhoto.
    const productWithSale = toProductWithSale(result);
    openModalWithHistory(productWithSale, undefined, 'homepage-search', undefined);
  };

  const handleMouseEnter = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Buscar productos..."
          className="w-full h-14 pl-12 pr-4 text-base rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          aria-label="Buscar productos"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={showDropdown}
        />
      </div>

      {showDropdown && (
        <AutocompleteDropdown
          results={results}
          isLoading={isLoading}
          error={error}
          onSelect={handleSelect}
          activeIndex={activeIndex}
          onMouseEnter={handleMouseEnter}
        />
      )}
    </div>
  );
}
