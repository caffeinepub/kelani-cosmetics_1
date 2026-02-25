import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useStableActor } from './useStableActor';
import type { backendInterface } from '../backend';

type SelectorFn<T> = (actor: backendInterface) => Promise<T>;

type StableActorQueryOptions<T> = Omit<
  UseQueryOptions<T, Error, T, readonly unknown[]>,
  'queryKey' | 'queryFn' | 'enabled'
> & {
  /** Additional enabled condition on top of actor availability check */
  enabled?: boolean;
};

/**
 * Generic wrapper around React Query's useQuery with stable actor integration.
 * - Only enables the query when the stable actor is available (and optional extra condition).
 * - Merges actor initialization state with query loading state so that
 *   `isLoading` is true during both actor initialization and query fetching.
 * - TypeScript generics infer the return data type from the selector function.
 * - Returns the full React Query result object with enhanced isLoading and isFetched.
 */
export function useStableActorQuery<T>(
  selector: SelectorFn<T>,
  queryKey: readonly unknown[],
  options?: StableActorQueryOptions<T>
) {
  const { stableActor, isActorFetching } = useStableActor();

  // Combine actor availability with any extra enabled condition from options
  const extraEnabled = options?.enabled !== undefined ? options.enabled : true;
  const isEnabled = !!stableActor && extraEnabled;

  const { enabled: _omitted, ...restOptions } = options ?? {};

  const query = useQuery<T, Error, T, readonly unknown[]>({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');
      return selector(stableActor);
    },
    enabled: isEnabled,
    ...(restOptions as Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, 'queryKey' | 'queryFn' | 'enabled'>),
  });

  return {
    ...query,
    isLoading: isActorFetching || query.isLoading,
    isFetched: !!stableActor && query.isFetched,
  };
}
