import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Sparkles, LogIn } from 'lucide-react';

export default function AdminLoginPanel() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Kelani Cosmetics
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Panel de Administración
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Inicia sesión con tu Internet Identity para acceder al panel de
              administración
            </p>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar Sesión
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
