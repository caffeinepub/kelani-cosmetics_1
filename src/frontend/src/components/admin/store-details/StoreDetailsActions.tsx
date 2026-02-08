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
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="outline"
        onClick={onRestore}
        disabled={!hasChanges || isSaving}
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Restaurar
      </Button>
      <Button
        onClick={onSave}
        disabled={!hasChanges || isSaving}
        className="gap-2"
      >
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Guardar Cambios
          </>
        )}
      </Button>
    </div>
  );
}
