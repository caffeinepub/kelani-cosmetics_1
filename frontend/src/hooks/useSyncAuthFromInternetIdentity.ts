import { useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useAuthStore } from '../stores/authStore';

export function useSyncAuthFromInternetIdentity() {
  const { identity } = useInternetIdentity();
  const setPrincipal = useAuthStore((state) => state.setPrincipal);

  useEffect(() => {
    if (identity) {
      const principal = identity.getPrincipal().toString();
      setPrincipal(principal);
    } else {
      setPrincipal(null);
    }
  }, [identity, setPrincipal]);
}
