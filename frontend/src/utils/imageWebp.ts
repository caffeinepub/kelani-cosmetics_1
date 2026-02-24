/**
 * Image validation and WebP conversion utilities
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please select a JPG, PNG, or WebP image.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}

/**
 * Convert and compress image to WebP format
 * @param file - Original image file
 * @param quality - Compression quality (0-1), default 0.8
 * @returns Promise<Uint8Array> - WebP image bytes
 */
export async function convertToWebP(file: File, quality: number = 0.8): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      // Set canvas dimensions to image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Convert to WebP blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }

          // Convert blob to Uint8Array
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          resolve(uint8Array);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Create a blob URL from Uint8Array for preview
 */
export function createBlobUrl(bytes: Uint8Array, mimeType: string = 'image/webp'): string {
  // Create a new Uint8Array from the input to ensure proper ArrayBuffer type
  const buffer = new Uint8Array(bytes);
  const blob = new Blob([buffer], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Revoke blob URL to free memory
 */
export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}
