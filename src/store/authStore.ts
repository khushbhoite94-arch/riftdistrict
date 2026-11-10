import { create } from "zustand";

interface User {
  _id?: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  address?: string;
  wishlist?: any[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => {
    set({ user });
  },

  login: (user) => {
    set({ user });
  },

  logout: async () => {
    set({ user: null });

    try {
      await fetch("/api/auth/me", {
        method: "DELETE",
        credentials: "include",
      });
    } finally {
      window.location.href = "/";
    }
  },

  fetchUser: async () => {
    set({ loading: true });

    try {
      let res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.status === 401) {
        const refresh = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (refresh.ok) {
          res = await fetch("/api/auth/me", {
            credentials: "include",
          });
        }
      }

      if (!res.ok) {
        set({ user: null, loading: false });
        return;
      }

      const data = await res.json();
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));