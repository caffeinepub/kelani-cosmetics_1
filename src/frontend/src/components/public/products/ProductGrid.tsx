import React from 'react';
import ProductCard from './ProductCard';
import { useProductModalStore } from '../../../stores/productModalStore';
import type { ProductWithSale, StoreDetails } from '../../../backend';

interface ProductGridProps {
  products: ProductWithSale[];
  storeDetails?: StoreDetails | null;
}

/**
 * Responsive product grid component
 * 2 columns on mobile, 5 columns on desktop
 */
const ProductGrid = React.memo(function ProductGrid({ products, storeDetails = null }: ProductGridProps) {
  const openModal = useProductModalStore((state) => state.openModal);

  const handleProductClick = (productWithSale: ProductWithSale) => {
    openModal(productWithSale, storeDetails);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((productWithSale) => (
        <ProductCard
          key={productWithSale.product.barcode}
          productWithSale={productWithSale}
          onClick={() => handleProductClick(productWithSale)}
        />
      ))}
    </div>
  );
});

export default ProductGrid;
