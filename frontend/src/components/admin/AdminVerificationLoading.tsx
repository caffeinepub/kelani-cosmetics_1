import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function AdminVerificationLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-lg font-medium text-foreground">
              Verificando permisos...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
