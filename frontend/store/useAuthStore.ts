import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = { name: string; email: string };

type AuthStore = {
  user: User | null;
  token: string | null;
  signIn: (data: { user: User; token: string }) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      signIn: ({ user, token }) => set({ user, token }),
      signOut: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
