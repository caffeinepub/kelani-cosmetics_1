import { useState, useEffect } from 'react';
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
import { useToggleProductInStock } from '../../../hooks/useProductQueries';
import type { Product } from '../../../hooks/useProductQueries';
import { createBlobUrl, revokeBlobUrl } from '../../../utils/imageWebp';
import { formatPriceForDisplay } from '../../../utils/NumericConverter';
import { reportSuccessWithToast } from '../../../utils/reportErrorWithToast';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isLoading?: boolean;
}

export default function ProductsTable({
  products,
  onEdit,
  onDelete,
  isLoading,
}: ProductsTableProps) {
  const toggleInStockMutation = useToggleProductInStock();
  const [togglingBarcode, setTogglingBarcode] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      reportSuccessWithToast('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleToggleInStock = async (product: Product) => {
    setTogglingBarcode(product.barcode);
    try {
      await toggleInStockMutation.mutateAsync(product.barcode);
    } finally {
      setTogglingBarcode(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Barcode</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-32">Category</TableHead>
            <TableHead className="w-24">Price</TableHead>
            <TableHead className="w-28">In Stock</TableHead>
            <TableHead className="w-28">Featured</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductRow
              key={product.barcode}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleInStock={handleToggleInStock}
              isToggling={togglingBarcode === product.barcode}
              copiedField={copiedField}
              onCopy={handleCopy}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleInStock: (product: Product) => void;
  isToggling: boolean;
  copiedField: string | null;
  onCopy: (text: string, fieldId: string) => void;
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  onToggleInStock,
  isToggling,
  copiedField,
  onCopy,
}: ProductRowProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (product.photo) {
      const url = createBlobUrl(product.photo);
      setPhotoUrl(url);
      return () => revokeBlobUrl(url);
    }
  }, [product.photo]);

  const barcodeFieldId = `barcode-${product.barcode}`;
  const nameFieldId = `name-${product.barcode}`;

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-mono text-sm">
        <div className="flex items-center gap-2">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={product.name}
              className="h-8 w-8 rounded object-cover"
            />
          )}
          <span>{product.barcode}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => onCopy(product.barcode, barcodeFieldId)}
          >
            {copiedField === barcodeFieldId ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="sr-only">Copy barcode</span>
          </Button>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <span>{product.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => onCopy(product.name, nameFieldId)}
          >
            {copiedField === nameFieldId ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="sr-only">Copy name</span>
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">ID: {product.categoryId}</span>
      </TableCell>
      <TableCell>
        {product.price !== undefined ? (
          <span className="font-medium">{formatPriceForDisplay(product.price)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={product.inStock}
            onCheckedChange={() => onToggleInStock(product)}
            disabled={isToggling}
            aria-label={product.inStock ? 'In stock' : 'Out of stock'}
          />
          <span className="text-sm text-muted-foreground">
            {product.inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={product.isFeatured}
            disabled
            aria-label={product.isFeatured ? 'Featured' : 'Normal'}
          />
          <span className="text-sm text-muted-foreground">
            {product.isFeatured ? 'Featured' : 'Normal'}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
