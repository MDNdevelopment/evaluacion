import { create } from "zustand";

export interface User {
  id: string;
  full_name: string;
  email: string;
  department_name: string;
  department_id: number;
  avatar_url?: string;
  position_id: number;
  position_name: string;
  access_level: number;
  company_id: string;
  admin: boolean;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  setNewAvatar: (avatarUrl: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  clearUser: () => set({ user: null }),
  setNewAvatar: (avatarUrl: string) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatar_url: avatarUrl } : null,
    })),
}));
