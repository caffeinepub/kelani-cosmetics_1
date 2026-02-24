import { Badge } from '@/components/ui/badge';
import { getSaleStatus, type SaleItem } from '../../../hooks/useSaleItemQueries';

interface SaleItemStatusBadgeProps {
  saleItem: SaleItem;
}

export default function SaleItemStatusBadge({ saleItem }: SaleItemStatusBadgeProps) {
  const status = getSaleStatus(saleItem);

  const statusConfig = {
    active: {
      label: 'Activo',
      variant: 'default' as const,
      className: 'bg-green-600 hover:bg-green-700',
    },
    upcoming: {
      label: 'Próximo',
      variant: 'secondary' as const,
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    expired: {
      label: 'Expirado',
      variant: 'outline' as const,
      className: 'text-muted-foreground',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
