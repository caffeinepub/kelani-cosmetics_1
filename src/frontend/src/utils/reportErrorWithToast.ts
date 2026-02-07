import { toast } from '../stores/toastStore';

interface ErrorContext {
  operation?: string;
  component?: string;
  additionalInfo?: Record<string, unknown>;
}

export function reportErrorWithToast(
  error: unknown,
  userMessage: string,
  context?: ErrorContext
): void {
  // Log detailed error information to console for developers
  console.error('Error occurred:', {
    error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  });

  // Show user-friendly toast notification
  toast.error(userMessage);
}

export function reportWarningWithToast(
  message: string,
  details?: string,
  context?: ErrorContext
): void {
  console.warn('Warning:', {
    message,
    details,
    context,
    timestamp: new Date().toISOString(),
  });

  toast.warning(message, details);
}

export function reportSuccessWithToast(
  message: string,
  details?: string
): void {
  toast.success(message, details);
}

export function reportInfoWithToast(
  message: string,
  details?: string
): void {
  toast.info(message, details);
}
