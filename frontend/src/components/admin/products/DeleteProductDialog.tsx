import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteProduct, type UIProduct } from '../../../hooks/useProductQueries';

interface DeleteProductDialogProps {
  product: UIProduct | null;
  onClose: () => void;
}

const REQUIRED_PASSWORD = 'DeleteIsUnsafe';

export function DeleteProductDialog({
  product,
  onClose,
}: DeleteProductDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const deleteMutation = useDeleteProduct();

  const handleConfirm = async () => {
    if (!product) return;

    if (password !== REQUIRED_PASSWORD) {
      setError('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
      return;
    }

    try {
      await deleteMutation.mutateAsync({ barcode: product.barcode, password });
      setPassword('');
      setError('');
      onClose();
    } catch {
      // Error handling is done in the mutation
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword('');
      setError('');
      onClose();
    }
  };

  return (
    <AlertDialog open={!!product} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El producto &quot;{product?.name}&quot; será eliminado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="delete-password">
            Introduce la contraseña para confirmar la eliminación:
          </Label>
          <Input
            id="delete-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Contraseña"
            className={error ? 'border-destructive' : ''}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">
            La contraseña distingue entre mayúsculas y minúsculas
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteMutation.isPending || !password}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
