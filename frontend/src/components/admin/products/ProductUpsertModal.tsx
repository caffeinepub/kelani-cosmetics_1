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
  store1Name: string;
  store2Name: string;
  storeNamesLoading: boolean;
}

interface FormData {
  barcode: string;
  name: string;
  categoryId: string;
  description: string;
  price: string;
  store1InStock: boolean;
  store2InStock: boolean;
  isFeatured: boolean;
}

export default function ProductUpsertModal({
  open,
  onOpenChange,
  editingProduct,
  store1Name,
  store2Name,
  storeNamesLoading,
}: ProductUpsertModalProps) {
  const { data: categories = [] } = useGetAllCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isMobile = useIsMobile();

  const isEditMode = !!editingProduct;

  const [formData, setFormData] = useState<FormData>({
    barcode: '',
    name: '',
    categoryId: SENTINEL_VALUES.NONE,
    description: '',
    price: '',
    store1InStock: false,
    store2InStock: false,
    isFeatured: false,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [existingPhotoBytes, setExistingPhotoBytes] = useState<Uint8Array | null>(null);
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  // Initialize form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        barcode: editingProduct.barcode,
        name: editingProduct.name,
        categoryId: initializeSelectState(editingProduct.categoryId.toString()),
        description: editingProduct.description || '',
        price: editingProduct.price !== undefined ? editingProduct.price.toString() : '',
        store1InStock: editingProduct.store1InStock,
        store2InStock: editingProduct.store2InStock,
        isFeatured: editingProduct.isFeatured,
      });

      // Handle existing photo
      if (editingProduct.photo) {
        setExistingPhotoBytes(editingProduct.photo);
        const url = createBlobUrl(editingProduct.photo, 'image/jpeg');
        setPhotoPreviewUrl(url);
      } else {
        setExistingPhotoBytes(null);
        setPhotoPreviewUrl(null);
      }

      setPhotoFile(null);
    } else {
      // Reset form for create mode
      setFormData({
        barcode: '',
        name: '',
        categoryId: SENTINEL_VALUES.NONE,
        description: '',
        price: '',
        store1InStock: false,
        store2InStock: false,
        isFeatured: false,
      });
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      setExistingPhotoBytes(null);
    }
    setCopiedBarcode(false);
  }, [editingProduct, open]);

  // Cleanup blob URLs on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        revokeBlobUrl(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        reportErrorWithToast(new Error(validation.error), 'Error de validación de imagen');
        return;
      }

      // Convert to WebP
      const webpBytes = await convertToWebP(file);

      // Create preview URL
      if (photoPreviewUrl) {
        revokeBlobUrl(photoPreviewUrl);
      }
      const previewUrl = createBlobUrl(webpBytes, 'image/webp');
      setPhotoPreviewUrl(previewUrl);

      // Store file for upload - convert Uint8Array to Blob then to File
      // Create a new Uint8Array to ensure proper ArrayBuffer type
      const buffer = new Uint8Array(webpBytes);
      const webpBlob = new Blob([buffer.buffer], { type: 'image/webp' });
      const webpFile = new File([webpBlob], 'product.webp', { type: 'image/webp' });
      setPhotoFile(webpFile);
      setExistingPhotoBytes(null);
    } catch (error) {
      reportErrorWithToast(error, 'Error al procesar la imagen');
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreviewUrl) {
      revokeBlobUrl(photoPreviewUrl);
    }
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setExistingPhotoBytes(null);
  };

  const handleCopyBarcode = async () => {
    if (formData.barcode) {
      try {
        await navigator.clipboard.writeText(formData.barcode);
        setCopiedBarcode(true);
        reportSuccessWithToast('Código copiado al portapapeles');
        setTimeout(() => setCopiedBarcode(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate required fields
    if (!formData.barcode.trim()) {
      reportErrorWithToast(new Error('Validation error'), 'El código de barras es requerido');
      return;
    }

    if (!formData.name.trim()) {
      reportErrorWithToast(new Error('Validation error'), 'El nombre es requerido');
      return;
    }

    const categoryIdNumber = convertSentinelToNull(formData.categoryId);
    if (categoryIdNumber === null) {
      reportErrorWithToast(new Error('Validation error'), 'La categoría es requerida');
      return;
    }

    // Convert price
    const priceNumber = formData.price.trim() ? safeConvertToNumber(formData.price) : null;
    if (formData.price.trim() && priceNumber === null) {
      reportErrorWithToast(new Error('Validation error'), 'El precio debe ser un número válido');
      return;
    }

    // Prepare photo bytes
    let photoBytes: Uint8Array | undefined = undefined;
    if (photoFile) {
      const arrayBuffer = await photoFile.arrayBuffer();
      photoBytes = new Uint8Array(arrayBuffer);
    } else if (existingPhotoBytes) {
      photoBytes = existingPhotoBytes;
    }

    const productData = {
      barcode: formData.barcode.trim(),
      name: formData.name.trim(),
      categoryId: Number(categoryIdNumber),
      description: formData.description.trim() || undefined,
      price: priceNumber !== null ? priceNumber : undefined,
      store1InStock: formData.store1InStock,
      store2InStock: formData.store2InStock,
      isFeatured: formData.isFeatured,
      photo: photoBytes,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync(productData);
      } else {
        await createMutation.mutateAsync(productData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          isMobile ? 'h-[100dvh] max-h-[100dvh] w-full max-w-full rounded-none p-0' : 'max-w-2xl'
        }`}
      >
        <DialogHeader className={isMobile ? 'px-6 pt-6' : ''}>
          <DialogTitle>{isEditMode ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifica los detalles del producto'
              : 'Completa los detalles del nuevo producto'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className={isMobile ? 'h-[calc(100dvh-180px)]' : 'max-h-[60vh]'}>
          <form onSubmit={handleSubmit} className={isMobile ? 'px-6' : 'px-6'}>
            <div className="space-y-6 py-4">
              {/* Barcode */}
              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras *</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    disabled={isEditMode}
                    placeholder="Ej: 8412345678901"
                    className={isMobile ? 'h-12 text-base' : ''}
                  />
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyBarcode}
                      className={isMobile ? 'h-12 w-12' : ''}
                    >
                      {copiedBarcode ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copiar código</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Shampoo Reparador"
                  className={isMobile ? 'h-12 text-base' : ''}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <SafeSelect
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
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
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción del producto (opcional)"
                  rows={3}
                  className={isMobile ? 'text-base' : ''}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Precio (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Ej: 12.99"
                  className={isMobile ? 'h-12 text-base' : ''}
                />
              </div>

              {/* Store 1 Stock */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="store1InStock"
                  checked={formData.store1InStock}
                  onCheckedChange={(checked) =>
                    handleInputChange('store1InStock', checked === true)
                  }
                  disabled={storeNamesLoading}
                  className={isMobile ? 'h-6 w-6' : ''}
                />
                <Label
                  htmlFor="store1InStock"
                  className={`cursor-pointer ${isMobile ? 'text-base' : ''}`}
                >
                  {store1Name} - En Stock
                </Label>
              </div>

              {/* Store 2 Stock */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="store2InStock"
                  checked={formData.store2InStock}
                  onCheckedChange={(checked) =>
                    handleInputChange('store2InStock', checked === true)
                  }
                  disabled={storeNamesLoading}
                  className={isMobile ? 'h-6 w-6' : ''}
                />
                <Label
                  htmlFor="store2InStock"
                  className={`cursor-pointer ${isMobile ? 'text-base' : ''}`}
                >
                  {store2Name} - En Stock
                </Label>
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked === true)}
                  className={isMobile ? 'h-6 w-6' : ''}
                />
                <Label
                  htmlFor="isFeatured"
                  className={`cursor-pointer ${isMobile ? 'text-base' : ''}`}
                >
                  Producto Destacado
                </Label>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Foto del Producto</Label>
                {photoPreviewUrl ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                      <img
                        src={photoPreviewUrl}
                        alt="Vista previa"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemovePhoto}
                      className="w-full gap-2"
                      size={isMobile ? 'lg' : 'default'}
                    >
                      <X className="h-4 w-4" />
                      Eliminar Foto
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="photo"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('photo')?.click()}
                      className="w-full gap-2"
                      size={isMobile ? 'lg' : 'default'}
                    >
                      <Upload className="h-4 w-4" />
                      Subir Foto
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG o WebP. Máximo 10MB.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className={isMobile ? 'px-6 pb-6' : ''}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? 'flex-1' : ''}
            size={isMobile ? 'lg' : 'default'}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={isMobile ? 'flex-1' : ''}
            size={isMobile ? 'lg' : 'default'}
          >
            {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
