import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { useProductModalStore } from '../../../stores/productModalStore';
import { useProductModalNavigation } from '../../../hooks/useProductModalNavigation';
import { formatPriceForDisplay } from '../../../utils/NumericConverter';
import { useProductPhotoBlobUrl } from '../../../hooks/useProductPhotoBlobUrl';
import { DEFAULT_PRODUCT_IMAGE_URL } from '../../../utils/productImage';
import StoreSelector from './StoreSelector';
import ShareProductButton from './ShareProductButton';
import StockStatusIndicators from '../products/StockStatusIndicators';
import type { ProductWithSale, HomepageSearchResult } from '../../../backend';

function isProductWithSale(data: ProductWithSale | HomepageSearchResult): data is ProductWithSale {
  return 'product' in data;
}

export default function ProductDetailsModal() {
  const { isOpen, productData, storeDetails, precomputedBlobUrl } = useProductModalStore();
  const { closeModalViaUI } = useProductModalNavigation();

  // Extract photo data before early return to satisfy React Hooks rules
  let photo: Uint8Array | undefined;
  if (productData) {
    if (isProductWithSale(productData)) {
      photo = productData.product.photo;
    } else {
      photo = productData.photo;
    }
  }

  // Call hook unconditionally at top level
  const generatedBlobUrl = useProductPhotoBlobUrl(photo);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!productData) return null;

  let barcode: string;
  let name: string;
  let price: number | undefined;
  let salePrice: number | undefined;
  let discountPercentage: number | undefined;
  let isOnSale: boolean;
  let isFeatured: boolean;
  let description: string | undefined;
  let store1InStock: boolean;
  let store2InStock: boolean;

  if (isProductWithSale(productData)) {
    const { product } = productData;
    barcode = product.barcode;
    name = product.name;
    price = product.price;
    salePrice = productData.salePrice;
    discountPercentage = productData.discountPercentage;
    isOnSale = productData.isOnSale;
    isFeatured = product.isFeatured;
    description = product.description;
    store1InStock = product.store1InStock;
    store2InStock = product.store2InStock;
  } else {
    barcode = productData.barcode;
    name = productData.name;
    price = productData.price;
    salePrice = productData.salePrice;
    discountPercentage = productData.salePercentage;
    isOnSale = productData.saleIsActive;
    isFeatured = false;
    description = undefined;
    store1InStock = true;
    store2InStock = true;
  }

  // Use precomputed blob URL if available (from search), otherwise use generated blob URL
  const imageUrl = precomputedBlobUrl || generatedBlobUrl || DEFAULT_PRODUCT_IMAGE_URL;

  const displayPrice = isOnSale && salePrice !== undefined ? salePrice : price;

  return (
    <Dialog open={isOpen} onOpenChange={closeModalViaUI}>
      <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
        <DialogClose className="absolute right-4 top-4 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-background/80 backdrop-blur-sm p-1">
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar</span>
        </DialogClose>

        <div className="flex flex-col overflow-y-auto overflow-x-hidden">
          <div className="relative aspect-square overflow-hidden bg-muted shrink-0">
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-contain"
            />

            {isOnSale && discountPercentage !== undefined && (
              <Badge className="absolute left-4 top-4 bg-destructive text-destructive-foreground">
                -{Math.round(discountPercentage)}%
              </Badge>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{name}</h2>
            </div>

            <StockStatusIndicators
              store1InStock={store1InStock}
              store2InStock={store2InStock}
              storeDetails={storeDetails || []}
            />

            {displayPrice !== undefined && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-foreground">
                  {formatPriceForDisplay(displayPrice)}
                </span>
                {isOnSale && price !== undefined && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPriceForDisplay(price)}
                  </span>
                )}
                {isFeatured && (
                  <Badge className="bg-warning text-warning-foreground">
                    ⭐ Destacado
                  </Badge>
                )}
              </div>
            )}

            {!displayPrice && isFeatured && (
              <div>
                <Badge className="bg-warning text-warning-foreground">
                  ⭐ Destacado
                </Badge>
              </div>
            )}

            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}

            <div className="space-y-3 pt-2">
              {storeDetails && storeDetails.length > 0 && (
                <StoreSelector
                  productName={name}
                  barcode={barcode}
                  storeDetails={storeDetails}
                />
              )}

              <ShareProductButton productBarcode={barcode} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
