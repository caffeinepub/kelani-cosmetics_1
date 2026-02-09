import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import type { ProductWithSale } from '../../../backend';

interface ProductCardProps {
  productWithSale: ProductWithSale;
  onClick: () => void;
}

const DEFAULT_IMAGE_URL = 'https://i.imgur.com/pNccXMT.png';
const IMAGE_LOAD_TIMEOUT = 3000; // 3 seconds

const ProductCard = React.memo(function ProductCard({
  productWithSale,
  onClick,
}: ProductCardProps) {
  const { product, salePrice, discountPercentage, isOnSale } = productWithSale;
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE_URL);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    // Reset state when product changes
    setImageLoading(true);
    setImageSrc(DEFAULT_IMAGE_URL);

    // If no photoUrl, use default
    if (!product.photo || product.photo.length === 0) {
      setImageLoading(false);
      return;
    }

    // Convert photo bytes to blob URL
    const blob = new Blob([new Uint8Array(product.photo)], { type: 'image/jpeg' });
    const blobUrl = URL.createObjectURL(blob);

    // Set timeout for image loading
    const timeoutId = setTimeout(() => {
      setImageSrc(DEFAULT_IMAGE_URL);
      setImageLoading(false);
    }, IMAGE_LOAD_TIMEOUT);

    // Try to load the image
    const img = new Image();
    img.onload = () => {
      clearTimeout(timeoutId);
      setImageSrc(blobUrl);
      setImageLoading(false);
    };
    img.onerror = () => {
      clearTimeout(timeoutId);
      setImageSrc(DEFAULT_IMAGE_URL);
      setImageLoading(false);
      URL.revokeObjectURL(blobUrl);
    };
    img.src = blobUrl;

    return () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(blobUrl);
    };
  }, [product.photo]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const displayPrice = isOnSale && salePrice !== undefined && salePrice !== null
    ? salePrice
    : product.price;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-border hover:-translate-y-1"
    >
      {/* Image Area (70% height) */}
      <div className="relative aspect-square bg-muted">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-contain transition-transform duration-200 group-hover:scale-105 ${
            imageLoading ? 'blur-sm' : ''
          }`}
        />

        {/* Stock Badge Overlay */}
        <div className="absolute top-2 left-2">
          {product.inStock ? (
            <span className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded">
              En Stock
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded">
              Sin Stock
            </span>
          )}
        </div>

        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-2 right-2">
            <div className="bg-yellow-400 text-yellow-900 rounded-full p-1.5">
              <Star className="h-4 w-4 fill-current" />
            </div>
          </div>
        )}

        {/* Sale Badge */}
        {isOnSale && discountPercentage !== undefined && discountPercentage !== null && (
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-1 text-xs font-bold bg-primary text-primary-foreground rounded">
              -{Math.round(discountPercentage)}%
            </span>
          </div>
        )}
      </div>

      {/* Content Area (30% height) */}
      <div className="p-3 space-y-2">
        {/* Product Name - truncated to 2 lines */}
        <h3 className="font-bold text-sm leading-tight line-clamp-2 text-foreground min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price Display */}
        <div className="space-y-1">
          {isOnSale && salePrice !== undefined && salePrice !== null ? (
            <>
              <div className="text-lg font-bold text-primary">
                {formatPrice(salePrice)}
              </div>
              {product.price !== undefined && product.price !== null && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </div>
              )}
            </>
          ) : (
            <div className="text-lg font-bold text-foreground">
              {displayPrice !== undefined && displayPrice !== null
                ? formatPrice(displayPrice)
                : 'Precio no disponible'}
            </div>
          )}
        </div>

        {/* Stock Status Text Badge */}
        <div className="text-xs">
          {product.inStock ? (
            <span className="text-green-600 font-medium">Disponible</span>
          ) : (
            <span className="text-red-600 font-medium">Agotado</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
