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
import { useIsMobile } from '../../../hooks/useMediaQuery';
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
  const isMobile = useIsMobile();

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
        // Use BigInt-safe timestamp conversion
        startDate: timestampToDateString(editingSaleItem.startDate),
        endDate: timestampToDateString(editingSaleItem.endDate),
        isActive: editingSaleItem.isActive,
      });
      setSelectedProduct({
        barcode: editingSaleItem.productBarcode,
        name: editingSaleItem.name,
        price: editingSaleItem.price ?? 0,
        categoryId: editingSaleItem.categoryId,
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
      <DialogContent className={isMobile ? "admin-modal-mobile" : "max-h-[90vh] sm:max-w-[600px]"}>
        <DialogHeader>
          <DialogTitle>
            {editingSaleItem ? 'Editar Producto en Oferta' : 'Nuevo Producto en Oferta'}
          </DialogTitle>
          <DialogDescription>
            {editingSaleItem
              ? 'Modifica los detalles del producto en oferta'
              : 'Busca un producto y configura su precio de oferta'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className={isMobile ? "admin-modal-content-mobile" : "max-h-[60vh] pr-4"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Search */}
            {!editingSaleItem && !selectedProduct && (
              <div className="space-y-2">
                <Label htmlFor="product-search">Buscar Producto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="product-search"
                    type="text"
                    placeholder="Buscar por nombre o código de barras..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(e.target.value.length >= 2);
                    }}
                    onFocus={() => setShowSearchResults(searchQuery.length >= 2)}
                    className={`pl-9 ${isMobile ? 'min-h-[48px]' : ''}`}
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-md border bg-popover p-2 shadow-md">
                    {searchResults.map((product) => (
                      <button
                        key={product.barcode}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className={`w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${isMobile ? 'min-h-[48px]' : ''}`}
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.barcode} • €{product.price.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="mt-2 rounded-md border bg-muted p-3 text-center text-sm text-muted-foreground">
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
                <div className="flex items-center justify-between rounded-md border bg-muted p-3">
                  <div>
                    <div className="font-medium break-words">{selectedProduct.name}</div>
                    <div className="text-sm text-muted-foreground break-all">
                      {selectedProduct.barcode} • Precio: €{selectedProduct.price.toFixed(2)}
                    </div>
                  </div>
                  {!editingSaleItem && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearProduct}
                      className={`h-8 w-8 shrink-0 ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Sale Price */}
            {selectedProduct && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sale-price">Precio de Oferta (€)</Label>
                  <Input
                    id="sale-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.salePrice}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, salePrice: e.target.value }))
                    }
                    className={`${formErrors.salePrice ? 'border-destructive' : ''} ${isMobile ? 'min-h-[48px]' : ''}`}
                  />
                  {formErrors.salePrice && (
                    <p className="text-sm text-destructive">{formErrors.salePrice}</p>
                  )}
                </div>

                {/* Discount Percentage Display */}
                {formData.discountPercentage > 0 && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                    Descuento: {formData.discountPercentage.toFixed(1)}%
                  </div>
                )}

                {/* Date Range */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Fecha de Inicio</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                      className={`${formErrors.startDate ? 'border-destructive' : ''} ${isMobile ? 'min-h-[48px]' : ''}`}
                    />
                    {formErrors.startDate && (
                      <p className="text-sm text-destructive">{formErrors.startDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">Fecha de Fin</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      className={`${formErrors.endDate ? 'border-destructive' : ''} ${isMobile ? 'min-h-[48px]' : ''}`}
                    />
                    {formErrors.endDate && (
                      <p className="text-sm text-destructive">{formErrors.endDate}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </form>
        </ScrollArea>

        <DialogFooter className={isMobile ? "admin-modal-footer-mobile" : ""}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? "min-h-[48px]" : ""}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedProduct}
            className={isMobile ? "min-h-[48px]" : ""}
          >
            {isSubmitting ? 'Guardando...' : editingSaleItem ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
