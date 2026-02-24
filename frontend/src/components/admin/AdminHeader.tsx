import { Menu, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAuthStore } from '../../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function AdminHeader({
  onToggleSidebar,
}: AdminHeaderProps) {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const clearAuthStore = useAuthStore((state) => state.clear);
  const queryClient = useQueryClient();
  const workerRef = useRef<Worker | null>(null);

  // Initialize session keep-alive worker on mount
  useEffect(() => {
    // Check if Web Workers are supported
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers are not supported in this browser. Session keep-alive will not function.');
      return;
    }

    try {
      // Create and start the worker - correct path relative to src directory
      const worker = new Worker(new URL('../../session-worker.js', import.meta.url), {
        type: 'module',
      });

      // Listen for keep-alive messages from worker
      const handleWorkerMessage = (event: MessageEvent) => {
        if (event.data.type === 'keep-alive') {
          // Dispatch synthetic mousemove event to prevent session timeout
          document.dispatchEvent(new Event('mousemove'));
        }
      };

      worker.addEventListener('message', handleWorkerMessage);
      workerRef.current = worker;

      console.log('Session keep-alive worker started');

      // Cleanup on unmount
      return () => {
        if (workerRef.current) {
          workerRef.current.removeEventListener('message', handleWorkerMessage);
          workerRef.current.terminate();
          workerRef.current = null;
          console.log('Session keep-alive worker terminated');
        }
      };
    } catch (error) {
      console.error('Failed to initialize session keep-alive worker:', error);
    }
  }, []);

  const handleLogout = async () => {
    // Terminate worker before logout
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      console.log('Session keep-alive worker terminated on logout');
    }

    await clear();
    clearAuthStore();
    queryClient.clear();
    navigate({ to: '/admin' });
  };

  return (
    <header className="fixed top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <button
            onClick={() => navigate({ to: '/admin' })}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
          >
            <Sparkles className="h-6 w-6 text-primary" />
            Kelani Cosmetics
          </button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
