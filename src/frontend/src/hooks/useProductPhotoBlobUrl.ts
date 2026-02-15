import { useMemo, useEffect, useRef } from 'react';

/**
 * Hook that converts optional binary product photo data into a memoized blob URL
 * and revokes the previous URL during cleanup when the photo changes or component unmounts
 */
export function useProductPhotoBlobUrl(photo: Uint8Array | undefined): string | null {
  const previousUrlRef = useRef<string | null>(null);

  const blobUrl = useMemo(() => {
    // Revoke previous URL if it exists
    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current);
      previousUrlRef.current = null;
    }

    // Return null if no photo
    if (!photo || photo.length === 0) {
      return null;
    }

    // Create new blob URL
    const url = URL.createObjectURL(new Blob([new Uint8Array(photo)], { type: 'image/jpeg' }));
    previousUrlRef.current = url;
    return url;
  }, [photo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
        previousUrlRef.current = null;
      }
    };
  }, []);

  return blobUrl;
}
