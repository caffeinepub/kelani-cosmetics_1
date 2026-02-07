import { Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useSyncAuthFromInternetIdentity } from '../../hooks/useSyncAuthFromInternetIdentity';
import { useAuthStore } from '../../stores/authStore';
import { useAdminVerification } from '../../hooks/useAdminVerification';
import AdminLoginPanel from '../../components/admin/AdminLoginPanel';
import AccessDenied from '../../components/admin/AccessDenied';
import DashboardLayout from '../../layouts/admin/DashboardLayout';
import AdminVerificationLoading from '../../components/admin/AdminVerificationLoading';

export default function AdminRoute() {
  useSyncAuthFromInternetIdentity();
  const { identity } = useInternetIdentity();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { isVerifying } = useAdminVerification();

  if (!identity || !isAuthenticated) {
    return <AdminLoginPanel />;
  }

  if (isVerifying) {
    return <AdminVerificationLoading />;
  }

  if (!isAdmin()) {
    return <AccessDenied />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
