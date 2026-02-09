import {
  SafeSelect,
  SelectGroup,
  SelectItem,
  SelectLabel,
  initializeSelectState,
} from '../../SafeSelect';

interface SaleItemsFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export default function SaleItemsFilters({
  statusFilter,
  onStatusFilterChange,
}: SaleItemsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <SafeSelect
        value={initializeSelectState(statusFilter, 'all')}
        onValueChange={onStatusFilterChange}
      >
        <SelectGroup>
          <SelectLabel>Estado</SelectLabel>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activos</SelectItem>
        </SelectGroup>
      </SafeSelect>
    </div>
  );
}
