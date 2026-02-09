import { useState, memo } from 'react';
import { Edit, Trash2, Copy, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToggleProductInStock, useToggleProductFeatured, type Product } from '../../../hooks/useProductQueries';
import { formatPriceForDisplay } from '../../../utils/NumericConverter';
import { reportSuccessWithToast } from '../../../utils/reportErrorWithToast';

interface ProductsCardsProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isLoading: boolean;
}

const ProductCard = memo(({ 
  product, 
  onEdit, 
  onDelete,
  isPendingStock,
  isPendingFeatured,
  onToggleStock,
  onToggleFeatured,
  onCopyBarcode
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isPendingStock: boolean;
  isPendingFeatured: boolean;
  onToggleStock: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
  onCopyBarcode: (barcode: string) => void;
}) => {
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  const handleCopy = async (barcode: string) => {
    await onCopyBarcode(barcode);
    setCopiedBarcode(true);
    setTimeout(() => setCopiedBarcode(false), 2000);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Name */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="break-words text-base font-semibold leading-tight">{product.name}</h3>
            {product.isFeatured && (
              <Badge variant="secondary" className="shrink-0">
                <Star className="mr-1 h-3 w-3 fill-current" />
                Destacado
              </Badge>
            )}
          </div>

          {/* Barcode with Copy */}
          <div className="flex items-center gap-2">
            <span className="break-all text-xs text-muted-foreground font-mono">{product.barcode}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => handleCopy(product.barcode)}
            >
              {copiedBarcode ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="sr-only">Copiar código de barras</span>
            </Button>
          </div>

          {/* Category and Price */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Categoría:</span>
              <div className="break-words font-medium">{product.categoryName || 'Sin categoría'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Precio:</span>
              <div className="font-semibold">
                {product.price !== undefined ? formatPriceForDisplay(product.price) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Stock Status Badge */}
          <div>
            <Badge variant={product.inStock ? 'default' : 'destructive'}>
              {product.inStock ? 'En Stock' : 'Sin Stock'}
            </Badge>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">En Stock:</span>
              <Checkbox
                checked={product.inStock}
                onCheckedChange={() => onToggleStock(product)}
                disabled={isPendingStock}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Destacado:</span>
              <Checkbox
                checked={product.isFeatured}
                onCheckedChange={() => onToggleFeatured(product)}
                disabled={isPendingFeatured}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              disabled={isPendingStock || isPendingFeatured}
              className="min-h-[44px] w-full sm:flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(product)}
              disabled={isPendingStock || isPendingFeatured}
              className="min-h-[44px] w-full text-destructive hover:text-destructive sm:flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default function ProductsCards({
  products,
  onEdit,
  onDelete,
  isLoading,
}: ProductsCardsProps) {
  const toggleStockMutation = useToggleProductInStock();
  const toggleFeaturedMutation = useToggleProductFeatured();
  const [pendingStockBarcode, setPendingStockBarcode] = useState<string | null>(null);
  const [pendingFeaturedBarcode, setPendingFeaturedBarcode] = useState<string | null>(null);

  const handleToggleStock = async (product: Product) => {
    setPendingStockBarcode(product.barcode);
    try {
      await toggleStockMutation.mutateAsync(product.barcode);
    } finally {
      setPendingStockBarcode(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    setPendingFeaturedBarcode(product.barcode);
    try {
      await toggleFeaturedMutation.mutateAsync(product);
    } finally {
      setPendingFeaturedBarcode(null);
    }
  };

  const handleCopyBarcode = async (barcode: string) => {
    try {
      await navigator.clipboard.writeText(barcode);
      reportSuccessWithToast('Código copiado al portapapeles');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductCard
          key={product.barcode}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          isPendingStock={pendingStockBarcode === product.barcode}
          isPendingFeatured={pendingFeaturedBarcode === product.barcode}
          onToggleStock={handleToggleStock}
          onToggleFeatured={handleToggleFeatured}
          onCopyBarcode={handleCopyBarcode}
        />
      ))}
    </div>
  );
}
