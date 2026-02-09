import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToggleSaleItemActive } from '../../../hooks/useSaleItemQueries';
import type { SaleItem } from '../../../hooks/useSaleItemQueries';
import SaleItemStatusBadge from './SaleItemStatusBadge';
import SaleItemDeactivateDialog from './SaleItemDeactivateDialog';
import { timestampToDisplayDate } from '../../../utils/adminDate';
import { formatPriceForDisplay } from '../../../utils/NumericConverter';

interface SaleItemsTableProps {
  saleItems: SaleItem[];
  onEdit: (saleItem: SaleItem) => void;
  onDelete: (saleItem: SaleItem) => void;
  isLoading: boolean;
}

export default function SaleItemsTable({
  saleItems,
  onEdit,
  onDelete,
  isLoading,
}: SaleItemsTableProps) {
  const toggleMutation = useToggleSaleItemActive();
  const [deactivatingItem, setDeactivatingItem] = useState<SaleItem | null>(null);
  const [pendingSaleId, setPendingSaleId] = useState<number | null>(null);

  const handleToggleActive = async (saleItem: SaleItem) => {
    // If turning off, show confirmation dialog
    if (saleItem.isActive) {
      setDeactivatingItem(saleItem);
      return;
    }

    // If turning on, proceed directly
    setPendingSaleId(saleItem.saleId);
    try {
      await toggleMutation.mutateAsync(saleItem.saleId);
    } finally {
      setPendingSaleId(null);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingItem) return;

    setPendingSaleId(deactivatingItem.saleId);
    try {
      await toggleMutation.mutateAsync(deactivatingItem.saleId);
    } finally {
      setPendingSaleId(null);
      setDeactivatingItem(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Cargando productos en oferta...</p>
      </div>
    );
  }

  if (saleItems.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No se encontraron productos en oferta</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Precio Original</TableHead>
              <TableHead>Precio de Oferta</TableHead>
              <TableHead>Descuento (%)</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {saleItems.map((item) => {
              const isPending = pendingSaleId === item.saleId;
              
              return (
                <TableRow key={item.saleId} className="hover:bg-muted/50">
                  <TableCell>
                    <span className="font-medium">{item.name}</span>
                  </TableCell>
                  <TableCell>
                    {item.price ? formatPriceForDisplay(item.price) : 'N/A'}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatPriceForDisplay(item.salePrice)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      {item.discountPercentage.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell>{timestampToDisplayDate(item.startDate)}</TableCell>
                  <TableCell>{timestampToDisplayDate(item.endDate)}</TableCell>
                  <TableCell>
                    <SaleItemStatusBadge saleItem={item} />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => handleToggleActive(item)}
                      disabled={isPending}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        disabled={isPending}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <SaleItemDeactivateDialog
        saleItem={deactivatingItem}
        onOpenChange={(open) => !open && setDeactivatingItem(null)}
        onConfirm={handleConfirmDeactivate}
      />
    </>
  );
}
