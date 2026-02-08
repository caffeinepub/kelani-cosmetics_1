import { useEffect, useRef } from 'react';
import { X, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useProductModalStore } from '../../../stores/productModalStore';
import type { ProductWithSale, HomepageSearchResult } from '../../../backend';

const DEFAULT_IMAGE_URL = 'https://i.imgur.com/pNccXMT.png';

function isProductWithSale(data: ProductWithSale | HomepageSearchResult): data is ProductWithSale {
  return 'product' in data;
}

export default function ProductDetailsModal() {
  const { isOpen, productData, closeModal } = useProductModalStore();
  const isClosingRef = useRef(false);
  const hasHistoryStateRef = useRef(false);

  // Push history state when modal opens
  useEffect(() => {
    if (isOpen && !hasHistoryStateRef.current) {
      window.history.pushState({ modal: 'product-details' }, '');
      hasHistoryStateRef.current = true;
    }
  }, [isOpen]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isOpen && !isClosingRef.current) {
        isClosingRef.current = true;
        closeModal();
        hasHistoryStateRef.current = false;
        isClosingRef.current = false;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, closeModal]);

  // Unified close handler
  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    // Remove history state if it exists
    if (hasHistoryStateRef.current) {
      window.history.back();
      hasHistoryStateRef.current = false;
    } else {
      closeModal();
    }

    isClosingRef.current = false;
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!productData) return null;

  // Extract data based on type
  let name: string;
  let barcode: string;
  let description: string | undefined;
  let price: number | undefined | null;
  let salePrice: number | undefined | null;
  let inStock: boolean;
  let isFeatured: boolean;
  let photo: Uint8Array | undefined;
  let isOnSale: boolean;

  if (isProductWithSale(productData)) {
    name = productData.product.name;
    barcode = productData.product.barcode;
    description = productData.product.description ?? undefined;
    price = productData.product.price;
    salePrice = productData.salePrice;
    inStock = productData.product.inStock;
    isFeatured = productData.product.isFeatured;
    photo = productData.product.photo;
    isOnSale = productData.isOnSale;
  } else {
    name = productData.name;
    barcode = productData.barcode;
    description = undefined;
    price = productData.price;
    salePrice = productData.salePrice;
    inStock = true; // Search results don't have stock info
    isFeatured = false;
    photo = undefined;
    isOnSale = productData.saleIsActive;
  }

  // Determine image source
  let imageSrc = DEFAULT_IMAGE_URL;
  if (photo && photo.length > 0) {
    const blob = new Blob([new Uint8Array(photo)], { type: 'image/jpeg' });
    imageSrc = URL.createObjectURL(blob);
  }

  const formatPrice = (priceValue: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(priceValue);
  };

  const displayPrice = isOnSale && salePrice !== undefined && salePrice !== null
    ? salePrice
    : price;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">{name}</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={imageSrc}
              alt={name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_IMAGE_URL;
              }}
            />

            {/* Featured Badge */}
            {isFeatured && (
              <div className="absolute top-4 right-4">
                <div className="bg-yellow-400 text-yellow-900 rounded-full p-2">
                  <Star className="h-5 w-5 fill-current" />
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {/* Price */}
            <div>
              {isOnSale && salePrice !== undefined && salePrice !== null ? (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(salePrice)}
                  </div>
                  {price !== undefined && price !== null && (
                    <div className="text-lg text-muted-foreground line-through">
                      {formatPrice(price)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-3xl font-bold text-foreground">
                  {displayPrice !== undefined && displayPrice !== null
                    ? formatPrice(displayPrice)
                    : 'Precio no disponible'}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {inStock ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  En Stock
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                  Sin Stock
                </span>
              )}
            </div>

            {/* Barcode */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Código:</span> {barcode}
            </div>

            {/* Description */}
            {description && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
