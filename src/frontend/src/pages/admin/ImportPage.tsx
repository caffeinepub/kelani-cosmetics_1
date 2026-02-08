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

/**
 * Safely formats a nanosecond timestamp (BigInt) for display
 * @param timestampNs - Nanosecond timestamp as BigInt
 * @returns Formatted date string or "Desconocida" if invalid
 */
function formatNanosecondTimestamp(timestampNs: bigint | number | string | undefined): string {
  try {
    if (timestampNs === undefined || timestampNs === null) {
      return 'Desconocida';
    }

    // Convert to BigInt if needed
    let nsBigInt: bigint;
    if (typeof timestampNs === 'bigint') {
      nsBigInt = timestampNs;
    } else if (typeof timestampNs === 'number') {
      nsBigInt = BigInt(Math.floor(timestampNs));
    } else if (typeof timestampNs === 'string') {
      nsBigInt = BigInt(timestampNs);
    } else {
      return 'Desconocida';
    }

    // Convert nanoseconds to milliseconds
    const msTimestamp = nsBigInt / 1_000_000n;

    // Check if the millisecond value is within safe integer range for Date
    const MAX_SAFE_MS = BigInt(Number.MAX_SAFE_INTEGER);
    if (msTimestamp > MAX_SAFE_MS || msTimestamp < 0n) {
      return 'Desconocida';
    }

    // Safe to convert to number for Date constructor
    const date = new Date(Number(msTimestamp));
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return 'Desconocida';
    }

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Desconocida';
  }
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

      // Extract file info with safe timestamp formatting
      const info: FileInfo = {
        name: file.name,
        categoriesCount: parsedData.categories?.length || 0,
        productsCount: parsedData.products?.length || 0,
        exportDate: formatNanosecondTimestamp(parsedData.exportTimestamp),
      };
      setFileInfo(info);

      // Check if operation was cancelled before starting import
      if (signal.aborted) return;

      // Auto-start import after successful validation
      setStatus('importing');

      // Prepare import data - timestamps are already BigInt from validation
      const importPayload: ImportData = {
        categories: validation.validatedData.categories,
        products: validation.validatedData.products,
      };

      // Check if operation was cancelled
      if (signal.aborted) return;

      // Call backend import - no serialization needed, actor handles BigInt
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
      if (signal.aborted) return;

      console.error('Import error:', error);
      setValidationError(error.message || 'Error desconocido durante la importación');
      setStatus('error');
      reportErrorWithToast(error, 'Error durante la importación');
    }
  }, [importData]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'application/json') {
      processFile(file);
    } else {
      setValidationError('Por favor, selecciona un archivo JSON válido');
      setStatus('error');
    }
  }, [processFile]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Importar Datos</h1>
        <p className="text-muted-foreground">
          Importa categorías y productos desde un archivo JSON exportado previamente
        </p>
      </div>

      {/* Upload Area */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Archivo</CardTitle>
          <CardDescription>
            Arrastra y suelta un archivo JSON o haz clic para seleccionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
              ${status === 'idle' || status === 'error' ? 'cursor-pointer hover:border-primary hover:bg-primary/5' : ''}
            `}
            onClick={status === 'idle' || status === 'error' ? handleUploadClick : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileSelect}
              className="hidden"
              disabled={status === 'validating' || status === 'importing'}
            />

            {status === 'idle' && (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Selecciona un archivo JSON</p>
                <p className="text-sm text-muted-foreground">
                  o arrastra y suelta aquí
                </p>
              </>
            )}

            {status === 'validating' && (
              <>
                <FileJson className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
                <p className="text-lg font-medium mb-2">Validando archivo...</p>
                <p className="text-sm text-muted-foreground">
                  Por favor espera mientras se valida el contenido
                </p>
              </>
            )}

            {status === 'importing' && (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-primary animate-bounce" />
                <p className="text-lg font-medium mb-2">Importando datos...</p>
                <p className="text-sm text-muted-foreground">
                  Esto puede tomar unos momentos
                </p>
              </>
            )}

            {status === 'completed' && (
              <>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium mb-2 text-green-600">
                  ¡Importación completada!
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <p className="text-lg font-medium mb-2 text-destructive">
                  Error en la importación
                </p>
                <p className="text-sm text-muted-foreground">
                  Haz clic para intentar de nuevo
                </p>
              </>
            )}
          </div>

          {status !== 'idle' && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={resetState}
                disabled={status === 'validating' || status === 'importing'}
              >
                Reiniciar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Info */}
      {fileInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Archivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Nombre del archivo</p>
                <p className="text-sm text-muted-foreground">{fileInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Categorías</p>
                <p className="text-sm text-muted-foreground">{fileInfo.categoriesCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Productos</p>
                <p className="text-sm text-muted-foreground">{fileInfo.productsCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fecha de exportación</p>
                <p className="text-sm text-muted-foreground">{fileInfo.exportDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Error */}
      {validationError && status === 'error' && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Error de Validación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{validationError}</p>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && status === 'completed' && (
        <Card className="mb-6 border-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Resultados de la Importación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Categorías Importadas
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {importResult.importedCategoryCount.toString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Productos Importados
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {importResult.importedProductCount.toString()}
                </p>
              </div>
            </div>

            {importResult.errorMessages.length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  Advertencias:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {importResult.errorMessages.map((msg, idx) => (
                    <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-200">
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => navigate({ to: '/admin/categories' })}
                className="flex-1"
              >
                Ver Categorías
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => navigate({ to: '/admin/products' })}
                variant="outline"
                className="flex-1"
              >
                Ver Productos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
