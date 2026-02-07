import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAuthStore } from '../../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldX, LogOut } from 'lucide-react';
import CopyIconButton from './CopyIconButton';

export default function AccessDenied() {
  const { clear } = useInternetIdentity();
  const { principal, clear: clearAuthStore } = useAuthStore();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    clearAuthStore();
    queryClient.clear();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 px-4">
      <Card className="w-full max-w-2xl border-2 border-destructive/20 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-destructive">
              Acceso Denegado
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              No tienes permisos de administrador para acceder a este panel.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Tu ID de Internet Identity:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-lg border border-border bg-muted px-4 py-3">
                <code className="block overflow-x-auto text-sm font-mono text-foreground">
                  {principal}
                </code>
              </div>
              <CopyIconButton textToCopy={principal || ''} />
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
