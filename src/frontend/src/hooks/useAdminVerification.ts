import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuthStore, type AdminStatus } from '../stores/authStore';
import { reportErrorWithToast } from '../utils/reportErrorWithToast';

interface AdminVerificationResult {
  isVerifying: boolean;
  adminStatus: AdminStatus;
  isAdmin: boolean;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function useAdminVerification(): AdminVerificationResult {
  const { actor, isFetching: actorFetching } = useActor();
  const authStore = useAuthStore();
  const { principal, adminStatus: cachedAdminStatus, adminCheckTimestamp, setAdminStatus, setAdminCheckTimestamp } = authStore;

  const isCacheValid = 
    (cachedAdminStatus === 'admin' || cachedAdminStatus === 'non-admin') && 
    adminCheckTimestamp !== null && 
    Date.now() - adminCheckTimestamp < THIRTY_DAYS_MS;

  const { data: isAdminFromBackend, isLoading } = useQuery<boolean>({
    queryKey: ['adminVerification', principal],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const result = await actor.isCallerAdmin();
        const status: AdminStatus = result ? 'admin' : 'non-admin';
        setAdminStatus(status);
        setAdminCheckTimestamp(Date.now());
        return result;
      } catch (error) {
        reportErrorWithToast(
          error,
          'Error al verificar permisos de administrador',
          { operation: 'isCallerAdmin', component: 'useAdminVerification' }
        );
        setAdminStatus('non-admin');
        setAdminCheckTimestamp(Date.now());
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!principal && !isCacheValid,
    retry: false,
    staleTime: THIRTY_DAYS_MS,
  });

  const isVerifying = actorFetching || (isLoading && !isCacheValid);
  
  let adminStatus: AdminStatus = 'unknown';
  let isAdmin = false;

  if (isCacheValid) {
    adminStatus = cachedAdminStatus;
    isAdmin = cachedAdminStatus === 'admin';
  } else if (!isVerifying && isAdminFromBackend !== undefined) {
    adminStatus = isAdminFromBackend ? 'admin' : 'non-admin';
    isAdmin = isAdminFromBackend;
  }

  return {
    isVerifying,
    adminStatus,
    isAdmin,
  };
}
