import { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useCreateSaleItem,
  useUpdateSaleItem,
  type SaleItem,
} from '../../../hooks/useSaleItemQueries';
import { useProductSearchForSales, type ProductSearchResult } from '../../../hooks/useProductSearchForSales';
import { safeConvertToNumber } from '../../../utils/NumericConverter';
import { timestampToDateString, validateDateRange } from '../../../utils/adminDate';
import { reportErrorWithToast } from '../../../utils/reportErrorWithToast';

interface SaleItemUpsertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSaleItem: SaleItem | null;
}

interface FormData {
  productBarcode: string;
  productName: string;
  originalPrice: number | null;
  salePrice: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function SaleItemUpsertModal({
  open,
  onOpenChange,
  editingSaleItem,
}: SaleItemUpsertModalProps) {
  const createMutation = useCreateSaleItem();
  const updateMutation = useUpdateSaleItem();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);

  const [formData, setFormData] = useState<FormData>({
    productBarcode: '',
    productName: '',
    originalPrice: null,
    salePrice: '',
    discountPercentage: 0,
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Product search
  const { data: searchResults = [] } = useProductSearchForSales(searchQuery);

  // Initialize form when editing sale item changes
  useEffect(() => {
    if (editingSaleItem) {
      setFormData({
        productBarcode: editingSaleItem.productBarcode,
        productName: editingSaleItem.name,
        originalPrice: editingSaleItem.price ?? null,
        salePrice: editingSaleItem.salePrice.toString(),
        discountPercentage: editingSaleItem.discountPercentage,
        startDate: timestampToDateString(editingSaleItem.startDate),
        endDate: timestampToDateString(editingSaleItem.endDate),
        isActive: editingSaleItem.isActive,
      });
      setSelectedProduct({
        barcode: editingSaleItem.productBarcode,
        name: editingSaleItem.name,
        price: editingSaleItem.price ?? 0,
        categoryId: editingSaleItem.categoryId,
        description: editingSaleItem.description,
      });
      setSearchQuery('');
    } else {
      setFormData({
        productBarcode: '',
        productName: '',
        originalPrice: null,
        salePrice: '',
        discountPercentage: 0,
        startDate: '',
        endDate: '',
        isActive: true,
      });
      setSelectedProduct(null);
      setSearchQuery('');
    }
    setFormErrors({});
    setShowSearchResults(false);
  }, [editingSaleItem, open]);

  // Calculate discount percentage when sale price changes
  useEffect(() => {
    if (formData.originalPrice && formData.salePrice) {
      const salePriceNum = safeConvertToNumber(formData.salePrice);
      if (salePriceNum !== null && salePriceNum > 0) {
        const discount = ((formData.originalPrice - salePriceNum) / formData.originalPrice) * 100;
        setFormData((prev) => ({
          ...prev,
          discountPercentage: Math.max(0, discount),
        }));
      }
    }
  }, [formData.originalPrice, formData.salePrice]);

  const handleProductSelect = (product: ProductSearchResult) => {
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      productBarcode: product.barcode,
      productName: product.name,
      originalPrice: product.price,
    }));
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setFormData((prev) => ({
      ...prev,
      productBarcode: '',
      productName: '',
      originalPrice: null,
      salePrice: '',
      discountPercentage: 0,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.productBarcode) {
      errors.productBarcode = 'Debe seleccionar un producto';
    }

    if (!formData.salePrice.trim()) {
      errors.salePrice = 'El precio de oferta es requerido';
    } else {
      const salePriceNum = safeConvertToNumber(formData.salePrice);
      if (salePriceNum === null || salePriceNum <= 0) {
        errors.salePrice = 'El precio de oferta debe ser mayor a 0';
      } else if (formData.originalPrice && salePriceNum >= formData.originalPrice) {
        errors.salePrice = 'El precio de oferta debe ser menor al precio original';
      }
    }

    if (!formData.startDate) {
      errors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      errors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.startDate && formData.endDate) {
      if (!validateDateRange(formData.startDate, formData.endDate)) {
        errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const salePriceNum = safeConvertToNumber(formData.salePrice);
    if (salePriceNum === null) return;

    try {
      if (editingSaleItem) {
        await updateMutation.mutateAsync({
          saleId: editingSaleItem.saleId,
          salePrice: salePriceNum,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });
      } else {
        await createMutation.mutateAsync({
          productBarcode: formData.productBarcode,
          salePrice: salePriceNum,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingSaleItem ? 'Editar Producto en Oferta' : 'Agregar Producto en Oferta'}
          </DialogTitle>
          <DialogDescription>
            {editingSaleItem
              ? 'Actualiza los detalles del producto en oferta.'
              : 'Completa los detalles para crear un nuevo producto en oferta.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Search */}
            {!editingSaleItem && !selectedProduct && (
              <div className="space-y-2">
                <Label htmlFor="product-search">
                  Buscar producto por código, nombre o descripción{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="product-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    placeholder="Buscar producto..."
                    className="pl-9"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery.length >= 2 && searchResults.length > 0 && (
                  <div className="rounded-md border border-border bg-card shadow-lg">
                    <ScrollArea className="max-h-60">
                      {searchResults.map((product) => (
                        <button
                          key={product.barcode}
                          type="button"
                          onClick={() => handleProductSelect(product)}
                          className="flex w-full items-start gap-3 border-b border-border p-3 text-left hover:bg-muted"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Código: {product.barcode}
                            </div>
                            <div className="text-sm font-semibold text-primary">
                              €{product.price.toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        </button>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="rounded-md border border-border bg-card p-4 text-center text-sm text-muted-foreground">
                    No se encontraron productos
                  </div>
                )}

                {formErrors.productBarcode && (
                  <p className="text-sm text-destructive">{formErrors.productBarcode}</p>
                )}
              </div>
            )}

            {/* Selected Product Display */}
            {selectedProduct && (
              <div className="space-y-2">
                <Label>Producto Seleccionado</Label>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted p-3">
                  <div>
                    <div className="font-medium">{selectedProduct.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Código: {selectedProduct.barcode}
                    </div>
                  </div>
                  {!editingSaleItem && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearProduct}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Cambiar producto</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Original Price (Read-only) */}
            {selectedProduct && (
              <div className="space-y-2">
                <Label>Precio Original</Label>
                <Input
                  type="text"
                  value={
                    formData.originalPrice
                      ? `€${formData.originalPrice.toFixed(2).replace('.', ',')}`
                      : 'N/A'
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {/* Sale Price */}
            {selectedProduct && (
              <div className="space-y-2">
                <Label htmlFor="sale-price">
                  Precio de Oferta <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sale-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, salePrice: e.target.value }))
                  }
                  placeholder="e.g., 14.99"
                  className={formErrors.salePrice ? 'border-destructive' : ''}
                />
                {formErrors.salePrice && (
                  <p className="text-sm text-destructive">{formErrors.salePrice}</p>
                )}
              </div>
            )}

            {/* Discount Percentage (Read-only) */}
            {selectedProduct && formData.salePrice && (
              <div className="space-y-2">
                <Label>Descuento (%)</Label>
                <Input
                  type="text"
                  value={`${formData.discountPercentage.toFixed(0)}%`}
                  disabled
                  className="bg-muted font-semibold text-green-600"
                />
              </div>
            )}

            {/* Start Date */}
            {selectedProduct && (
              <div className="space-y-2">
                <Label htmlFor="start-date">
                  Fecha de Inicio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className={formErrors.startDate ? 'border-destructive' : ''}
                />
                {formErrors.startDate && (
                  <p className="text-sm text-destructive">{formErrors.startDate}</p>
                )}
              </div>
            )}

            {/* End Date */}
            {selectedProduct && (
              <div className="space-y-2">
                <Label htmlFor="end-date">
                  Fecha de Fin <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className={formErrors.endDate ? 'border-destructive' : ''}
                />
                {formErrors.endDate && (
                  <p className="text-sm text-destructive">{formErrors.endDate}</p>
                )}
              </div>
            )}

            {/* Active Checkbox (only for new items) */}
            {!editingSaleItem && selectedProduct && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked === true }))
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Activo
                </Label>
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || !selectedProduct}>
            {isSubmitting ? 'Guardando...' : editingSaleItem ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
