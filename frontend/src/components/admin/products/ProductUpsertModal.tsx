import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload } from 'lucide-react';
import { CategorySelect } from '@/components/categories/CategorySelect';
import { useCreateProduct, useUpdateProduct, type UIProduct } from '@/hooks/useProductQueries';
import { convertToWebP, createBlobUrl } from '@/utils/imageWebp';
import { DEFAULT_PRODUCT_IMAGE_URL } from '@/utils/productImage';
import { useActor } from '@/hooks/useActor';
import { reportErrorWithToast } from '@/utils/reportErrorWithToast';

interface ProductUpsertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: UIProduct | null;
  store1Name?: string;
  store2Name?: string;
}

interface FormData {
  barcode: string;
  name: string;
  categoryId: number | undefined;
  description: string;
  price: string;
  inStock: boolean;
  isFeatured: boolean;
  store1InStock: boolean;
  store2InStock: boolean;
}

const defaultFormData: FormData = {
  barcode: '',
  name: '',
  categoryId: undefined,
  description: '',
  price: '',
  inStock: true,
  isFeatured: false,
  store1InStock: true,
  store2InStock: true,
};

export function ProductUpsertModal({
  open,
  onOpenChange,
  product,
  store1Name = 'Tienda 1',
  store2Name = 'Tienda 2',
}: ProductUpsertModalProps) {
  const isEdit = !!product;
  const { actor } = useActor();

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBytes, setPhotoBytes] = useState<Uint8Array | null>(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          barcode: product.barcode,
          name: product.name,
          categoryId: product.categoryId,
          description: product.description ?? '',
          price: product.price !== undefined ? String(product.price) : '',
          inStock: product.inStock,
          isFeatured: product.isFeatured,
          store1InStock: product.store1InStock,
          store2InStock: product.store2InStock,
        });
        // Reset photo state — lazy load will start via separate effect
        setPhotoPreview(null);
        setPhotoBytes(null);
        setIsPhotoLoading(true);
      } else {
        setFormData(defaultFormData);
        setPhotoPreview(null);
        setPhotoBytes(null);
        setIsPhotoLoading(false);
      }
      setErrors({});
    }
  }, [open, product]);

  // Lazy-load photo when editing a product
  useEffect(() => {
    if (!open || !isEdit || !product || !actor) return;

    let cancelled = false;

    const fetchPhoto = async () => {
      setIsPhotoLoading(true);
      try {
        const photoData = await actor.getProductPhoto(product.barcode);
        if (cancelled) return;
        if (photoData && photoData.length > 0) {
          const blob = new Blob([new Uint8Array(photoData)], { type: 'image/webp' });
          const url = URL.createObjectURL(blob);
          setPhotoPreview(url);
          setPhotoBytes(new Uint8Array(photoData));
        }
      } catch {
        // No photo available — keep showing default image
      } finally {
        if (!cancelled) {
          setIsPhotoLoading(false);
        }
      }
    };

    fetchPhoto();

    return () => {
      cancelled = true;
    };
  }, [open, isEdit, product?.barcode, actor]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // convertToWebP returns Uint8Array directly
      const webpBytes = await convertToWebP(file);
      const previewUrl = createBlobUrl(webpBytes, 'image/webp');
      setPhotoBytes(webpBytes);
      setPhotoPreview(previewUrl);
    } catch (error) {
      reportErrorWithToast(error, 'Error al procesar la imagen');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.barcode.trim()) newErrors.barcode = 'El código de barras es requerido';
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.categoryId) newErrors.categoryId = 'La categoría es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const rawPrice = formData.price.trim().replace(',', '.');
    const price = rawPrice ? parseFloat(rawPrice) : null;
    const categoryId = formData.categoryId!;

    const params = {
      barcode: formData.barcode.trim(),
      name: formData.name.trim(),
      categoryId,
      description: formData.description.trim() || null,
      price: price !== null && !isNaN(price) ? price : null,
      inStock: formData.store1InStock || formData.store2InStock,
      isFeatured: formData.isFeatured,
      photo: photoBytes,
      store1InStock: formData.store1InStock,
      store2InStock: formData.store2InStock,
    };

    try {
      if (isEdit) {
        await updateProduct.mutateAsync(params);
      } else {
        await createProduct.mutateAsync(params);
      }
      onOpenChange(false);
    } catch {
      // Error handled by mutation hooks
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo area */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border bg-muted">
              <img
                src={photoPreview ?? DEFAULT_PRODUCT_IMAGE_URL}
                alt="Foto del producto"
                className="w-full h-full object-cover"
              />
              {isPhotoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
              >
                <Upload className="w-4 h-4 mr-1" />
                {photoPreview ? 'Cambiar foto' : 'Subir foto'}
              </Button>
              {photoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoBytes(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isPending}
                >
                  Quitar foto
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Barcode */}
          <div className="space-y-1">
            <Label htmlFor="barcode">Código de barras *</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData((f) => ({ ...f, barcode: e.target.value }))}
              disabled={isEdit || isPending}
              placeholder="Ej: 8410001234567"
            />
            {errors.barcode && (
              <p className="text-xs text-destructive">{errors.barcode}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              disabled={isPending}
              placeholder="Nombre del producto"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Categoría *</Label>
            <CategorySelect
              value={formData.categoryId !== undefined ? String(formData.categoryId) : ''}
              onValueChange={(val) =>
                setFormData((f) => ({ ...f, categoryId: val ? Number(val) : undefined }))
              }
            />
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <Label htmlFor="price">Precio (€)</Label>
            <Input
              id="price"
              type="text"
              inputMode="decimal"
              value={formData.price}
              onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
              disabled={isPending}
              placeholder="Ej: 9,99"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              disabled={isPending}
              placeholder="Descripción del producto (opcional)"
              rows={3}
            />
          </div>

          {/* Stock checkboxes */}
          <div className="space-y-2">
            <Label>Stock por tienda</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="store1InStock"
                  checked={formData.store1InStock}
                  onCheckedChange={(checked) =>
                    setFormData((f) => ({
                      ...f,
                      store1InStock: !!checked,
                      inStock: !!checked || f.store2InStock,
                    }))
                  }
                  disabled={isPending}
                />
                <Label htmlFor="store1InStock" className="font-normal cursor-pointer">
                  {store1Name}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="store2InStock"
                  checked={formData.store2InStock}
                  onCheckedChange={(checked) =>
                    setFormData((f) => ({
                      ...f,
                      store2InStock: !!checked,
                      inStock: f.store1InStock || !!checked,
                    }))
                  }
                  disabled={isPending}
                />
                <Label htmlFor="store2InStock" className="font-normal cursor-pointer">
                  {store2Name}
                </Label>
              </div>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) =>
                setFormData((f) => ({ ...f, isFeatured: !!checked }))
              }
              disabled={isPending}
            />
            <Label htmlFor="isFeatured" className="font-normal cursor-pointer">
              Producto destacado
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
