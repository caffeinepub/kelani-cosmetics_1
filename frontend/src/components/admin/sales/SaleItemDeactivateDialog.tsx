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
import type { SaleItem } from '../../../hooks/useSaleItemQueries';

interface SaleItemDeactivateDialogProps {
  saleItem: SaleItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function SaleItemDeactivateDialog({
  saleItem,
  onOpenChange,
  onConfirm,
}: SaleItemDeactivateDialogProps) {
  return (
    <AlertDialog open={!!saleItem} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desactivar producto en oferta?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas desactivar la oferta para "{saleItem?.name}"? Esta acción
            puede revertirse más tarde.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Desactivar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
