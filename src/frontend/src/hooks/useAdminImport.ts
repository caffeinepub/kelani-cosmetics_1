import { useActor } from './useActor';
import type { ImportData, ImportResult } from '@/backend';
import { createApiError } from '@/utils/ApiResponseHandler';

/**
 * Hook for admin import operations
 */
export function useAdminImport() {
  const { actor } = useActor();

  const importData = async (importData: ImportData): Promise<ImportResult> => {
    if (!actor) {
      throw createApiError(
        'Actor no disponible. Por favor, recarga la página.',
        'ACTOR_NOT_AVAILABLE'
      );
    }

    try {
      const result = await actor.batchImportData(importData);
      
      return {
        success: result.success,
        importedCategoryCount: result.importedCategoryCount,
        importedProductCount: result.importedProductCount,
        errorMessages: result.errorMessages,
      };
    } catch (error: any) {
      console.error('Import error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Unauthorized')) {
        throw createApiError(
          'No tienes permisos para importar datos',
          'UNAUTHORIZED',
          error
        );
      }

      if (error.message?.includes('Category not found')) {
        throw createApiError(
          'Error: Referencia a categoría inexistente',
          'INVALID_CATEGORY_REFERENCE',
          error
        );
      }

      // Generic error
      throw createApiError(
        'Error al importar datos. Por favor, verifica el archivo e intenta de nuevo.',
        'IMPORT_FAILED',
        error
      );
    }
  };

  return { importData };
}
