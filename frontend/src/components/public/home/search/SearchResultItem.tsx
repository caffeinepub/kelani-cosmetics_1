import { formatPriceForDisplay } from '@/utils/NumericConverter';
import type { HomepageSearchResult } from '@/backend';

interface SearchResultItemProps {
  result: HomepageSearchResult;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  id: string;
}

export default function SearchResultItem({ result, isActive, onClick, onMouseEnter, id }: SearchResultItemProps) {
  const displayPrice = result.saleIsActive && result.salePrice !== undefined
    ? result.salePrice
    : result.price;

  return (
    <button
      id={id}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive ? 'bg-muted' : 'hover:bg-muted'
      }`}
      role="option"
      aria-selected={isActive}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">{result.name}</div>
        <div className="text-sm text-muted-foreground truncate">{result.categoryName}</div>
      </div>
      {displayPrice !== undefined && (
        <div className="text-sm font-semibold text-foreground whitespace-nowrap">
          {formatPriceForDisplay(displayPrice)}
        </div>
      )}
    </button>
  );
}
