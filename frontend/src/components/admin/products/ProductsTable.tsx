import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Loader2, Star } from 'lucide-react';
import type { UIProduct } from '@/hooks/useProductQueries';
import { useToggleStoreStock } from '@/hooks/useProductQueries';
import { useToggleProductFeatured } from '@/hooks/useToggleProductFeatured';

interface ProductsTableProps {
  products: UIProduct[];
  onEdit: (product: UIProduct) => void;
  onDelete: (product: UIProduct) => void;
  store1Name?: string;
  store2Name?: string;
}

const ProductRow = memo(function ProductRow({
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
    <TableRow>
      <TableCell className="font-mono text-xs">{product.barcode}</TableCell>
      <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{product.categoryName}</TableCell>
      <TableCell>
        {product.price !== undefined ? (
          <span className="font-medium">
            {product.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {isTogglingStore1 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Checkbox
              checked={product.store1InStock}
              onCheckedChange={() => onToggleStore(1)}
              aria-label={`${store1Name} en stock`}
            />
          )}
          <span className="text-xs text-muted-foreground ml-1 hidden xl:inline">{store1Name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {isTogglingStore2 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Checkbox
              checked={product.store2InStock}
              onCheckedChange={() => onToggleStore(2)}
              aria-label={`${store2Name} en stock`}
            />
          )}
          <span className="text-xs text-muted-foreground ml-1 hidden xl:inline">{store2Name}</span>
        </div>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFeatured}
          disabled={isTogglingFeatured}
          aria-label={product.isFeatured ? 'Quitar destacado' : 'Destacar'}
          className={product.isFeatured ? 'text-yellow-500' : 'text-muted-foreground'}
        >
          {isTogglingFeatured ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Star className="w-4 h-4" fill={product.isFeatured ? 'currentColor' : 'none'} />
          )}
        </Button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(product)}
            aria-label="Editar producto"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(product)}
            aria-label="Eliminar producto"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  store1Name = 'Tienda 1',
  store2Name = 'Tienda 2',
}: ProductsTableProps) {
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[130px]">Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>{store1Name}</TableHead>
            <TableHead>{store2Name}</TableHead>
            <TableHead>Destacado</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No se encontraron productos
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <ProductRow
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
        </TableBody>
      </Table>
    </div>
  );
}
