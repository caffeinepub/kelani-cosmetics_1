import React from 'react';
import { useProductModalStore } from '../../../stores/productModalStore';
import ProductCard from './ProductCard';
import type { ProductWithSale, StoreDetails } from '../../../backend';

interface ProductGridProps {
  products: ProductWithSale[];
  storeDetails: StoreDetails[];
}

const ProductGrid = React.memo(({ products, storeDetails }: ProductGridProps) => {
  const openModal = useProductModalStore((state) => state.openModal);

  const handleProductClick = (product: ProductWithSale) => {
    openModal(product, storeDetails);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
