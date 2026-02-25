import React, { memo } from 'react';
import type { CategorizedProductWithSale, StoreDetails } from '@/backend';
import ProductCard from '@/components/public/products/ProductCard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useProductModalStore } from '@/stores/productModalStore';
import { getCachedPhotoUrl } from '@/components/public/products/LazyProductImage';
import { Link } from '@tanstack/react-router';
import type { ProductWithSale } from '@/backend';

interface CategorySectionProps {
  category: CategorizedProductWithSale;
  storeDetails?: StoreDetails[];
}

const CategorySection = memo(function CategorySection({ category, storeDetails }: CategorySectionProps) {
  const isMobile = useIsMobile();
  const openModal = useProductModalStore((s) => s.openModal);

  const displayProducts = isMobile
    ? category.products.slice(0, 4)
    : category.products.slice(0, 5);

  const handleOpenModal = (productWithSale: ProductWithSale) => {
    const cachedUrl = getCachedPhotoUrl(productWithSale.product.barcode);
    // Push history entry for back-button support
    window.history.pushState({ modalOpen: true, barcode: productWithSale.product.barcode }, '');
    openModal(productWithSale, cachedUrl);
  };

  const categoryId = Number(category.categoryId);
  const totalProducts = Number(category.totalProducts);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">{category.categoryName}</h2>
        {totalProducts > displayProducts.length && (
          <Link
            to="/category/$id"
            params={{ id: String(categoryId) }}
            className="text-sm text-primary hover:underline"
          >
            Ver todos ({totalProducts})
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {displayProducts.map((productWithSale) => (
          <ProductCard
            key={productWithSale.product.barcode}
            productWithSale={productWithSale}
            storeDetails={storeDetails}
            onOpenModal={handleOpenModal}
          />
        ))}
      </div>
    </section>
  );
});

export default CategorySection;
