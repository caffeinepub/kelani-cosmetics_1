/**
 * Utility functions for converting between HTML date input strings and backend BigInt timestamps
 * Timestamps are in nanoseconds (Internet Computer standard)
 * 
 * CRITICAL: All date-to-nanosecond conversions use BigInt arithmetic to prevent
 * JavaScript safe integer overflow (Number.MAX_SAFE_INTEGER = 9,007,199,254,740,991)
 */

/**
 * Convert HTML date input string (YYYY-MM-DD) to nanosecond timestamp as BigInt
 * Uses local timezone at start of day
 * @throws Error if date is invalid
 */
export function dateStringToNanosecondsBigInt(dateString: string): bigint {
  if (!dateString || dateString.trim() === '') {
    throw new Error('La fecha es inválida o está vacía');
  }
  
  try {
    const date = new Date(dateString + 'T00:00:00');
    
    // Validate the date is valid
    if (isNaN(date.getTime())) {
      throw new Error(`La fecha "${dateString}" no es válida`);
    }
    
    // Convert to BigInt BEFORE multiplication to avoid unsafe number overflow
    const milliseconds = BigInt(date.getTime());
    const nanoseconds = milliseconds * 1000000n;
    
    return nanoseconds;
  } catch (error) {
    console.error('Date conversion error:', error);
    throw new Error(`Error al convertir la fecha "${dateString}": ${error instanceof Error ? error.message : 'fecha inválida'}`);
  }
}

/**
 * Convert JavaScript Date object to nanosecond timestamp as BigInt
 * @throws Error if date is invalid
 */
export function dateToNanosecondsBigInt(date: Date): bigint {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('La fecha proporcionada no es válida');
  }
  
  try {
    // Convert to BigInt BEFORE multiplication to avoid unsafe number overflow
    const milliseconds = BigInt(date.getTime());
    const nanoseconds = milliseconds * 1000000n;
    
    return nanoseconds;
  } catch (error) {
    console.error('Date conversion error:', error);
    throw new Error(`Error al convertir la fecha: ${error instanceof Error ? error.message : 'fecha inválida'}`);
  }
}

/**
 * Get current timestamp in nanoseconds as BigInt
 */
export function getCurrentTimestampBigInt(): bigint {
  const milliseconds = BigInt(Date.now());
  return milliseconds * 1000000n;
}

/**
 * Convert nanosecond timestamp (BigInt or number) to HTML date input string (YYYY-MM-DD)
 */
export function timestampToDateString(timestamp: bigint | number): string {
  if (!timestamp) return '';
  
  try {
    // Convert nanoseconds to milliseconds
    const milliseconds = typeof timestamp === 'bigint' 
      ? Number(timestamp / 1000000n)
      : timestamp / 1_000_000;
    
    const date = new Date(milliseconds);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return '';
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Timestamp to date string conversion error:', error);
    return '';
  }
}

/**
 * Convert nanosecond timestamp (BigInt or number) to display date string (DD/MM/YYYY)
 */
export function timestampToDisplayDate(timestamp: bigint | number): string {
  if (!timestamp) return '';
  
  try {
    // Convert nanoseconds to milliseconds
    const milliseconds = typeof timestamp === 'bigint'
      ? Number(timestamp / 1000000n)
      : timestamp / 1_000_000;
    
    const date = new Date(milliseconds);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return '';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Timestamp to display date conversion error:', error);
    return '';
  }
}

/**
 * Validate that end date is after start date
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true;
  
  try {
    const startTimestamp = dateStringToNanosecondsBigInt(startDate);
    const endTimestamp = dateStringToNanosecondsBigInt(endDate);
    
    return endTimestamp > startTimestamp;
  } catch (error) {
    console.error('Date range validation error:', error);
    return false;
  }
}

// ============================================================================
// DEPRECATED FUNCTIONS (kept for backward compatibility, but should not be used)
// ============================================================================

/**
 * @deprecated Use dateStringToNanosecondsBigInt instead
 * This function returns unsafe numbers that exceed Number.MAX_SAFE_INTEGER
 */
export function dateStringToTimestamp(dateString: string): number {
  console.warn('dateStringToTimestamp is deprecated and unsafe. Use dateStringToNanosecondsBigInt instead.');
  if (!dateString) return 0;
  
  const date = new Date(dateString + 'T00:00:00');
  return date.getTime() * 1_000_000; // UNSAFE: Can exceed Number.MAX_SAFE_INTEGER
}

/**
 * @deprecated Use getCurrentTimestampBigInt instead
 * This function returns unsafe numbers that exceed Number.MAX_SAFE_INTEGER
 */
export function getCurrentTimestamp(): number {
  console.warn('getCurrentTimestamp is deprecated and unsafe. Use getCurrentTimestampBigInt instead.');
  return Date.now() * 1_000_000; // UNSAFE: Can exceed Number.MAX_SAFE_INTEGER
}
