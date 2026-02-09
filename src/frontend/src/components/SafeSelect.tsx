/**
 * SafeSelect.tsx
 * 
 * Wrapper component for Select that prevents empty string value errors using sentinel values.
 * Sentinel values: "all" (filter all), "none" (unselected), "no-change" (bulk operations).
 * Supports optional contentClassName prop for styling the dropdown menu container.
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Sentinel values
const SENTINEL_VALUES = {
  ALL: 'all',
  NONE: 'none',
  NO_CHANGE: 'no-change',
} as const;

type SentinelValue = typeof SENTINEL_VALUES[keyof typeof SENTINEL_VALUES];

const EMPTY_STRING_ERROR_MESSAGE = 
  'Error: No se permite valor vacío en Select. Use valores centinela: "all", "none", o "no-change".';

/**
 * Initializes Select component state, converting empty string to sentinel value
 * @param defaultValue - Initial value
 * @param sentinel - Sentinel value to use (default "none")
 * @returns Safe initial state (never empty string)
 */
export function initializeSelectState(
  defaultValue?: string,
  sentinel: string = SENTINEL_VALUES.NONE
): string {
  if (!defaultValue || defaultValue === '') {
    return sentinel;
  }
  return defaultValue;
}

/**
 * Converts sentinel values to null for API calls
 * @param value - Value to convert
 * @returns null for sentinel values, original value otherwise
 */
export function convertSentinelToNull(value: string): string | null {
  if (
    value === SENTINEL_VALUES.ALL ||
    value === SENTINEL_VALUES.NONE ||
    value === SENTINEL_VALUES.NO_CHANGE
  ) {
    return null;
  }
  return value;
}

/**
 * Checks if value is a sentinel
 * @param value - Value to check
 * @returns True if value is a sentinel
 */
export function isSentinelValue(value: string): boolean {
  return (
    value === SENTINEL_VALUES.ALL ||
    value === SENTINEL_VALUES.NONE ||
    value === SENTINEL_VALUES.NO_CHANGE
  );
}

/**
 * Validates that value is not an empty string
 * @param value - Value to validate
 * @throws Error if value is empty string
 */
function validateNonEmptyValue(value: string | undefined): void {
  if (value === '') {
    throw new Error(EMPTY_STRING_ERROR_MESSAGE);
  }
}

export interface SafeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  sentinelValue?: SentinelValue;
  onSentinelChange?: (value: string | null) => void;
  disabled?: boolean;
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
}

/**
 * SafeSelect component that prevents empty string values
 * Wraps the standard Select component with sentinel value enforcement
 */
export function SafeSelect({
  value,
  onValueChange,
  defaultValue,
  sentinelValue = SENTINEL_VALUES.NONE,
  onSentinelChange,
  disabled,
  children,
  placeholder,
  className,
  contentClassName,
}: SafeSelectProps) {
  // Validate that value is not empty string
  React.useEffect(() => {
    if (value !== undefined) {
      validateNonEmptyValue(value);
    }
    if (defaultValue !== undefined) {
      validateNonEmptyValue(defaultValue);
    }
  }, [value, defaultValue]);

  // Initialize state with sentinel if needed
  const safeDefaultValue = React.useMemo(
    () => initializeSelectState(defaultValue, sentinelValue),
    [defaultValue, sentinelValue]
  );

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      // Validate new value
      validateNonEmptyValue(newValue);

      // Call standard onChange
      if (onValueChange) {
        onValueChange(newValue);
      }

      // Call sentinel-aware onChange
      if (onSentinelChange) {
        const convertedValue = convertSentinelToNull(newValue);
        onSentinelChange(convertedValue);
      }
    },
    [onValueChange, onSentinelChange]
  );

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      defaultValue={safeDefaultValue}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {children}
      </SelectContent>
    </Select>
  );
}

// Re-export Select sub-components for convenience
export {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
};

// Export sentinel values for use in components
export { SENTINEL_VALUES };
