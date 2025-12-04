import { create } from "zustand";

interface VariableStore {
  variables: Record<string, string>;
  initializeVariables: (variables: Record<string, string>) => void;
  updateVariable: (key: string, value: string) => void;
  resetVariables: () => void;
}

export const useVariableStore = create<VariableStore>((set) => ({
  variables: {},
  initializeVariables: (variables: Record<string, string>) =>
    set({ variables }),
  updateVariable: (key: string, value: string) =>
    set((state) => ({ variables: { ...state.variables, [key]: value } })),
  resetVariables: () => set({ variables: {} }),
}));
