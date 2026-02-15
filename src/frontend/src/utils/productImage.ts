/**
 * Utility for handling product image rendering with default fallback
 */

export const DEFAULT_PRODUCT_IMAGE_URL = 'https://i.imgur.com/pNccXMT.png';

/**
 * Check if a product has a real photo (not using default)
 * @param photo - Optional Uint8Array photo data from backend
 * @returns true if product has a real photo
 */
export function hasProductPhoto(photo: Uint8Array | undefined): boolean {
  return !!photo && photo.length > 0;
}
