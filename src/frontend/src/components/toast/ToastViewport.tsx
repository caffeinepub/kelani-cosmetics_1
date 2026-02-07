import { useToastStore } from '../../stores/toastStore';
import { ToastCard } from './ToastCard';

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="toast-viewport"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
