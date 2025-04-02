import { create } from "zustand";

export interface User {
  id: string;
  full_name: string;
  email: string;
  department_name: string;
  department_id: number;
  avatar_url?: string;
  position_id: string;
  position_name: string;
  access_level: number;
  company_id: string;
  role: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  clearUser: () => set({ user: null }),
}));
