/**
 * Utility functions for safe conversion between UI number types and Candid bigint types
 * for Category fields (categoryId, order, createdDate, lastUpdatedDate)
 */

/**
 * Convert a UI number to a Candid bigint safely
 * @param value - The number value from UI
 * @returns bigint representation
 */
export function numberToBigInt(value: number): bigint {
  if (!Number.isInteger(value)) {
    throw new Error(`Value must be an integer, got: ${value}`);
  }
  if (value < 0) {
    throw new Error(`Value must be non-negative, got: ${value}`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Value exceeds safe integer range: ${value}`);
  }
  return BigInt(value);
}

/**
 * Convert a Candid bigint to a UI number safely
 * @param value - The bigint value from backend
 * @returns number representation
 */
export function bigIntToNumber(value: bigint): number {
  const num = Number(value);
  if (!Number.isSafeInteger(num)) {
    console.warn(`BigInt value ${value} may lose precision when converted to number`);
  }
  return num;
}

/**
 * Convert an array of [number, number] tuples to [bigint, bigint] tuples
 * Used for reorderCategories API call
 */
export function convertReorderArrayToBigInt(
  arr: Array<[number, number]>
): Array<[bigint, bigint]> {
  return arr.map(([id, order]) => [numberToBigInt(id), numberToBigInt(order)]);
}
