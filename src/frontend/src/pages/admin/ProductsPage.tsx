import { Package } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Productos
          </h1>
          <p className="text-muted-foreground">
            Gestión de productos de la tienda
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-lg text-muted-foreground">
          Página de gestión de productos - Próximamente
        </p>
      </div>
    </div>
  );
}
