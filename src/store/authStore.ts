'use client';

import { create } from 'zustand';

interface User {
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'microsoft' | 'demo';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (provider: 'google' | 'microsoft' | 'demo') => void;
  signOut: () => void;
}

const DEMO_USERS: Record<string, User> = {
  google: {
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    avatar: 'AJ',
    provider: 'google',
  },
  microsoft: {
    name: 'Alex Johnson',
    email: 'alex.johnson@outlook.com',
    avatar: 'AJ',
    provider: 'microsoft',
  },
  demo: {
    name: 'Demo User',
    email: 'demo@powerbi-theme.app',
    avatar: 'DU',
    provider: 'demo',
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  signIn: (provider) => {
    const user = DEMO_USERS[provider] || DEMO_USERS.demo;
    set({ user, isAuthenticated: true });
  },

  signOut: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
