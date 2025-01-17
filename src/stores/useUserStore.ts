import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  full_name: string;
  email: string;
  department: string;
  department_id: number;
  avatar_url?: string;
  position: string;
  access_level: number;
  company_id: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
