import { useMemo } from 'react';
import {
  SafeSelect,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SENTINEL_VALUES,
  convertSentinelToNull,
} from '../../SafeSelect';
import { useGetAllCategories } from '../../../hooks/useQueries';

interface CategoryFilterSelectProps {
  value: string;
  onValueChange: (value: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function CategoryFilterSelect({
  value,
  onValueChange,
  disabled,
  className,
}: CategoryFilterSelectProps) {
  const { data: categories = [], isLoading } = useGetAllCategories();

  const handleChange = (newValue: string) => {
    const converted = convertSentinelToNull(newValue);
    onValueChange(converted);
  };

  const displayValue = useMemo(() => {
    if (value === SENTINEL_VALUES.ALL || !value) {
      return SENTINEL_VALUES.ALL;
    }
    return value;
  }, [value]);

  return (
    <SafeSelect
      value={displayValue}
      onValueChange={handleChange}
      disabled={disabled || isLoading}
      placeholder="All categories"
      className={className}
      sentinelValue={SENTINEL_VALUES.ALL}
    >
      <SelectScrollUpButton />
      <SelectGroup>
        <SelectLabel>Filter by category</SelectLabel>
        <SelectItem value={SENTINEL_VALUES.ALL}>All categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
            {category.name}
          </SelectItem>
        ))}
      </SelectGroup>
      <SelectScrollDownButton />
    </SafeSelect>
  );
}
