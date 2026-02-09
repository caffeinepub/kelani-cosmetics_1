import { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  SafeSelect,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SENTINEL_VALUES,
  initializeSelectState,
  convertSentinelToNull,
} from '../../SafeSelect';
import { useGetAllCategories } from '../../../hooks/useQueries';
import {
  useCreateProduct,
  useUpdateProduct,
  type Product,
} from '../../../hooks/useProductQueries';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { safeConvertToNumber } from '../../../utils/NumericConverter';
import {
  validateImageFile,
  convertToWebP,
  createBlobUrl,
  revokeBlobUrl,
} from '../../../utils/imageWebp';
import { reportErrorWithToast, reportSuccessWithToast } from '../../../utils/reportErrorWithToast';

interface ProductUpsertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
}

interface FormData {
  barcode: string;
  name: string;
  categoryId: string;
  description: string;
  price: string;
  inStock: boolean;
  isFeatured: boolean;
}

export default function ProductUpsertModal({
  open,
  onOpenChange,
  editingProduct,
}: ProductUpsertModalProps) {
  const { data: categories = [] } = useGetAllCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState<FormData>({
    barcode: '',
    name: '',
    categoryId: SENTINEL_VALUES.NONE,
    description: '',
    price: '',
    inStock: true,
    isFeatured: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [photoFile, setPhotoFile] = useState<Uint8Array | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Initialize form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        barcode: editingProduct.barcode,
        name: editingProduct.name,
        categoryId: editingProduct.categoryId.toString(),
        description: editingProduct.description ?? '',
        price: editingProduct.price !== undefined ? editingProduct.price.toString() : '',
        inStock: editingProduct.inStock,
        isFeatured: editingProduct.isFeatured,
      });

      if (editingProduct.photo) {
        setPhotoFile(editingProduct.photo);
        const url = createBlobUrl(editingProduct.photo);
        setPhotoPreviewUrl(url);
      }
    } else {
      setFormData({
        barcode: '',
        name: '',
        categoryId: SENTINEL_VALUES.NONE,
        description: '',
        price: '',
        inStock: true,
        isFeatured: false,
      });
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
    }
    setFormErrors({});
  }, [editingProduct, open]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        revokeBlobUrl(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      reportSuccessWithToast('Copiado al portapapeles');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      reportErrorWithToast(new Error(validation.error), validation.error ?? 'Archivo inválido', {
        operation: 'validateImageFile',
      });
      return;
    }

    try {
      const webpBytes = await convertToWebP(file, 0.8);
      setPhotoFile(webpBytes);

      // Create preview URL
      if (photoPreviewUrl) {
        revokeBlobUrl(photoPreviewUrl);
      }
      const url = createBlobUrl(webpBytes);
      setPhotoPreviewUrl(url);
    } catch (error) {
      reportErrorWithToast(error, 'Error al procesar la imagen', {
        operation: 'convertToWebP',
      });
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreviewUrl) {
      revokeBlobUrl(photoPreviewUrl);
      setPhotoPreviewUrl(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.barcode.trim()) {
      errors.barcode = 'El código de barras es requerido';
    }

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    const categoryIdConverted = convertSentinelToNull(formData.categoryId);
    if (!categoryIdConverted) {
      errors.categoryId = 'La categoría es requerida';
    }

    if (formData.price.trim()) {
      const priceNum = safeConvertToNumber(formData.price);
      if (priceNum === null || priceNum < 0) {
        errors.price = 'El precio debe ser un número válido positivo';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const categoryIdConverted = convertSentinelToNull(formData.categoryId);
    if (!categoryIdConverted) return;

    const categoryId = Number(categoryIdConverted);
    const price = formData.price.trim() ? safeConvertToNumber(formData.price) : undefined;

    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({
          barcode: formData.barcode,
          name: formData.name.trim(),
          categoryId,
          description: formData.description.trim() || undefined,
          price: price ?? undefined,
          inStock: formData.inStock,
          isFeatured: formData.isFeatured,
          photo: photoFile ?? undefined,
        });
      } else {
        await createMutation.mutateAsync({
          barcode: formData.barcode.trim(),
          name: formData.name.trim(),
          categoryId,
          description: formData.description.trim() || undefined,
          price: price ?? undefined,
          inStock: formData.inStock,
          isFeatured: formData.isFeatured,
          photo: photoFile ?? undefined,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const safeCategoryId = useMemo(
    () => initializeSelectState(formData.categoryId, SENTINEL_VALUES.NONE),
    [formData.categoryId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "admin-modal-mobile" : "max-h-[90vh] sm:max-w-[600px]"}>
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
          <DialogDescription>
            {editingProduct
              ? 'Actualiza los detalles del producto.'
              : 'Completa los detalles para crear un nuevo producto.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className={isMobile ? "admin-modal-content-mobile" : "max-h-[60vh] pr-4"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">
                Código de Barras <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="barcode"
                  type="text"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, barcode: e.target.value }))
                  }
                  placeholder="ej: 1234567890"
                  disabled={!!editingProduct}
                  className={`${formErrors.barcode ? 'border-destructive' : ''} ${isMobile ? 'min-h-[48px]' : ''}`}
                />
                {formData.barcode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(formData.barcode, 'barcode')}
                    className={isMobile ? "min-h-[48px] min-w-[48px]" : ""}
                  >
                    {copiedField === 'barcode' ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copiar código</span>
                  </Button>
                )}
              </div>
              {formErrors.barcode && (
                <p className="text-sm text-destructive">{formErrors.barcode}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="ej: Lápiz Labial Rojo"
                  className={`${formErrors.name ? 'border-destructive' : ''} ${isMobile ? 'min-h-[48px]' : ''}`}
                />
                {formData.name && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(formData.name, 'name')}
                    className={isMobile ? "min-h-[48px] min-w-[48px]" : ""}
                  >
                    {copiedField === 'name' ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copiar nombre</span>
                  </Button>
                )}
              </div>
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <SafeSelect
                value={safeCategoryId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryId: value }))
                }
                contentClassName="admin-category-select-content"
              >
                <SelectScrollUpButton />
                <SelectGroup>
                  <SelectLabel>Categorías</SelectLabel>
                  {categories.map((category) => (
                    <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectScrollDownButton />
              </SafeSelect>
              {formErrors.categoryId && (
                <p className="text-sm text-destructive">{formErrors.categoryId}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descripción del producto (opcional)"
                rows={3}
                className={isMobile ? 'min-h-[96px]' : ''}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="ej: 19.99"
                className={`${formErrors.price ? 'border-destructive' : ''} ${isMobile ? 'min-h-[48px]' : ''}`}
              />
              {formErrors.price && (
                <p className="text-sm text-destructive">{formErrors.price}</p>
              )}
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photo">Foto del Producto</Label>
              {photoPreviewUrl ? (
                <div className="relative">
                  <img
                    src={photoPreviewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Eliminar foto</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className={isMobile ? 'min-h-[48px]' : ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById('photo')?.click()}
                    className={isMobile ? "min-h-[48px] min-w-[48px]" : ""}
                  >
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Subir foto</span>
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                JPG, PNG o WebP. Máximo 10MB.
              </p>
            </div>

            {/* In Stock Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, inStock: checked === true }))
                }
              />
              <Label
                htmlFor="inStock"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                En Stock
              </Label>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isFeatured: checked === true }))
                }
              />
              <Label
                htmlFor="isFeatured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Destacado
              </Label>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className={isMobile ? "admin-modal-footer-mobile" : ""}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? "flex-1" : ""}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={isMobile ? "flex-1" : ""}
          >
            {isSubmitting ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
