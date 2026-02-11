import React from 'react';
import { Link } from '@tanstack/react-router';
import { useProductModalStore } from '../../../stores/productModalStore';
import ProductCard from '../products/ProductCard';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import type { CategorizedProductWithSale, StoreDetails } from '../../../backend';

interface CategorySectionProps {
  category: CategorizedProductWithSale;
  storeDetails: StoreDetails[];
}

const CategorySection = React.memo(({ category, storeDetails }: CategorySectionProps) => {
  const openModal = useProductModalStore((state) => state.openModal);
  const isMobile = useIsMobile();

  const handleProductClick = (product: CategorizedProductWithSale['products'][0]) => {
    openModal(product, storeDetails);
  };

  // Limit to 4 products on mobile (≤768px), show all 5 on desktop
  const productsToRender = isMobile 
    ? category.products.slice(0, 4) 
    : category.products;

  return (
    <section className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground truncate">
          {category.categoryName}
        </h2>
        <Link
          to="/category/$id"
          params={{ id: category.categoryId.toString() }}
          className="text-primary hover:underline font-medium whitespace-nowrap text-sm md:text-base"
        >
          Ver todos
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {productsToRender.map((productWithSale) => (
          <ProductCard
            key={productWithSale.product.barcode}
            productWithSale={productWithSale}
            onClick={() => handleProductClick(productWithSale)}
          />
        ))}
      </div>
    </section>
  );
});

CategorySection.displayName = 'CategorySection';

export default CategorySection;
