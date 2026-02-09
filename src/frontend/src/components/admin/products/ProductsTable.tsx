import { useState } from 'react';
import { Edit, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToggleProductInStock, useToggleProductFeatured, type Product } from '../../../hooks/useProductQueries';
import { formatPriceForDisplay } from '../../../utils/NumericConverter';
import { reportSuccessWithToast } from '../../../utils/reportErrorWithToast';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isLoading: boolean;
}

export default function ProductsTable({
  products,
  onEdit,
  onDelete,
  isLoading,
}: ProductsTableProps) {
  const toggleStockMutation = useToggleProductInStock();
  const toggleFeaturedMutation = useToggleProductFeatured();
  const [pendingStockBarcode, setPendingStockBarcode] = useState<string | null>(null);
  const [pendingFeaturedBarcode, setPendingFeaturedBarcode] = useState<string | null>(null);
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

  const handleToggleStock = async (barcode: string) => {
    setPendingStockBarcode(barcode);
    try {
      await toggleStockMutation.mutateAsync(barcode);
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
      setCopiedBarcode(barcode);
      reportSuccessWithToast('Código copiado al portapapeles');
      setTimeout(() => setCopiedBarcode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="w-28">Precio</TableHead>
            <TableHead className="w-24 text-center">Stock</TableHead>
            <TableHead className="w-28 text-center">Destacado</TableHead>
            <TableHead className="w-32 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isPendingStock = pendingStockBarcode === product.barcode;
            const isPendingFeatured = pendingFeaturedBarcode === product.barcode;
            const isCopied = copiedBarcode === product.barcode;

            return (
              <TableRow key={product.barcode} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-1">
                    <span className="truncate">{product.barcode}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleCopyBarcode(product.barcode)}
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span className="sr-only">Copiar código</span>
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.categoryName || 'Sin categoría'}</TableCell>
                <TableCell>
                  {product.price !== undefined ? formatPriceForDisplay(product.price) : 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={product.inStock}
                      onCheckedChange={() => handleToggleStock(product.barcode)}
                      disabled={isPendingStock}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={product.isFeatured}
                      onCheckedChange={() => handleToggleFeatured(product)}
                      disabled={isPendingFeatured}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(product)}
                      disabled={isPendingStock || isPendingFeatured}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(product)}
                      disabled={isPendingStock || isPendingFeatured}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
