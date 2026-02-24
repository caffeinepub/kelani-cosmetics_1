import { useCategoryOptions } from '../../hooks/useCategoryOptions';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable CategorySelect component that fetches categories from backend
 * and displays them in a dropdown without hardcoded options
 */
export function CategorySelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar categoría',
  disabled = false,
  className,
}: CategorySelectProps) {
  const { options, isLoading, isEmpty } = useCategoryOptions();

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Cargando categorías..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (isEmpty) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="No hay categorías disponibles" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Categorías</SelectLabel>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
