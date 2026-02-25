import React, { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetProduct } from '@/hooks/useProductQueries';
import { formatPriceForDisplay } from '@/utils/NumericConverter';
import StockStatusIndicators from '@/components/public/products/StockStatusIndicators';
import { useBothStoreDetails } from '@/hooks/useBothStoreDetails';
import StoreSelector from '@/components/public/product/StoreSelector';
import ShareProductButton from '@/components/public/product/ShareProductButton';
import { useActor } from '@/hooks/useActor';
import { getCachedPhotoUrl, setCachedPhotoUrl } from '@/components/public/products/LazyProductImage';
import { DEFAULT_PRODUCT_IMAGE_URL } from '@/utils/productImage';
import { Loader2 } from 'lucide-react';

const DEFAULT_IMAGE = DEFAULT_PRODUCT_IMAGE_URL;

export default function ProductPage() {
  const { barcode } = useParams({ from: '/public/product/$barcode' });
  const { data: flatProduct, isInitialLoading, isFetched, error } = useGetProduct(barcode);
  const { data: storeDetailsData } = useBothStoreDetails();
  const { actor } = useActor();

  // storeDetailsData is StoreDetails[] (mapped from tuples in useBothStoreDetails)
  const storeDetails = storeDetailsData ?? [];

  const [photoUrl, setPhotoUrl] = useState<string>(() => getCachedPhotoUrl(barcode) ?? DEFAULT_IMAGE);
  const [photoLoading, setPhotoLoading] = useState<boolean>(() => !getCachedPhotoUrl(barcode));

  useEffect(() => {
    if (!actor || !barcode) return;

    // Check cache first
    const cached = getCachedPhotoUrl(barcode);
    if (cached) {
      setPhotoUrl(cached);
      setPhotoLoading(false);
      return;
    }

    let cancelled = false;
    setPhotoLoading(true);

    actor.getProductPhoto(barcode)
      .then((photoBytes) => {
        if (cancelled) return;
        if (photoBytes && photoBytes.length > 0) {
          const blob = new Blob([new Uint8Array(photoBytes)], { type: 'image/webp' });
          const url = URL.createObjectURL(blob);
          setCachedPhotoUrl(barcode, url);
          setPhotoUrl(url);
        }
      })
      .catch(() => {
        // Silently fall back to default image
      })
      .finally(() => {
        if (!cancelled) setPhotoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actor, barcode]);

  if (isInitialLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando producto...</span>
      </div>
    );
  }

  if (error || !flatProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Producto no encontrado.</p>
      </div>
    );
  }

  // flatProduct is a FlatProduct with all fields at the top level
  const isOnSale = flatProduct.isOnSale;
  const salePrice = flatProduct.salePrice;
  const discountPercentage = flatProduct.discountPercentage;

  const displayPrice = isOnSale && salePrice != null ? salePrice : flatProduct.price;
  const originalPrice = isOnSale && salePrice != null ? flatProduct.price : undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
          <img
            src={photoUrl}
            alt={flatProduct.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
            }}
          />
          {photoLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-70" />
            </div>
          )}
          {isOnSale && discountPercentage != null && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-full z-10">
              -{Math.round(discountPercentage)}%
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Código: {flatProduct.barcode}
            </p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">{flatProduct.name}</h1>
            {flatProduct.description && (
              <p className="text-muted-foreground mt-2">{flatProduct.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            {displayPrice != null ? (
              <>
                <span className={`text-3xl font-bold ${isOnSale ? 'text-destructive' : 'text-foreground'}`}>
                  {formatPriceForDisplay(displayPrice)}€
                </span>
                {originalPrice != null && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPriceForDisplay(originalPrice)}€
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Precio no disponible</span>
            )}
          </div>

          {/* Stock */}
          <StockStatusIndicators
            store1InStock={flatProduct.store1InStock}
            store2InStock={flatProduct.store2InStock}
            storeDetails={storeDetails}
          />

          {/* WhatsApp */}
          <StoreSelector
            productName={flatProduct.name}
            barcode={flatProduct.barcode}
            storeDetails={storeDetails.length > 0 ? storeDetails : null}
          />

          {/* Share */}
          <ShareProductButton productBarcode={flatProduct.barcode} />
        </div>
      </div>
    </div>
  );
}
