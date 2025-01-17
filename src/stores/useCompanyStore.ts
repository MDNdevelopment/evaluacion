import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Company {
  id: string;
  name: string;
  created_at: string;
  owner_user_id: string;
  logo_url?: string;
}

interface CompanyState {
  company: Company | null;
  setCompany: (company: Company) => void;
  clearCompany: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: null,
      setCompany: (company: Company) => set({ company }),
      clearCompany: () => set({ company: null }),
    }),
    {
      name: "company-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
