import { useState, useRef, useCallback } from 'react';
import { Upload, CheckCircle2, XCircle, FileJson, AlertCircle, Package, Tag, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { useAdminImport } from '@/hooks/useAdminImport';
import { validateImportData } from '@/utils/importValidation';
import { parseJSONWithBigInt } from '@/utils/BigIntSerializer';
import { reportErrorWithToast, reportSuccessWithToast } from '@/utils/reportErrorWithToast';
import type { ImportData } from '@/backend';

type ImportStatus = 'idle' | 'validating' | 'importing' | 'completed' | 'error';

interface FileInfo {
  name: string;
  categoriesCount: number;
  productsCount: number;
  exportDate: string;
}

interface ImportResultData {
  importedCategoryCount: bigint;
  importedProductCount: bigint;
  errorMessages: string[];
}

export default function ImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [status, setStatus] = useState<ImportStatus>('idle');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResultData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { importData } = useAdminImport();

  const resetState = useCallback(() => {
    // Cancel any in-flight operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setStatus('idle');
    setFileInfo(null);
    setValidationError(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const processFile = useCallback(async (file: File) => {
    // Create new abort controller for this operation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setStatus('validating');
    setValidationError(null);
    setImportResult(null);

    try {
      // Check if operation was cancelled
      if (signal.aborted) return;

      // Read file
      const fileText = await file.text();

      // Check if operation was cancelled
      if (signal.aborted) return;

      // Parse JSON with BigInt support
      let parsedData: any;
      try {
        parsedData = parseJSONWithBigInt(fileText);
      } catch (error) {
        setValidationError('Formato JSON inválido. El archivo no se puede leer.');
        setStatus('error');
        return;
      }

      // Check if operation was cancelled
      if (signal.aborted) return;

      // Validate structure
      const validation = validateImportData(parsedData);
      if (!validation.isValid) {
        setValidationError(validation.errorMessage);
        setStatus('error');
        return;
      }

      // Check if operation was cancelled
      if (signal.aborted) return;

      // Extract file info
      const info: FileInfo = {
        name: file.name,
        categoriesCount: parsedData.categories?.length || 0,
        productsCount: parsedData.products?.length || 0,
        exportDate: parsedData.exportTimestamp
          ? new Date(Number(parsedData.exportTimestamp)).toLocaleString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Desconocida',
      };
      setFileInfo(info);

      // Check if operation was cancelled before starting import
      if (signal.aborted) return;

      // Auto-start import after successful validation
      setStatus('importing');

      // Prepare import data
      const importPayload: ImportData = {
        categories: validation.validatedData.categories,
        products: validation.validatedData.products,
      };

      // Check if operation was cancelled
      if (signal.aborted) return;

      // Call backend import
      const result = await importData(importPayload);

      // Check if operation was cancelled
      if (signal.aborted) return;

      if (result.success) {
        setImportResult({
          importedCategoryCount: result.importedCategoryCount,
          importedProductCount: result.importedProductCount,
          errorMessages: result.errorMessages,
        });
        setStatus('completed');

        reportSuccessWithToast(
          `Importación completada: ${result.importedCategoryCount} categorías y ${result.importedProductCount} productos importados/actualizados.`
        );
      } else {
        setValidationError(
          result.errorMessages.length > 0
            ? result.errorMessages.join(', ')
            : 'Error desconocido durante la importación'
        );
        setStatus('error');
        reportErrorWithToast(
          new Error('Import failed'),
          'Error durante la importación'
        );
      }
    } catch (error: any) {
      // Don't show error if operation was cancelled
      if (signal.aborted) return;

      console.error('Import error:', error);
      setValidationError(
        error.message || 'Error inesperado durante la importación'
      );
      setStatus('error');
      reportErrorWithToast(error, 'Error al procesar el archivo');
    }
  }, [importData]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      reportErrorWithToast(
        new Error('Invalid file type'),
        'Solo se permiten archivos JSON'
      );
      return;
    }

    processFile(file);
  }, [processFile]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        reportErrorWithToast(
          new Error('Invalid file type'),
          'Solo se permiten archivos JSON'
        );
        return;
      }
      handleFileSelect(file);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const isValidFormat = status === 'validating' || status === 'importing' || status === 'completed';
  const isInvalidFormat = status === 'error';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Importar Datos
          </h1>
          <p className="text-muted-foreground">
            Importación de categorías y productos desde archivo JSON
          </p>
        </div>
      </div>

      {/* Import Information Section */}
      {fileInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Archivo</CardTitle>
            <CardDescription>
              Detalles del archivo seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Statistics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileJson className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Archivo seleccionado:</span>
                <span className="text-muted-foreground">{fileInfo.name}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Categorías en archivo:</span>
                <span className="text-muted-foreground">{fileInfo.categoriesCount}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Productos en archivo:</span>
                <span className="text-muted-foreground">{fileInfo.productsCount}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Fecha de exportación:</span>
                <span className="text-muted-foreground">{fileInfo.exportDate}</span>
              </div>
            </div>

            {/* Validation Status */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                {isValidFormat && (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">✓ Formato válido</p>
                      <p className="text-xs text-muted-foreground">
                        Estructura JSON compatible con Kelani Cosmetics
                      </p>
                    </div>
                  </>
                )}
                {isInvalidFormat && (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">✗ Formato inválido</p>
                      <p className="text-xs text-muted-foreground">
                        {validationError || 'Error de validación'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Section */}
      {status !== 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Archivo</CardTitle>
            <CardDescription>
              Arrastra tu archivo JSON aquí o haz clic para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClickUpload}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <FileJson className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium text-foreground">
                {isDragging
                  ? 'Suelta el archivo aquí'
                  : 'Arrastra tu archivo JSON aquí o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-muted-foreground">
                Solo archivos .json
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Status Messages */}
            {status === 'validating' && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-foreground">Validando datos...</p>
              </div>
            )}

            {status === 'importing' && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-foreground">Importando datos...</p>
              </div>
            )}

            {status === 'error' && validationError && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error de validación</p>
                  <p className="mt-1 text-xs text-destructive/80">{validationError}</p>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            {(status === 'validating' || status === 'importing' || status === 'error') && (
              <Button
                onClick={resetState}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancelar importación
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Results Section */}
      {status === 'completed' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Importación Completada</CardTitle>
            <CardDescription>
              Resumen de la importación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Results Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-foreground">
                  ✓ {importResult.importedCategoryCount.toString()} categorías importadas/actualizadas
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-foreground">
                  ✓ {importResult.importedProductCount.toString()} productos importados/actualizados
                </span>
              </div>

              {importResult.errorMessages.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <span className="font-medium text-destructive">
                      ✗ {importResult.errorMessages.length} errores
                    </span>
                    <ul className="mt-1 list-inside list-disc text-xs text-destructive/80">
                      {importResult.errorMessages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Post-import Actions */}
            <div className="space-y-3 pt-4">
              <p className="text-sm font-medium text-foreground">Ver datos importados:</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate({ to: '/admin/categories' })}
                  variant="outline"
                  size="sm"
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Ir a Categorías
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigate({ to: '/admin/products' })}
                  variant="outline"
                  size="sm"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Ir a Productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Clear Results Button */}
            <div className="pt-4">
              <Button
                onClick={resetState}
                variant="default"
                className="w-full sm:w-auto"
              >
                Importar otro archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
