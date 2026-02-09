import { useParams, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Star, Share2 } from 'lucide-react';
import { useGetProduct } from '../../hooks/useProductQueries';
import { useBothStoreDetails } from '../../hooks/useBothStoreDetails';
import { Button } from '../../components/ui/button';
import CopyToClipboardButton from '../../components/public/product/CopyToClipboardButton';

const DEFAULT_IMAGE_URL = 'https://i.imgur.com/pNccXMT.png';

export default function ProductPage() {
  const { barcode } = useParams({ from: '/public/product/$barcode' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE_URL);
  const [imageError, setImageError] = useState(false);

  // Fetch store details for WhatsApp contact
  const { data: storeDetails } = useBothStoreDetails();

  // Validate and normalize barcode
  const normalizedBarcode = barcode?.trim() || '';
  const isValidBarcode = normalizedBarcode.length > 0;

  // Fetch product data
  const { data: product, isLoading, error, refetch } = useGetProduct(
    normalizedBarcode
  );

  // Handle product image
  useEffect(() => {
    if (!product || !product.photo || product.photo.length === 0) {
      setImageSrc(DEFAULT_IMAGE_URL);
      setImageError(false);
      return;
    }

    try {
      const blob = new Blob([new Uint8Array(product.photo)], { type: 'image/jpeg' });
      const blobUrl = URL.createObjectURL(blob);
      setImageSrc(blobUrl);
      setImageError(false);

      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    } catch (err) {
      console.error('Error creating blob URL:', err);
      setImageSrc(DEFAULT_IMAGE_URL);
      setImageError(true);
    }
  }, [product?.photo]);

  // Update document title and meta description
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - Kelani Cosmetics`;

      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }

      const description = product.description
        ? product.description.replace(/<[^>]*>/g, '').substring(0, 160)
        : `${product.name} - Disponible en Kelani Cosmetics`;

      metaDescription.setAttribute('content', description);
    }

    return () => {
      document.title = 'Kelani Cosmetics';
    };
  }, [product]);

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['product'], exact: false });
    };
  }, [queryClient]);

  // Format price in Spanish EUR format
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    if (!product || !storeDetails || storeDetails.length === 0) return;

    // Use first store's WhatsApp number
    const whatsappNumber = storeDetails[0].whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola, estoy interesado en el producto:\n${product.name}\nCódigo de barras: ${product.barcode}`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  // Handle share URL
  const handleShareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  // Handle image error
  const handleImageError = () => {
    if (!imageError) {
      setImageSrc(DEFAULT_IMAGE_URL);
      setImageError(true);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando producto...</p>
      </div>
    );
  }

  // Invalid barcode
  if (!isValidBarcode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-lg text-muted-foreground">Producto no encontrado</p>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-lg text-destructive">Error al cargar el producto</p>
        <div className="flex gap-3">
          <Button onClick={() => refetch()} variant="outline">
            Reintentar
          </Button>
          <Button onClick={() => navigate({ to: '/' })} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-lg text-muted-foreground">Producto no encontrado</p>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link */}
      <div>
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </button>
      </div>

      {/* Product Details Container */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Image Section - Left Column (60% on desktop) */}
        <div className="md:col-span-3">
          <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={imageSrc}
              alt={product.name}
              onError={handleImageError}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Information Section - Right Column (40% on desktop) */}
        <div className="md:col-span-2 space-y-6">
          {/* Product Header */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>

            {/* Stock Status Badge */}
            <div>
              {product.inStock ? (
                <span className="inline-block px-4 py-2 text-sm font-bold bg-green-500 text-white rounded-lg">
                  EN STOCK
                </span>
              ) : (
                <span className="inline-block px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-lg">
                  SIN STOCK
                </span>
              )}
            </div>
          </div>

          {/* Price Display */}
          {product.price !== undefined && product.price !== null && (
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</div>
            </div>
          )}

          {/* Featured Indicator */}
          {product.isFeatured && (
            <div className="flex items-center gap-2 text-yellow-600">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-semibold">Producto Destacado</span>
            </div>
          )}

          {/* Barcode Display */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Código de barras</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                {product.barcode}
              </code>
              <CopyToClipboardButton textToCopy={product.barcode} />
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Descripción</p>
              <div
                className="text-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleWhatsAppContact}
              className="w-full"
              size="lg"
              disabled={!storeDetails || storeDetails.length === 0}
            >
              Contactar sobre este producto
            </Button>

            <Button onClick={handleShareUrl} variant="outline" className="w-full" size="lg">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir enlace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
