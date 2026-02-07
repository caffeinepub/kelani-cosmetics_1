import { Tag } from 'lucide-react';

export default function OnSaleProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Tag className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Productos en Oferta
          </h1>
          <p className="text-muted-foreground">
            Gestión de productos en oferta
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-lg text-muted-foreground">
          Página de gestión de productos en oferta - Próximamente
        </p>
      </div>
    </div>
  );
}
