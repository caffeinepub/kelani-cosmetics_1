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
import { useDeleteProduct, type Product } from '../../../hooks/useProductQueries';

interface DeleteProductDialogProps {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}

const REQUIRED_PASSWORD = 'DeleteIsUnsafe';

export default function DeleteProductDialog({
  product,
  onOpenChange,
}: DeleteProductDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const deleteMutation = useDeleteProduct();

  const handleConfirm = async () => {
    if (!product) return;

    if (password !== REQUIRED_PASSWORD) {
      setError('Incorrect password. Please try again.');
      return;
    }

    try {
      await deleteMutation.mutateAsync({ barcode: product.barcode, password });
      onOpenChange(false);
      setPassword('');
      setError('');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword('');
      setError('');
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={!!product} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The product "{product?.name}" will be permanently
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="delete-password">
            Enter password to confirm deletion:
          </Label>
          <Input
            id="delete-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter password"
            className={error ? 'border-destructive' : ''}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">
            Password is case-sensitive
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteMutation.isPending || !password}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
