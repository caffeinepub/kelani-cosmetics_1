import { memo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { useProductModalNavigation } from '../../../hooks/useProductModalNavigation';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import ProductCard from '../../public/products/ProductCard';
import type { CategorizedProductWithSale, StoreDetails } from '../../../backend';

interface CategorySectionProps {
  category: CategorizedProductWithSale;
  storeDetails: StoreDetails[];
}

function CategorySection({ category, storeDetails }: CategorySectionProps) {
  const navigate = useNavigate();
  const { openModalWithHistory } = useProductModalNavigation();
  const isMobile = useIsMobile();

  const handleViewAll = () => {
    navigate({ to: '/category/$id', params: { id: category.categoryId.toString() } });
  };

  // On mobile (≤768px), limit to 4 products; on desktop, show all 5
  const displayProducts = isMobile 
    ? category.products.slice(0, 4) 
    : category.products;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{category.categoryName}</h2>
        <button
          onClick={handleViewAll}
          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
          aria-label={`Ver todos los productos de ${category.categoryName}`}
        >
          <span className="hidden sm:inline">Ver todos</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayProducts.map((productWithSale) => (
          <ProductCard
            key={productWithSale.product.barcode}
            product={productWithSale}
            storeDetails={storeDetails}
            onClick={() => openModalWithHistory(productWithSale, storeDetails, 'homepage-category')}
          />
        ))}
      </div>
    </section>
  );
}

export default memo(CategorySection);
