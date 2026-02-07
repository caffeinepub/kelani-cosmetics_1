/**
 * BigIntSerializer.ts
 * 
 * Safely handle BigInt serialization/deserialization across the entire application.
 * Prevents JSON.stringify errors with BigInt values and ensures proper type conversion.
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Safely converts BigInt or numbers to string for JSON serialization
 * @param value - BigInt, number, or string to convert
 * @returns String representation or empty string for invalid inputs
 */
export function safeBigIntToString(value: bigint | number | string): string {
  try {
    if (value === null || value === undefined) {
      if (isDevelopment) {
        console.warn('[BigIntSerializer] safeBigIntToString: Received null or undefined');
      }
      return '';
    }

    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'string') {
      return value;
    }

    if (isDevelopment) {
      console.warn('[BigIntSerializer] safeBigIntToString: Invalid input type', typeof value);
    }
    return '';
  } catch (error) {
    if (isDevelopment) {
      console.warn('[BigIntSerializer] safeBigIntToString: Conversion error', error);
    }
    return '';
  }
}

/**
 * Safely converts string to BigInt for parsing JSON responses
 * @param value - String to convert to BigInt
 * @returns BigInt or null on error
 */
export function safeStringToBigInt(value: string): bigint | null {
  try {
    if (!value || typeof value !== 'string') {
      if (isDevelopment) {
        console.warn('[BigIntSerializer] safeStringToBigInt: Invalid or empty input');
      }
      return null;
    }

    const trimmed = value.trim();
    if (trimmed === '') {
      if (isDevelopment) {
        console.warn('[BigIntSerializer] safeStringToBigInt: Empty string after trim');
      }
      return null;
    }

    // Check if string is a valid integer (including negative)
    if (!/^-?\d+$/.test(trimmed)) {
      if (isDevelopment) {
        console.warn('[BigIntSerializer] safeStringToBigInt: Not a valid integer string', value);
      }
      return null;
    }

    return BigInt(trimmed);
  } catch (error) {
    if (isDevelopment) {
      console.warn('[BigIntSerializer] safeStringToBigInt: Conversion error', error);
    }
    return null;
  }
}

/**
 * Validates if string can be safely converted to BigInt
 * @param value - String to validate
 * @returns True if valid BigInt string
 */
export function isValidBigIntString(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    return false;
  }

  // Check if string is a valid integer (including negative)
  return /^-?\d+$/.test(trimmed);
}

/**
 * Custom JSON parser that handles BigInt strings in specific fields
 * Fields processed as BigInt: createdDate, lastUpdatedDate, timestamp, any field ending with "Date" or "Timestamp"
 * @param jsonString - JSON string to parse
 * @returns Parsed object with BigInt fields converted
 */
export function parseJSONWithBigInt(jsonString: string): any {
  try {
    return JSON.parse(jsonString, (key, value) => {
      // Check if this is a field that should be converted to BigInt
      const shouldConvertToBigInt = 
        key === 'createdDate' ||
        key === 'lastUpdatedDate' ||
        key === 'timestamp' ||
        key.endsWith('Date') ||
        key.endsWith('Timestamp');

      if (shouldConvertToBigInt && typeof value === 'string' && isValidBigIntString(value)) {
        const bigIntValue = safeStringToBigInt(value);
        // Convert to number if it fits in safe integer range, otherwise keep as BigInt
        if (bigIntValue !== null) {
          try {
            const numValue = Number(bigIntValue);
            if (Number.isSafeInteger(numValue)) {
              return numValue;
            }
            return bigIntValue;
          } catch {
            return bigIntValue;
          }
        }
      }

      return value;
    });
  } catch (error) {
    if (isDevelopment) {
      console.warn('[BigIntSerializer] parseJSONWithBigInt: Parse error, falling back to standard JSON.parse', error);
    }
    // Fallback to standard JSON.parse
    return JSON.parse(jsonString);
  }
}

/**
 * Custom JSON stringifier that converts BigInt to strings
 * Fields processed: Any BigInt value or field names containing "date", "timestamp", "id"
 * @param data - Data to stringify
 * @returns JSON string with BigInt values converted to strings
 */
export function stringifyWithBigInt(data: any): string {
  try {
    return JSON.stringify(data, (key, value) => {
      // Convert BigInt values to strings
      if (typeof value === 'bigint') {
        return value.toString();
      }

      // Convert values for keys containing date, timestamp, or id (case-insensitive)
      const keyLower = key.toLowerCase();
      if (
        (keyLower.includes('date') || 
         keyLower.includes('timestamp') || 
         keyLower.includes('id')) &&
        (typeof value === 'bigint' || typeof value === 'number')
      ) {
        return value.toString();
      }

      return value;
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('[BigIntSerializer] stringifyWithBigInt: Stringify error', error);
    }
    throw error;
  }
}
