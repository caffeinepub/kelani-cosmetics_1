import React from 'react';
import type { ProductWithSale, StoreDetails } from '@/backend';
import { formatPriceForDisplay } from '@/utils/NumericConverter';
import StockStatusIndicators from './StockStatusIndicators';
import LazyProductImage from './LazyProductImage';

interface ProductCardProps {
  productWithSale: ProductWithSale;
  storeDetails?: StoreDetails[];
  onOpenModal?: (productWithSale: ProductWithSale) => void;
}

export default function ProductCard({ productWithSale, storeDetails, onOpenModal }: ProductCardProps) {
  const { product, salePrice, discountPercentage, isOnSale } = productWithSale;

  const displayPrice = isOnSale && salePrice != null ? salePrice : product.price;
  const originalPrice = isOnSale && salePrice != null ? product.price : undefined;

  const handleClick = () => {
    if (onOpenModal) {
      onOpenModal(productWithSale);
    }
  };

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Ver detalles de ${product.name}`}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <LazyProductImage
          barcode={product.barcode}
          className="absolute inset-0 w-full h-full"
          alt={product.name}
        />
        {isOnSale && discountPercentage != null && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full z-10">
            -{Math.round(discountPercentage)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          {displayPrice != null ? (
            <>
              <span className={`text-sm font-bold ${isOnSale ? 'text-destructive' : 'text-foreground'}`}>
                {formatPriceForDisplay(displayPrice)}€
              </span>
              {originalPrice != null && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPriceForDisplay(originalPrice)}€
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Sin precio</span>
          )}
        </div>

        {/* Stock */}
        <StockStatusIndicators
          store1InStock={product.store1InStock}
          store2InStock={product.store2InStock}
          storeDetails={storeDetails ?? []}
          variant="compact"
        />
      </div>
    </div>
  );
}
