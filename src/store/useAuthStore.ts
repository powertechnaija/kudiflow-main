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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        // Set the token in localStorage for the authLoader
        localStorage.setItem('token', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {
        // Remove the token from localStorage on logout
        localStorage.removeItem('token');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // The key used to store the entire auth state in localStorage
    }
  )
);
