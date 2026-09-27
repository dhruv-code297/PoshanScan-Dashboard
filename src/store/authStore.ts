import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  name: string | null;
  role: string | null;
  login: (token: string, name: string, role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      name: null,
      role: null,
      login: (token, name, role) => set({ token, name, role }),
      logout: () => set({ token: null, name: null, role: null }),
    }),
    {
      name: 'poshanscan-auth',
    }
  )
);
