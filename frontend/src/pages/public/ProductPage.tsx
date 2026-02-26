import { useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetProduct } from '@/hooks/useProductQueries';
import { useBothStoreDetails } from '@/hooks/useBothStoreDetails';
import { formatPriceForDisplay } from '@/utils/NumericConverter';
import { useProductPhotoBlobUrl } from '@/hooks/useProductPhotoBlobUrl';
import { DEFAULT_PRODUCT_IMAGE_URL } from '@/utils/productImage';
import StoreSelector from '@/components/public/product/StoreSelector';
import ShareProductButton from '@/components/public/product/ShareProductButton';
import StockStatusIndicators from '@/components/public/products/StockStatusIndicators';
import SeoHead from '@/components/seo/SeoHead';

export default function ProductPage() {
  const { barcode } = useParams({ from: '/public/product/$barcode' });
  const navigate = useNavigate();
  const { data: product, isInitialLoading, isFetched, error } = useGetProduct(barcode);
  const { data: storeDetailsArray } = useBothStoreDetails();

  const imageUrl = useProductPhotoBlobUrl(product?.photo);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [barcode]);

  // Show loading spinner during initial actor initialization and first fetch
  if (isInitialLoading || !isFetched) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // Only show error/not-found after initial loading completes
  if (error || !product) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Producto no encontrado</p>
          <Button onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const displayPrice = product.isOnSale && product.salePrice !== undefined
    ? product.salePrice
    : product.price;

  return (
    <>
      <SeoHead
        meta={{
          title: `${product.name} - Kelani Cosmetics`,
          description: product.description || `Compra ${product.name} en Kelani Cosmetics`,
          keywords: `${product.name}, cosmética, belleza, productos de belleza`,
          canonical: `https://kelanicosmetics.es/producto/${product.barcode}`,
          ogTitle: `${product.name} - Kelani Cosmetics`,
          ogDescription: product.description || `Compra ${product.name} en Kelani Cosmetics`,
          ogUrl: `https://kelanicosmetics.es/producto/${product.barcode}`,
          ogType: 'product',
          ogLocale: 'es_ES',
          ogSiteName: 'Kelani Cosmetics',
          twitterCard: 'summary_large_image',
          twitterTitle: `${product.name} - Kelani Cosmetics`,
          twitterDescription: product.description || `Compra ${product.name} en Kelani Cosmetics`,
        }}
      />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={imageUrl || DEFAULT_PRODUCT_IMAGE_URL}
              alt={product.name}
              className="h-full w-full object-contain"
            />

            {product.isOnSale && product.discountPercentage !== undefined && (
              <Badge className="absolute left-4 top-4 bg-destructive text-destructive-foreground">
                -{Math.round(product.discountPercentage)}%
              </Badge>
            )}

            {product.isFeatured && (
              <Badge className="absolute right-4 top-4 bg-warning text-warning-foreground">
                ⭐ Destacado
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            </div>

            <StockStatusIndicators
              store1InStock={product.store1InStock}
              store2InStock={product.store2InStock}
              storeDetails={storeDetailsArray || []}
            />

            {displayPrice !== undefined && (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {formatPriceForDisplay(displayPrice)}
                </span>
                {product.isOnSale && product.price !== undefined && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPriceForDisplay(product.price)}
                  </span>
                )}
              </div>
            )}

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            <div className="space-y-3 mt-auto pt-4">
              {storeDetailsArray && storeDetailsArray.length > 0 && (
                <StoreSelector
                  productName={product.name}
                  barcode={product.barcode}
                  storeDetails={storeDetailsArray}
                />
              )}

              <ShareProductButton productBarcode={product.barcode} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
