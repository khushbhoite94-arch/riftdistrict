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

    await fetch("/api/auth/me", {
      method: "DELETE",
      credentials: "include",
    });

    window.location.href = "/";
  },

  fetchUser: async () => {
    set({ loading: true });

    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

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