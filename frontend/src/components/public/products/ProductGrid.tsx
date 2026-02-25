import React from 'react';
import type { ProductWithSale, StoreDetails } from '@/backend';
import ProductCard from './ProductCard';
import { useProductModalStore } from '@/stores/productModalStore';
import { getCachedPhotoUrl } from './LazyProductImage';

interface ProductGridProps {
  products: ProductWithSale[];
  storeDetails?: StoreDetails[];
}

export default function ProductGrid({ products, storeDetails }: ProductGridProps) {
  const openModal = useProductModalStore((s) => s.openModal);

  const handleOpenModal = (productWithSale: ProductWithSale) => {
    const cachedUrl = getCachedPhotoUrl(productWithSale.product.barcode);
    openModal(productWithSale, cachedUrl);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.map((productWithSale) => (
        <ProductCard
          key={productWithSale.product.barcode}
          productWithSale={productWithSale}
          storeDetails={storeDetails}
          onOpenModal={handleOpenModal}
        />
      ))}
    </div>
  );
}
