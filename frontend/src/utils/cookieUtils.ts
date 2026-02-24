/**
 * Cookie consent utilities for localStorage-based GDPR compliance.
 * Manages user consent preferences for analytics and third-party cookies.
 */

const CONSENT_KEY = 'kelani-cookie-consent';

export type ConsentValue = 'accepted' | 'declined';

/**
 * Get the current consent value from localStorage
 */
export function getConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    if (value === 'accepted' || value === 'declined') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set the consent value in localStorage
 */
export function setConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CONSENT_KEY, value);
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: value }));
  } catch (error) {
    console.error('Failed to save consent preference:', error);
  }
}

/**
 * Check if consent has been accepted
 */
export function isConsentAccepted(): boolean {
  return getConsent() === 'accepted';
}

/**
 * Check if consent has been set (either accepted or declined)
 */
export function hasConsentBeenSet(): boolean {
  return getConsent() !== null;
}
