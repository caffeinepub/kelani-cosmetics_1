import { useParams } from '@tanstack/react-router';

export default function ProductPage() {
  const { barcode } = useParams({ from: '/public/product/$barcode' });

  return (
    <div className="space-y-8">
      <div className="py-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Producto
        </h1>
        <p className="text-lg text-muted-foreground">
          Detalles del producto con código de barras: {barcode}
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Información del producto próximamente...
        </p>
      </div>
    </div>
  );
}
