import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast, useToastStore } from '../../stores/toastStore';

interface ToastCardProps {
  toast: Toast;
}

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: 'toast-success',
  error: 'toast-error',
  warning: 'toast-warning',
  info: 'toast-info',
};

export function ToastCard({ toast }: ToastCardProps) {
  const removeToast = useToastStore((state) => state.removeToast);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration || 2000);

  const Icon = TOAST_ICONS[toast.type];

  const startTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTimeRef.current);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  };

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    pauseTimer();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`toast-card ${TOAST_STYLES[toast.type]} ${isExiting ? 'toast-exit' : 'toast-enter'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      role="alert"
      aria-live={toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <div className="toast-icon-wrapper flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="toast-title font-medium text-sm leading-tight">
            {toast.title}
          </p>
          {toast.description && (
            <p className="toast-description text-xs mt-1 leading-snug opacity-90">
              {toast.description}
            </p>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className="toast-close-button flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
          aria-label="Dismiss notification"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
