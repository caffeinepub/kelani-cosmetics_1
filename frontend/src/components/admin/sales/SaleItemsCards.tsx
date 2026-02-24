import { useState, memo } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useToggleSaleItemActive } from '../../../hooks/useSaleItemQueries';
import type { SaleItem } from '../../../hooks/useSaleItemQueries';
import SaleItemStatusBadge from './SaleItemStatusBadge';
import SaleItemDeactivateDialog from './SaleItemDeactivateDialog';
import { timestampToDisplayDate } from '../../../utils/adminDate';
import { formatPriceForDisplay } from '../../../utils/NumericConverter';

interface SaleItemsCardsProps {
  saleItems: SaleItem[];
  onEdit: (saleItem: SaleItem) => void;
  onDelete: (saleItem: SaleItem) => void;
  isLoading: boolean;
}

const SaleItemCard = memo(({
  item,
  isPending,
  onToggleActive,
  onEdit,
  onDelete
}: {
  item: SaleItem;
  isPending: boolean;
  onToggleActive: (item: SaleItem) => void;
  onEdit: (item: SaleItem) => void;
  onDelete: (item: SaleItem) => void;
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="break-words text-base font-semibold leading-tight">{item.name}</h3>
            <SaleItemStatusBadge saleItem={item} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Original:</span>{' '}
              <span className="line-through">
                {item.price ? formatPriceForDisplay(item.price) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Oferta:</span>{' '}
              <span className="font-semibold text-primary">
                {formatPriceForDisplay(item.salePrice)}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Descuento:</span>{' '}
              <span className="font-medium text-green-600">
                {item.discountPercentage.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <div>Inicio: {timestampToDisplayDate(item.startDate)}</div>
            <div>Fin: {timestampToDisplayDate(item.endDate)}</div>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Activo:</span>
              <Switch
                checked={item.isActive}
                onCheckedChange={() => onToggleActive(item)}
                disabled={isPending}
                className="min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
              disabled={isPending}
              className="min-h-[44px] w-full sm:flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item)}
              disabled={isPending}
              className="min-h-[44px] w-full text-destructive hover:text-destructive sm:flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SaleItemCard.displayName = 'SaleItemCard';

export default function SaleItemsCards({
  saleItems,
  onEdit,
  onDelete,
  isLoading,
}: SaleItemsCardsProps) {
  const toggleMutation = useToggleSaleItemActive();
  const [deactivatingItem, setDeactivatingItem] = useState<SaleItem | null>(null);
  const [pendingSaleId, setPendingSaleId] = useState<number | null>(null);

  const handleToggleActive = async (saleItem: SaleItem) => {
    if (saleItem.isActive) {
      setDeactivatingItem(saleItem);
      return;
    }

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
      <div className="space-y-4">
        {saleItems.map((item) => (
          <SaleItemCard
            key={item.saleId}
            item={item}
            isPending={pendingSaleId === item.saleId}
            onToggleActive={handleToggleActive}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <SaleItemDeactivateDialog
        saleItem={deactivatingItem}
        onOpenChange={(open) => !open && setDeactivatingItem(null)}
        onConfirm={handleConfirmDeactivate}
      />
    </>
  );
}
