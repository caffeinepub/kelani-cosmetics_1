import { memo } from 'react';
import { useProductModalNavigation } from '../../../hooks/useProductModalNavigation';
import ProductCard from './ProductCard';
import type { ProductWithSale, StoreDetails } from '../../../backend';

interface ProductGridProps {
  products: ProductWithSale[];
  storeDetails: StoreDetails[];
}

function ProductGrid({ products, storeDetails }: ProductGridProps) {
  const { openModalWithHistory } = useProductModalNavigation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.product.barcode}
          product={product}
          storeDetails={storeDetails}
          onClick={() => openModalWithHistory(product, storeDetails, 'category-page')}
        />
      ))}
    </div>
  );
}

export default memo(ProductGrid);
