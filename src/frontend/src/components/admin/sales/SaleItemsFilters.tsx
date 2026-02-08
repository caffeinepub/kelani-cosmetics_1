import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  SafeSelect,
  SelectGroup,
  SelectItem,
  SENTINEL_VALUES,
} from '../../SafeSelect';
import type { SaleStatus } from '../../../pages/admin/OnSaleProductsPage';

interface SaleItemsFiltersProps {
  statusFilter: SaleStatus;
  onStatusFilterChange: (status: SaleStatus) => void;
  startDateFilter: string;
  onStartDateFilterChange: (date: string) => void;
  endDateFilter: string;
  onEndDateFilterChange: (date: string) => void;
}

export default function SaleItemsFilters({
  statusFilter,
  onStatusFilterChange,
  startDateFilter,
  onStartDateFilterChange,
  endDateFilter,
  onEndDateFilterChange,
}: SaleItemsFiltersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status-filter">Estado</Label>
        <SafeSelect
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as SaleStatus)}
          sentinelValue={SENTINEL_VALUES.ALL}
        >
          <SelectGroup>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="upcoming">Próximos</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
          </SelectGroup>
        </SafeSelect>
      </div>

      {/* Start Date Filter */}
      <div className="space-y-2">
        <Label htmlFor="start-date-filter">Fecha Inicio (desde)</Label>
        <Input
          id="start-date-filter"
          type="date"
          value={startDateFilter}
          onChange={(e) => onStartDateFilterChange(e.target.value)}
        />
      </div>

      {/* End Date Filter */}
      <div className="space-y-2">
        <Label htmlFor="end-date-filter">Fecha Fin (hasta)</Label>
        <Input
          id="end-date-filter"
          type="date"
          value={endDateFilter}
          onChange={(e) => onEndDateFilterChange(e.target.value)}
        />
      </div>
    </div>
  );
}
