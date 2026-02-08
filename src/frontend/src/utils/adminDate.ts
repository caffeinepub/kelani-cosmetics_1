/**
 * Utility functions for converting between HTML date input strings and backend BigInt timestamps
 * Timestamps are in nanoseconds (Internet Computer standard)
 */

/**
 * Convert HTML date input string (YYYY-MM-DD) to nanosecond timestamp
 * Uses local timezone at start of day
 */
export function dateStringToTimestamp(dateString: string): number {
  if (!dateString) return 0;
  
  const date = new Date(dateString + 'T00:00:00');
  return date.getTime() * 1_000_000; // Convert milliseconds to nanoseconds
}

/**
 * Convert nanosecond timestamp to HTML date input string (YYYY-MM-DD)
 */
export function timestampToDateString(timestamp: number): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp / 1_000_000); // Convert nanoseconds to milliseconds
  return date.toISOString().split('T')[0];
}

/**
 * Convert nanosecond timestamp to display date string (DD/MM/YYYY)
 */
export function timestampToDisplayDate(timestamp: number): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp / 1_000_000);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Get current timestamp in nanoseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now() * 1_000_000;
}

/**
 * Validate that end date is after start date
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true;
  
  const startTimestamp = dateStringToTimestamp(startDate);
  const endTimestamp = dateStringToTimestamp(endDate);
  
  return endTimestamp > startTimestamp;
}
