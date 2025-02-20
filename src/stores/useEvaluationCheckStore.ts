import { create } from "zustand";

export interface openEvaluation {
  id: string;
}

interface EvaluationState {
  evaluation: openEvaluation | undefined | null;
  setEvaluation: (evaluation: openEvaluation | null) => void;
  clearEvaluation: () => void;
}

export const useEvaluationCheckStore = create<EvaluationState>()((set) => ({
  evaluation: null,
  setEvaluation: (evaluation: openEvaluation | null) => set({ evaluation }),
  clearEvaluation: () => set({ evaluation: null }),
}));
