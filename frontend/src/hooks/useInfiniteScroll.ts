import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  enabled: boolean;
  threshold?: number;
}

/**
 * Custom hook for implementing infinite scroll with requestAnimationFrame throttling, IntersectionObserver fallback, and cooldown period to prevent duplicate triggers.
 * Monitors window scroll position and triggers load more when within threshold distance from bottom, with proper cleanup on unmount.
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  enabled,
  threshold = 500,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastTriggerRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cooldownPeriod = 1000; // 1 second cooldown between triggers

  // IntersectionObserver setup
  useEffect(() => {
    if (!enabled || !hasMore || isLoading || !sentinelRef.current) {
      return;
    }

    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        const now = Date.now();
        const timeSinceLastTrigger = now - lastTriggerRef.current;

        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoading &&
          timeSinceLastTrigger >= cooldownPeriod
        ) {
          lastTriggerRef.current = now;
          onLoadMore();
        }
      };

      observerRef.current = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0,
      });

      observerRef.current.observe(sentinelRef.current);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    }
  }, [enabled, hasMore, isLoading, onLoadMore, threshold]);

  // Scroll event listener with requestAnimationFrame throttling (fallback)
  useEffect(() => {
    if (!enabled || !hasMore || isLoading) {
      return;
    }

    let ticking = false;

    const checkScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

      // Check if we're within threshold and cooldown period has passed
      const now = Date.now();
      const timeSinceLastTrigger = now - lastTriggerRef.current;

      if (
        distanceToBottom <= threshold &&
        hasMore &&
        !isLoading &&
        timeSinceLastTrigger >= cooldownPeriod
      ) {
        lastTriggerRef.current = now;
        onLoadMore();
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        rafIdRef.current = requestAnimationFrame(checkScroll);
        ticking = true;
      }
    };

    const handleResize = () => {
      if (!ticking) {
        rafIdRef.current = requestAnimationFrame(checkScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial check in case content is already short enough
    checkScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled, hasMore, isLoading, onLoadMore, threshold]);

  return sentinelRef;
}
