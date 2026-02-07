import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminStatus = 'unknown' | 'loading' | 'admin' | 'non-admin';

interface AuthState {
  principal: string | null;
  isAuthenticated: boolean;
  adminStatus: AdminStatus;
  adminCheckTimestamp: number | null;
  setPrincipal: (principal: string | null) => void;
  setAdminStatus: (status: AdminStatus) => void;
  setAdminCheckTimestamp: (timestamp: number) => void;
  needsAdminRecheck: () => boolean;
  clear: () => void;
  isAdmin: () => boolean;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      principal: null,
      isAuthenticated: false,
      adminStatus: 'unknown',
      adminCheckTimestamp: null,

      setPrincipal: (principal) =>
        set({
          principal,
          isAuthenticated: !!principal,
        }),

      setAdminStatus: (status) => set({ adminStatus: status }),

      setAdminCheckTimestamp: (timestamp) =>
        set({ adminCheckTimestamp: timestamp }),

      needsAdminRecheck: () => {
        const state = get();
        if (!state.isAuthenticated) return false;
        if (state.adminStatus === 'unknown') return true;
        if (!state.adminCheckTimestamp) return true;
        const now = Date.now();
        return now - state.adminCheckTimestamp > THIRTY_DAYS_MS;
      },

      isAdmin: () => {
        const state = get();
        return state.adminStatus === 'admin';
      },

      clear: () =>
        set({
          principal: null,
          isAuthenticated: false,
          adminStatus: 'unknown',
          adminCheckTimestamp: null,
        }),
    }),
    {
      name: 'kelani-auth-storage',
      partialize: (state) => ({
        principal: state.principal,
        isAuthenticated: state.isAuthenticated,
        adminStatus: state.adminStatus,
        adminCheckTimestamp: state.adminCheckTimestamp,
      }),
    }
  )
);
