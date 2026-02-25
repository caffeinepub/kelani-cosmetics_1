import React from 'react';
import type { HomepageSearchResult } from '@/backend';
import { formatPriceForDisplay } from '@/utils/NumericConverter';

interface SearchResultItemProps {
  result: HomepageSearchResult;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

export default function SearchResultItem({ result, isActive, onClick, onMouseEnter }: SearchResultItemProps) {
  const displayPrice = result.saleIsActive && result.salePrice != null
    ? result.salePrice
    : result.price;

  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      className={`w-full text-left px-4 py-3 transition-colors flex flex-col gap-0.5 ${
        isActive ? 'bg-accent' : 'hover:bg-accent'
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className="text-sm font-medium text-foreground line-clamp-1">{result.name}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{result.categoryName}</span>
        {displayPrice != null && (
          <>
            <span className="text-xs text-muted-foreground">·</span>
            <span className={`text-xs font-medium ${result.saleIsActive ? 'text-destructive' : 'text-foreground'}`}>
              {formatPriceForDisplay(displayPrice)}€
            </span>
          </>
        )}
      </div>
    </button>
  );
}
