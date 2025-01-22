import { create } from "zustand";

export interface Session {
  access_token: string;
}

interface SessionState {
  session: Session | undefined | null;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  session: undefined,
  setSession: (session: Session | null) => set({ session }),
  clearSession: () => set({ session: undefined }),
}));
