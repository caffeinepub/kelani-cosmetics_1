/**
 * NumericConverter.ts
 * 
 * Safely convert string numbers to actual numbers for validation and API calls.
 * Prevents type conversion errors and ensures proper validation.
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Safely converts any value to number
 * @param value - Value to convert
 * @returns Number or null for invalid inputs
 */
export function safeConvertToNumber(value: any): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return null;
    }

    const num = Number(trimmed);
    if (isNaN(num)) {
      if (isDevelopment) {
        console.warn('[NumericConverter] safeConvertToNumber: No se pudo convertir a número:', value);
      }
      return null;
    }

    return num;
  }

  if (isDevelopment) {
    console.warn('[NumericConverter] safeConvertToNumber: Tipo de entrada inválido:', typeof value);
  }
  return null;
}

/**
 * Validates and converts IVA values
 * @param value - Value to validate
 * @returns Valid IVA number (0, 4, 10, 21) or null
 */
export function validateIvaNumber(value: any): 0 | 4 | 10 | 21 | null {
  const num = safeConvertToNumber(value);
  
  if (num === null) {
    return null;
  }

  // Valid IVA values in Spain
  if (num === 0 || num === 4 || num === 10 || num === 21) {
    return num as 0 | 4 | 10 | 21;
  }

  if (isDevelopment) {
    console.warn('[NumericConverter] validateIvaNumber: Valor de IVA inválido:', value, '(debe ser 0, 4, 10 o 21)');
  }
  return null;
}

/**
 * Validates profit margin (1-100)
 * @param value - Value to validate
 * @returns Number between 1-100 or null
 */
export function validateProfitMargin(value: any): number | null {
  const num = safeConvertToNumber(value);
  
  if (num === null) {
    return null;
  }

  if (num >= 1 && num <= 100) {
    return num;
  }

  if (isDevelopment) {
    console.warn('[NumericConverter] validateProfitMargin: Margen de beneficio fuera de rango:', value, '(debe estar entre 1 y 100)');
  }
  return null;
}

/**
 * Converts stock quantity to inStock boolean
 * @param stockValue - Stock quantity
 * @returns true if stock > 0, false otherwise
 */
export function convertStockToBoolean(stockValue: any): boolean {
  const num = safeConvertToNumber(stockValue);
  
  if (num === null || num <= 0) {
    return false;
  }

  return true;
}

/**
 * Formats price for display with Spanish formatting
 * @param amount - Price amount
 * @returns Formatted price string (€XX,XX)
 */
export function formatPriceForDisplay(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '€0,00';
  }

  // Format with 2 decimal places and comma as decimal separator
  const formatted = amount.toFixed(2).replace('.', ',');
  return `€${formatted}`;
}
