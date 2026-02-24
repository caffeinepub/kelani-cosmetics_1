import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { reportErrorWithToast, reportSuccessWithToast } from '../utils/reportErrorWithToast';
import type { AppUser } from '../backend';

// Query Keys
const QUERY_KEYS = {
  userRoles: ['user-roles'] as const,
};

// ============================================================================
// USER MANAGEMENT QUERIES
// ============================================================================

/**
 * Fetch all managed users (excluding caller)
 */
export function useGetAllUserRoles() {
  const actorState = useActor();
  const rawActor = actorState.actor;
  const actorFetching = actorState.isFetching;

  const [stableActor, setStableActor] = React.useState<typeof rawActor>(null);

  // Stabilize actor reference
  React.useEffect(() => {
    if (rawActor && !stableActor) {
      setStableActor(rawActor);
    }
  }, [rawActor, stableActor]);

  return useQuery<AppUser[]>({
    queryKey: QUERY_KEYS.userRoles,
    queryFn: async ({ signal }) => {
      if (!stableActor) throw new Error('Actor not available');
      if (signal?.aborted) throw new Error('Query aborted');

      try {
        return await stableActor.listManagedUsersForAdmin();
      } catch (error) {
        reportErrorWithToast(error, 'No se pudieron cargar los usuarios', {
          operation: 'listManagedUsersForAdmin',
        });
        throw error;
      }
    },
    enabled: Boolean(stableActor) && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ============================================================================
// USER MANAGEMENT MUTATIONS
// ============================================================================

/**
 * Promote user to admin
 */
export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error('Actor not available');

      const { Principal } = await import('@dfinity/principal');
      const principal = Principal.fromText(principalText);
      await actor.promoteToAdminForAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userRoles });
      reportSuccessWithToast('Usuario promovido a administrador exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al promover usuario', {
        operation: 'promoteToAdmin',
      });
    },
  });
}

/**
 * Demote admin to user
 */
export function useDemoteToUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error('Actor not available');

      const { Principal } = await import('@dfinity/principal');
      const principal = Principal.fromText(principalText);
      await actor.demoteToUserForAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userRoles });
      reportSuccessWithToast('Usuario degradado exitosamente');
    },
    onError: (error) => {
      reportErrorWithToast(error, 'Error al degradar usuario', {
        operation: 'demoteToUser',
      });
    },
  });
}
