import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  createdAt: number;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 2000,
  info: 2000,
  error: 4000,
  warning: 4000,
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = toast.duration ?? DEFAULT_DURATIONS[toast.type];
    
    const newToast: Toast = {
      ...toast,
      id,
      createdAt: Date.now(),
      duration,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Convenience helper functions
export const toast = {
  success: (title: string, description?: string) => {
    return useToastStore.getState().addToast({ type: 'success', title, description });
  },
  error: (title: string, description?: string) => {
    return useToastStore.getState().addToast({ type: 'error', title, description });
  },
  warning: (title: string, description?: string) => {
    return useToastStore.getState().addToast({ type: 'warning', title, description });
  },
  info: (title: string, description?: string) => {
    return useToastStore.getState().addToast({ type: 'info', title, description });
  },
};
