/**
 * Utility functions for formatting phone numbers for display and API links
 */

/**
 * Format phone number for Spanish display
 * Example: "+34 600 111 111" or "(410) 288-6792"
 */
export function formatSpanishPhoneDisplay(phone: string): string {
  // Return as-is for display - backend provides formatted strings
  return phone;
}

/**
 * Format phone number for WhatsApp API
 * Removes all non-numeric characters except leading +
 */
export function formatWhatsAppApiNumber(phone: string): string {
  // Remove all spaces, parentheses, and dashes
  let cleaned = phone.replace(/[\s\(\)\-]/g, '');
  
  // Ensure it starts with + if it's an international number
  if (!cleaned.startsWith('+') && cleaned.startsWith('34')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+') && !cleaned.startsWith('1')) {
    // For US numbers without country code, add +1
    cleaned = '+1' + cleaned;
  }
  
  return cleaned;
}
