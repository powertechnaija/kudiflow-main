import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  store: {
    id: string;
    name: string;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
}

let logoutTimer: NodeJS.Timeout;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        set({ user, accessToken, isAuthenticated: true });

        // Clear any existing timer
        if (logoutTimer) {
          clearTimeout(logoutTimer);
        }

        // Set a new timer for 50 minutes
        logoutTimer = setTimeout(() => {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }, 50 * 60 * 1000);
      },
      logout: () => {
        // Clear the timer when logging out manually
        if (logoutTimer) {
          clearTimeout(logoutTimer);
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
