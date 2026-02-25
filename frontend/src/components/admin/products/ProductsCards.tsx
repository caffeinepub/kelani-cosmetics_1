import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Loader2, Star } from 'lucide-react';
import type { UIProduct } from '@/hooks/useProductQueries';
import { useToggleStoreStock } from '@/hooks/useProductQueries';
import { useToggleProductFeatured } from '@/hooks/useToggleProductFeatured';

interface ProductsCardsProps {
  products: UIProduct[];
  onEdit: (product: UIProduct) => void;
  onDelete: (product: UIProduct) => void;
  store1Name?: string;
  store2Name?: string;
}

const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete,
  store1Name,
  store2Name,
  onToggleStore,
  isTogglingStore1,
  isTogglingStore2,
  onToggleFeatured,
  isTogglingFeatured,
}: {
  product: UIProduct;
  onEdit: (product: UIProduct) => void;
  onDelete: (product: UIProduct) => void;
  store1Name: string;
  store2Name: string;
  onToggleStore: (store: 1 | 2) => void;
  isTogglingStore1: boolean;
  isTogglingStore2: boolean;
  onToggleFeatured: () => void;
  isTogglingFeatured: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>
          <p className="text-xs text-muted-foreground">{product.categoryName}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFeatured}
          disabled={isTogglingFeatured}
          className={`h-8 w-8 shrink-0 ${product.isFeatured ? 'text-yellow-500' : 'text-muted-foreground'}`}
          aria-label={product.isFeatured ? 'Quitar destacado' : 'Destacar'}
        >
          {isTogglingFeatured ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Star className="w-4 h-4" fill={product.isFeatured ? 'currentColor' : 'none'} />
          )}
        </Button>
      </div>

      {product.price !== undefined && (
        <p className="text-sm font-semibold">
          {product.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {isTogglingStore1 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Checkbox
              checked={product.store1InStock}
              onCheckedChange={() => onToggleStore(1)}
              id={`store1-${product.barcode}`}
            />
          )}
          <label
            htmlFor={`store1-${product.barcode}`}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            {store1Name}
          </label>
        </div>
        <div className="flex items-center gap-2">
          {isTogglingStore2 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Checkbox
              checked={product.store2InStock}
              onCheckedChange={() => onToggleStore(2)}
              id={`store2-${product.barcode}`}
            />
          )}
          <label
            htmlFor={`store2-${product.barcode}`}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            {store2Name}
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(product)}
        >
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Eliminar
        </Button>
      </div>
    </div>
  );
});

export function ProductsCards({
  products,
  onEdit,
  onDelete,
  store1Name = 'Tienda 1',
  store2Name = 'Tienda 2',
}: ProductsCardsProps) {
  const toggleStoreStock = useToggleStoreStock();
  const toggleFeatured = useToggleProductFeatured();
  const [togglingStore, setTogglingStore] = React.useState<{
    barcode: string;
    store: 1 | 2;
  } | null>(null);

  const handleToggleStore = (product: UIProduct, store: 1 | 2) => {
    setTogglingStore({ barcode: product.barcode, store });
    toggleStoreStock.mutate(
      { product, store },
      { onSettled: () => setTogglingStore(null) }
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {products.length === 0 ? (
        <div className="col-span-full text-center text-muted-foreground py-8">
          No se encontraron productos
        </div>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.barcode}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            store1Name={store1Name}
            store2Name={store2Name}
            onToggleStore={(store) => handleToggleStore(product, store)}
            isTogglingStore1={
              togglingStore?.barcode === product.barcode && togglingStore?.store === 1
            }
            isTogglingStore2={
              togglingStore?.barcode === product.barcode && togglingStore?.store === 2
            }
            onToggleFeatured={() => toggleFeatured.toggleFeatured(product)}
            isTogglingFeatured={toggleFeatured.loadingBarcode === product.barcode}
          />
        ))
      )}
    </div>
  );
}
