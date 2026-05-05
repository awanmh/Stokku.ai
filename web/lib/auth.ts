import { create } from "zustand";
import Cookies from "js-cookie";
import type { User } from "./api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: Cookies.get("token") || null,
  isAuthenticated: !!Cookies.get("token"),
  setAuth: (user, token) => {
    Cookies.set("token", token, { expires: 1 });
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    Cookies.remove("token");
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user }),
}));
