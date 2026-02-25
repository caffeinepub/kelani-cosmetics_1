import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import type { backendInterface } from '../backend';

export interface UseStableActorResult {
  stableActor: backendInterface | null;
  isActorFetching: boolean;
}

/**
 * Centralizes the stable actor pattern.
 * Stabilizes the raw actor reference so it only updates once when the actor
 * first becomes available, preventing downstream React Query effects from
 * re-running due to actor reference changes.
 */
export function useStableActor(): UseStableActorResult {
  const { actor: rawActor, isFetching: isActorFetching } = useActor();
  const [stableActor, setStableActor] = useState<backendInterface | null>(null);

  useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  return { stableActor, isActorFetching };
}
