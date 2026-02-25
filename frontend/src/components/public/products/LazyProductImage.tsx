import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useActor } from '@/hooks/useActor';

// Module-level cache: barcode -> blob URL
const photoCache = new Map<string, string>();
// Track in-progress fetches to prevent duplicate requests
const fetchingSet = new Set<string>();

export function getCachedPhotoUrl(barcode: string): string | undefined {
  return photoCache.get(barcode);
}

export function setCachedPhotoUrl(barcode: string, url: string): void {
  photoCache.set(barcode, url);
}

const DEFAULT_IMAGE = 'https://i.imgur.com/pNccXMT.png';

interface LazyProductImageProps {
  barcode: string;
  className?: string;
  alt?: string;
}

export default function LazyProductImage({ barcode, className, alt }: LazyProductImageProps) {
  const { actor } = useActor();
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayUrl, setDisplayUrl] = useState<string>(() => {
    return photoCache.get(barcode) ?? DEFAULT_IMAGE;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !photoCache.has(barcode);
  });
  const blobUrlRef = useRef<string | null>(null);

  const fetchPhoto = useCallback(async () => {
    if (!actor || !barcode) return;
    if (photoCache.has(barcode)) {
      setDisplayUrl(photoCache.get(barcode)!);
      setIsLoading(false);
      return;
    }
    if (fetchingSet.has(barcode)) return;

    fetchingSet.add(barcode);
    setIsLoading(true);

    try {
      const photoBytes = await actor.getProductPhoto(barcode);
      if (photoBytes && photoBytes.length > 0) {
        const blob = new Blob([new Uint8Array(photoBytes)], { type: 'image/webp' });
        const url = URL.createObjectURL(blob);
        photoCache.set(barcode, url);
        blobUrlRef.current = url;
        setDisplayUrl(url);
      }
    } catch {
      // Silently fall back to default image
    } finally {
      fetchingSet.delete(barcode);
      setIsLoading(false);
    }
  }, [actor, barcode]);

  useEffect(() => {
    // If already cached, no need for intersection observer
    if (photoCache.has(barcode)) {
      setDisplayUrl(photoCache.get(barcode)!);
      setIsLoading(false);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          observer.disconnect();
          fetchPhoto();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [barcode, fetchPhoto]);

  // Cleanup blob URL on unmount only if we created it
  useEffect(() => {
    return () => {
      // Don't revoke cached URLs - they're shared across components
      // Only revoke if this component created a URL that's NOT in the cache
      // (which shouldn't happen, but just in case)
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <img
        src={displayUrl}
        alt={alt ?? 'Producto'}
        className="w-full h-full object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-70" />
        </div>
      )}
    </div>
  );
}
