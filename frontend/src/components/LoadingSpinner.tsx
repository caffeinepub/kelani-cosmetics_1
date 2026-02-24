import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}

export default function LoadingSpinner({
  message = 'Cargando...',
  size = 'md',
  inline = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const containerClasses = inline
    ? 'flex flex-col items-center justify-center py-8'
    : 'flex flex-col items-center justify-center py-24';

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-primary mb-4`}
        aria-hidden="true"
      />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
