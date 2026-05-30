import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { api } from '../lib/api';
import type { User } from '../types';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

function tokenToUser(token: string): User {
  const payload = jwtDecode<JwtPayload>(token);
  return { id: payload.sub, email: payload.email, name: payload.name };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      register: async (name, email, password) => {
        const { data } = await api.post<{ token: string }>('/auth/register', {
          name,
          email,
          password,
        });
        localStorage.setItem('token', data.token);
        set({ token: data.token, user: tokenToUser(data.token), isAuthenticated: true });
      },

      login: async (email, password) => {
        const { data } = await api.post<{ token: string }>('/auth/login', {
          email,
          password,
        });
        localStorage.setItem('token', data.token);
        set({ token: data.token, user: tokenToUser(data.token), isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
