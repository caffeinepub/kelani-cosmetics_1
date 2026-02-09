import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Package, Tag, Star, Percent, Calendar, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExportData, useExportStatistics } from '@/hooks/useAdminExport';
import { reportErrorWithToast, reportSuccessWithToast } from '@/utils/reportErrorWithToast';
import { stringifyWithBigInt } from '@/utils/BigIntSerializer';

export default function ExportPage() {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);
  const { data: stats, isLoading: statsLoading } = useExportStatistics();
  const exportMutation = useExportData();
  const [lastExport, setLastExport] = useState<{
    timestamp: string;
    fileSize: string;
  } | null>(() => {
    const stored = localStorage.getItem('kelani-last-export');
    return stored ? JSON.parse(stored) : null;
  });

  // Clear query cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['export-data'], exact: false });
    };
  }, [queryClient]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = await exportMutation.mutateAsync();

      // Check if there's data to export
      if (exportData.categories.length === 0 && exportData.products.length === 0) {
        reportErrorWithToast(
          new Error('No data to export'),
          'No hay datos para exportar'
        );
        setIsExporting(false);
        return;
      }

      // Build ordered export object (categories first, then products)
      const orderedExport = {
        categories: exportData.categories,
        products: exportData.products,
        exportTimestamp: exportData.exportTimestamp.toString(),
        itemCounts: {
          categories: Number(exportData.itemCounts.categories),
          products: Number(exportData.itemCounts.products),
        },
      };

      // Serialize with BigInt support
      let jsonString: string;
      try {
        jsonString = stringifyWithBigInt(orderedExport);
      } catch (error) {
        reportErrorWithToast(
          error,
          'Error al formatear los datos para exportación'
        );
        setIsExporting(false);
        return;
      }

      // Validate JSON by parsing it
      try {
        JSON.parse(jsonString);
      } catch (error) {
        reportErrorWithToast(
          error,
          'Error al formatear los datos para exportación'
        );
        setIsExporting(false);
        return;
      }

      // Re-stringify with proper formatting (2-space indentation)
      const formattedJson = JSON.stringify(JSON.parse(jsonString), null, 2);

      // Create blob and trigger download
      const blob = new Blob([formattedJson], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      link.download = `kelani-cosmetics-export-${dateStr}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Calculate file size in bytes
      const fileSize = new Blob([formattedJson]).size;
      const fileSizeKB = (fileSize / 1024).toFixed(2);

      // Store last export metadata
      const exportMetadata = {
        timestamp: new Date().toISOString(),
        fileSize: `${fileSizeKB} KB`,
      };
      localStorage.setItem('kelani-last-export', JSON.stringify(exportMetadata));
      setLastExport(exportMetadata);

      // Show success message
      reportSuccessWithToast(
        `Exportación completada. ${orderedExport.itemCounts.categories} categorías y ${orderedExport.itemCounts.products} productos exportados.`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('conexión')) {
        reportErrorWithToast(error, 'Error de conexión al exportar');
      } else {
        reportErrorWithToast(error, 'Error al generar el archivo');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Export Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Datos</CardTitle>
          <CardDescription>
            Descarga todos los datos de la tienda en formato JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.categories ?? 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Productos</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.products ?? 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destacados</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.featured ?? 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Oferta</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.onSale ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Last Export Info */}
          {lastExport && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Última Exportación</p>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(lastExport.timestamp).toLocaleString('es-ES')}
                    </span>
                    <span>{lastExport.fileSize}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || statsLoading}
            className="w-full gap-2"
            size="lg"
          >
            <Download className="h-5 w-5" />
            {isExporting ? 'Exportando...' : 'Exportar Todo'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
