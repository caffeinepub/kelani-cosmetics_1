import { Download } from 'lucide-react';

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Exportar
          </h1>
          <p className="text-muted-foreground">
            Exportación de datos de la tienda
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-lg text-muted-foreground">
          Página de exportación de datos - Próximamente
        </p>
      </div>
    </div>
  );
}
