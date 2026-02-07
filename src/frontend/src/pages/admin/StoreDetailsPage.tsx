import { Store } from 'lucide-react';

export default function StoreDetailsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Datos de Tienda
          </h1>
          <p className="text-muted-foreground">
            Configuración de la tienda
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-lg text-muted-foreground">
          Página de configuración de tienda - Próximamente
        </p>
      </div>
    </div>
  );
}
