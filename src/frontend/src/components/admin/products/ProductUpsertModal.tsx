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
      reportSuccessWithToast('Copied to clipboard');
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
      reportErrorWithToast(new Error(validation.error), validation.error ?? 'Invalid file', {
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
      reportErrorWithToast(error, 'Failed to process image', {
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
      errors.barcode = 'Barcode is required';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    const categoryIdConverted = convertSentinelToNull(formData.categoryId);
    if (!categoryIdConverted) {
      errors.categoryId = 'Category is required';
    }

    if (formData.price.trim()) {
      const priceNum = safeConvertToNumber(formData.price);
      if (priceNum === null || priceNum < 0) {
        errors.price = 'Price must be a valid positive number';
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
      <DialogContent className="max-h-[90vh] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {editingProduct
              ? 'Update the product details below.'
              : 'Fill in the details to create a new product.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">
                Barcode <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="barcode"
                  type="text"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, barcode: e.target.value }))
                  }
                  placeholder="e.g., 1234567890"
                  disabled={!!editingProduct}
                  className={formErrors.barcode ? 'border-destructive' : ''}
                />
                {formData.barcode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => handleCopy(formData.barcode, 'barcode')}
                  >
                    {copiedField === 'barcode' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy barcode</span>
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
                Name <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Lipstick Red"
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formData.name && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => handleCopy(formData.name, 'name')}
                  >
                    {copiedField === 'name' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy name</span>
                  </Button>
                )}
              </div>
              {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <SafeSelect
                value={safeCategoryId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryId: value }))
                }
                sentinelValue={SENTINEL_VALUES.NONE}
                className={formErrors.categoryId ? 'border-destructive' : ''}
              >
                <SelectScrollUpButton />
                <SelectGroup>
                  <SelectLabel>Select a category</SelectLabel>
                  <SelectItem value={SENTINEL_VALUES.NONE}>-- Select category --</SelectItem>
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

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="e.g., 19.99"
                className={formErrors.price ? 'border-destructive' : ''}
              />
              {formErrors.price && <p className="text-sm text-destructive">{formErrors.price}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <div className="flex items-start gap-2">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Product description..."
                  rows={3}
                  className="resize-none"
                />
                {formData.description && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => handleCopy(formData.description, 'description')}
                  >
                    {copiedField === 'description' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy description</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photo">Photo (optional)</Label>
              {photoPreviewUrl ? (
                <div className="flex items-center gap-4">
                  <img
                    src={photoPreviewUrl}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg border object-cover"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                    <label htmlFor="photo">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Replace
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="photo"
                  className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="mt-1 text-sm text-muted-foreground">
                      Click to upload (JPG, PNG, WebP)
                    </p>
                    <p className="text-xs text-muted-foreground">Max 10MB</p>
                  </div>
                </label>
              )}
              <input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* In Stock */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, inStock: checked === true }))
                }
              />
              <Label htmlFor="inStock" className="cursor-pointer">
                In Stock
              </Label>
            </div>

            {/* Featured */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isFeatured: checked === true }))
                }
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Featured Product
              </Label>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
