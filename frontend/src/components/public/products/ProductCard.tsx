import { memo } from 'react';
import { Badge } from '../../ui/badge';
import { formatPriceForDisplay } from '../../../utils/NumericConverter';
import { useProductPhotoBlobUrl } from '../../../hooks/useProductPhotoBlobUrl';
import { DEFAULT_PRODUCT_IMAGE_URL } from '../../../utils/productImage';
import StockStatusIndicators from './StockStatusIndicators';
import type { ProductWithSale, StoreDetails } from '../../../backend';

interface ProductCardProps {
  product: ProductWithSale;
  storeDetails: StoreDetails[];
  onClick: () => void;
}

function ProductCard({ product, storeDetails, onClick }: ProductCardProps) {
  const { product: productData, salePrice, discountPercentage, isOnSale } = product;
  const imageUrl = useProductPhotoBlobUrl(productData.photo);

  const displayPrice = isOnSale && salePrice !== undefined ? salePrice : productData.price;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Ver detalles de ${productData.name}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl || DEFAULT_PRODUCT_IMAGE_URL}
          alt={productData.name}
          className="h-full w-full object-contain transition-transform group-hover:scale-105"
          loading="lazy"
        />

        {isOnSale && discountPercentage !== undefined && (
          <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground text-xs">
            -{Math.round(discountPercentage)}%
          </Badge>
        )}

        {productData.isFeatured && (
          <Badge className="absolute right-2 top-2 bg-warning text-warning-foreground text-xs">
            ⭐
          </Badge>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 text-foreground min-h-[2.5rem]">
          {productData.name}
        </h3>

        <StockStatusIndicators
          store1InStock={productData.store1InStock}
          store2InStock={productData.store2InStock}
          storeDetails={storeDetails}
          variant="compact"
        />

        {displayPrice !== undefined && (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatPriceForDisplay(displayPrice)}
            </span>
            {isOnSale && productData.price !== undefined && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPriceForDisplay(productData.price)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProductCard);
