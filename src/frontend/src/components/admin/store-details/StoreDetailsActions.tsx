import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';

interface StoreDetailsActionsProps {
  onSave: () => void;
  onRestore: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

export default function StoreDetailsActions({
  onSave,
  onRestore,
  isSaving,
  hasChanges,
}: StoreDetailsActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Button
        variant="outline"
        onClick={onRestore}
        disabled={isSaving || !hasChanges}
        className="w-full sm:w-auto"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Restaurar Valores Originales
      </Button>
      <Button
        onClick={onSave}
        disabled={isSaving}
        className="w-full sm:w-auto"
      >
        {isSaving ? (
          <>
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </>
        )}
      </Button>
    </div>
  );
}
