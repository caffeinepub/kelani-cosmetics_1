import type { HomepageSearchResult } from '../../../../backend';

interface SearchResultItemProps {
  result: HomepageSearchResult;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  id: string;
}

export default function SearchResultItem({
  result,
  isActive,
  onClick,
  onMouseEnter,
  id,
}: SearchResultItemProps) {
  // Determine which price to display
  const displayPrice = result.saleIsActive && result.salePrice !== undefined && result.salePrice !== null
    ? result.salePrice
    : result.price;

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null) return 'Precio no disponible';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div
      id={id}
      role="option"
      aria-selected={isActive}
      className={`px-4 py-3 cursor-pointer transition-colors ${
        isActive ? 'bg-accent' : 'hover:bg-accent/50'
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate">
            {result.name}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {result.categoryName}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          {result.saleIsActive && result.salePrice !== undefined && result.salePrice !== null ? (
            <div>
              <div className="font-semibold text-primary">
                {formatPrice(result.salePrice)}
              </div>
              {result.price !== undefined && result.price !== null && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatPrice(result.price)}
                </div>
              )}
            </div>
          ) : (
            <div className="font-medium text-foreground">
              {formatPrice(displayPrice)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
