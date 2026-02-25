import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllCategories } from '../../../hooks/useQueries';

interface CategoryFilterSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  className?: string;
}

export function CategoryFilterSelect({
  value,
  onChange,
  disabled,
  className,
}: CategoryFilterSelectProps) {
  const { data: categories = [], isLoading } = useGetAllCategories();

  const selectValue = value !== null ? String(value) : 'all';

  const handleChange = (newValue: string) => {
    if (newValue === 'all') {
      onChange(null);
    } else {
      onChange(Number(newValue));
    }
  };

  return (
    <Select
      value={selectValue}
      onValueChange={handleChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className ?? 'w-[200px]'}>
        <SelectValue placeholder="Todas las categorías" />
      </SelectTrigger>
      <SelectContent className="admin-category-select-content">
        <SelectGroup>
          <SelectLabel>Filtrar por categoría</SelectLabel>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((category) => (
            <SelectItem key={String(category.categoryId)} value={String(category.categoryId)}>
              {category.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
