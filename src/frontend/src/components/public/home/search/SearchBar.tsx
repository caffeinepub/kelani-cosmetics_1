import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useHomepageAutocomplete } from '../../../../hooks/useHomepageAutocomplete';
import { useBothStoreDetails } from '../../../../hooks/useBothStoreDetails';
import { useProductModalStore } from '../../../../stores/productModalStore';
import AutocompleteDropdown from './AutocompleteDropdown';
import type { HomepageSearchResult } from '../../../../backend';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, error } = useHomepageAutocomplete(query);
  const { data: storeDetailsArray } = useBothStoreDetails();
  const openModal = useProductModalStore((state) => state.openModal);

  const showDropdown = isFocused && query.length >= 2;

  const handleSelect = (result: HomepageSearchResult) => {
    setQuery('');
    setIsFocused(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    openModal(result, storeDetailsArray || []);
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
          className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
          activeIndex={activeIndex}
          onSelect={handleSelect}
          onMouseEnter={handleMouseEnter}
        />
      )}
    </div>
  );
}
