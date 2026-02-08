import React, { useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { CategorizedProductWithSale } from '../../../backend';
import ProductCard from '../products/ProductCard';
import { useProductModalStore } from '../../../stores/productModalStore';

interface CategorySectionProps {
  category: CategorizedProductWithSale;
  isMobile: boolean;
}

const CategorySection = React.memo(function CategorySection({
  category,
  isMobile,
}: CategorySectionProps) {
  const openModal = useProductModalStore((state) => state.openModal);

  // Limit products on mobile: max 4 products (skip 5th)
  const displayProducts = isMobile
    ? category.products.slice(0, 4)
    : category.products;

  const handleProductClick = useCallback(
    (productWithSale: CategorizedProductWithSale['products'][0]) => {
      openModal(productWithSale);
    },
    [openModal]
  );

  // Truncate category name on mobile (approx 22 characters)
  const truncateName = (name: string) => {
    if (isMobile && name.length > 22) {
      return name.substring(0, 22) + '...';
    }
    return name;
  };

  return (
    <section className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        {/* Mobile: Stack name and count vertically */}
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
          <h2 className="text-2xl font-bold text-foreground">
            {truncateName(category.categoryName)}
          </h2>
          <span className="text-xs md:text-sm text-muted-foreground">
            {Number(category.totalProducts)} productos
          </span>
        </div>
        <Link
          to="/category/$id"
          params={{ id: String(category.categoryId) }}
          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium text-sm md:text-base"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayProducts.map((productWithSale) => (
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

export default CategorySection;
