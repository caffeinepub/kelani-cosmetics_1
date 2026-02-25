import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useProductModalStore } from '@/stores/productModalStore';
import { formatPriceForDisplay } from '@/utils/NumericConverter';
import StockStatusIndicators from '@/components/public/products/StockStatusIndicators';
import { useBothStoreDetails } from '@/hooks/useBothStoreDetails';
import StoreSelector from './StoreSelector';
import ShareProductButton from './ShareProductButton';
import { DEFAULT_PRODUCT_IMAGE_URL } from '@/utils/productImage';
import { useActor } from '@/hooks/useActor';

const DEFAULT_IMAGE = DEFAULT_PRODUCT_IMAGE_URL;

// Module-level in-memory cache for lazily-fetched photos (barcode → blob URL)
const lazyPhotoCache = new Map<string, string>();

export default function ProductDetailsModal() {
  const { isOpen, product: productWithSale, photoBlobUrl, closeModal } = useProductModalStore();
  const { data: storeDetailsData } = useBothStoreDetails();
  const { actor } = useActor();

  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  // Track the barcode for which we last started a fetch to avoid duplicate fetches
  const fetchingBarcodeRef = useRef<string | null>(null);

  // storeDetailsData is StoreDetails[] (mapped from tuples in useBothStoreDetails)
  const storeDetails = storeDetailsData ?? [];

  useEffect(() => {
    if (!isOpen || !productWithSale) {
      setImageUrl(DEFAULT_IMAGE);
      setIsLoadingPhoto(false);
      fetchingBarcodeRef.current = null;
      return;
    }

    const barcode = productWithSale.product.barcode;

    // Card-click flow: pre-loaded photo URL is available — use it immediately
    if (photoBlobUrl) {
      setImageUrl(photoBlobUrl);
      setIsLoadingPhoto(false);
      return;
    }

    // Search-result flow: no pre-loaded photo — check cache first
    const cached = lazyPhotoCache.get(barcode);
    if (cached) {
      setImageUrl(cached);
      setIsLoadingPhoto(false);
      return;
    }

    // Not cached — fetch lazily
    if (!actor) {
      // Actor not ready yet; show default image without spinner until actor is available
      setImageUrl(DEFAULT_IMAGE);
      setIsLoadingPhoto(false);
      return;
    }

    // Prevent duplicate fetches for the same barcode
    if (fetchingBarcodeRef.current === barcode) {
      return;
    }

    fetchingBarcodeRef.current = barcode;
    setImageUrl(DEFAULT_IMAGE);
    setIsLoadingPhoto(true);

    actor
      .getProductPhoto(barcode)
      .then((photoBytes) => {
        if (photoBytes && photoBytes.length > 0) {
          const blob = new Blob([new Uint8Array(photoBytes)], { type: 'image/webp' });
          const url = URL.createObjectURL(blob);
          lazyPhotoCache.set(barcode, url);
          // Only update if the modal is still showing the same product
          setImageUrl(url);
        }
      })
      .catch(() => {
        // No photo or fetch failed — keep default image
      })
      .finally(() => {
        setIsLoadingPhoto(false);
        if (fetchingBarcodeRef.current === barcode) {
          fetchingBarcodeRef.current = null;
        }
      });
  }, [isOpen, productWithSale, photoBlobUrl, actor]);

  // Handle back button closing the modal
  useEffect(() => {
    const handlePopstate = () => {
      if (isOpen) {
        closeModal();
      }
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [isOpen, closeModal]);

  if (!productWithSale) return null;

  const { product, salePrice, discountPercentage, isOnSale } = productWithSale;
  const displayPrice = isOnSale && salePrice != null ? salePrice : product.price;
  const originalPrice = isOnSale && salePrice != null ? product.price : undefined;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
      // Go back in history if we pushed a state
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        {/* Image */}
        <div className="relative aspect-square bg-muted w-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
            }}
          />
          {/* Loading spinner overlay — only shown during lazy fetch */}
          {isLoadingPhoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 pointer-events-none">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}
          {isOnSale && discountPercentage != null && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-full z-10">
              -{Math.round(discountPercentage)}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground leading-tight">{product.name}</h2>
            {product.description && (
              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            {displayPrice != null ? (
              <>
                <span className={`text-2xl font-bold ${isOnSale ? 'text-destructive' : 'text-foreground'}`}>
                  {formatPriceForDisplay(displayPrice)}€
                </span>
                {originalPrice != null && (
                  <span className="text-base text-muted-foreground line-through">
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
            store1InStock={product.store1InStock}
            store2InStock={product.store2InStock}
            storeDetails={storeDetails}
          />

          {/* WhatsApp */}
          <StoreSelector
            productName={product.name}
            barcode={product.barcode}
            storeDetails={storeDetails.length > 0 ? storeDetails : null}
          />

          {/* Share */}
          <ShareProductButton productBarcode={product.barcode} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
