import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/authStore';
import { useAdminVerification } from './useAdminVerification';

export function useRequireAdminNavigation() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { isVerifying } = useAdminVerification();

  useEffect(() => {
    if (!isVerifying && isAuthenticated && !isAdmin()) {
      navigate({ to: '/admin' });
    }
  }, [isAuthenticated, isAdmin, isVerifying, navigate]);

  return {
    canAccess: isAuthenticated && isAdmin(),
    isVerifying,
  };
}
