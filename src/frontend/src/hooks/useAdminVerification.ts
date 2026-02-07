import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';
import { reportErrorWithToast } from '../utils/reportErrorWithToast';

export function useAdminVerification() {
  const { actor, isFetching: actorFetching } = useActor();
  const {
    isAuthenticated,
    adminStatus,
    needsAdminRecheck,
    setAdminStatus,
    setAdminCheckTimestamp,
  } = useAuthStore();

  const shouldVerify = isAuthenticated && needsAdminRecheck();

  const query = useQuery({
    queryKey: ['adminVerification'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const isAdmin = await actor.isCallerAdmin();
        return isAdmin;
      } catch (error) {
        reportErrorWithToast(
          error,
          'Failed to verify admin permissions',
          {
            operation: 'adminVerification',
            component: 'useAdminVerification',
          }
        );
        return false;
      }
    },
    enabled: !!actor && !actorFetching && shouldVerify,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data !== undefined && !query.isLoading) {
      const newStatus = query.data ? 'admin' : 'non-admin';
      setAdminStatus(newStatus);
      setAdminCheckTimestamp(Date.now());
    }
  }, [query.data, query.isLoading, setAdminStatus, setAdminCheckTimestamp]);

  const isVerifying =
    (shouldVerify && (actorFetching || query.isLoading)) ||
    (isAuthenticated && adminStatus === 'unknown');

  return {
    isVerifying,
    adminStatus,
  };
}
