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
 * Format phone number for WhatsApp API (wa.me style)
 * Removes all non-numeric characters except leading +
 * Returns digits-only format suitable for wa.me links
 */
export function formatWhatsAppApiNumber(phone: string): string {
  // Remove all spaces, parentheses, dashes, and other non-numeric characters
  let cleaned = phone.replace(/[\s\(\)\-]/g, '');
  
  // If it starts with +, keep it; otherwise ensure proper country code
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // For numbers starting with country code without +
  if (cleaned.startsWith('34') || cleaned.startsWith('1')) {
    return cleaned;
  }
  
  // For US numbers without country code, add 1
  if (cleaned.length === 10) {
    return '1' + cleaned;
  }
  
  return cleaned;
}
