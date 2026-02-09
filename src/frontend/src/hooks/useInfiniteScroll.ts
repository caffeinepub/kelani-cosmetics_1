import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  enabled: boolean;
  threshold?: number;
}

/**
 * Custom hook for implementing infinite scroll with requestAnimationFrame throttling
 * Monitors window scroll position and triggers load more when near bottom
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
  const cooldownPeriod = 1000; // 1 second cooldown between triggers

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
