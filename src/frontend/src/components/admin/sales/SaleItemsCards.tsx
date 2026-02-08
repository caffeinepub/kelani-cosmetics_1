import { useState } from 'react';
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
import { useProductThumbnail } from './useProductThumbnail';

interface SaleItemsCardsProps {
  saleItems: SaleItem[];
  onEdit: (saleItem: SaleItem) => void;
  onDelete: (saleItem: SaleItem) => void;
  isLoading: boolean;
}

function ProductThumbnail({ barcode }: { barcode: string }) {
  const { imageUrl, isLoading } = useProductThumbnail(barcode);

  if (isLoading) {
    return (
      <div className="h-20 w-20 animate-pulse rounded-md bg-muted" />
    );
  }

  return (
    <img
      src={imageUrl}
      alt=""
      className="h-20 w-20 rounded-md border object-cover"
    />
  );
}

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
        {saleItems.map((item) => {
          const isPending = pendingSaleId === item.saleId;

          return (
            <Card key={item.saleId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <ProductThumbnail barcode={item.barcode} />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
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
                      <div>
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

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Activo:</span>
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => handleToggleActive(item)}
                          disabled={isPending}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(item)}
                          disabled={isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(item)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SaleItemDeactivateDialog
        saleItem={deactivatingItem}
        onOpenChange={(open) => !open && setDeactivatingItem(null)}
        onConfirm={handleConfirmDeactivate}
      />
    </>
  );
}
