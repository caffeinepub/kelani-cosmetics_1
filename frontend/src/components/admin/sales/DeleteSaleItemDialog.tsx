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
import { useDeleteSaleItem, type SaleItem } from '../../../hooks/useSaleItemQueries';

interface DeleteSaleItemDialogProps {
  saleItem: SaleItem | null;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteSaleItemDialog({
  saleItem,
  onOpenChange,
}: DeleteSaleItemDialogProps) {
  const deleteMutation = useDeleteSaleItem();

  const handleDelete = async () => {
    if (!saleItem) return;

    try {
      await deleteMutation.mutateAsync(saleItem.saleId);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <AlertDialog open={!!saleItem} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar producto en oferta?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar la oferta para "{saleItem?.name}"? Esta acción no
            se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
