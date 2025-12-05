import { create } from "zustand";

export type VariableSource = "url" | "cookie" | "api" | "otp";

interface VariableMetadata {
  initialized: boolean;
  source: VariableSource | null;
  timestamp: number | null;
}

interface VariableStore {
  variables: Record<string, string>;
  metadata: VariableMetadata;
  initializeVariables: (
    variables: Record<string, string>,
    source?: VariableSource
  ) => void;
  updateVariable: (key: string, value: string) => void;
  mergeVariables: (
    newVariables: Record<string, string>,
    source: VariableSource
  ) => void;
  resetVariables: () => void;
  hasVariable: (key: string) => boolean;
  getVariableKeys: () => string[];
}

const initialMetadata: VariableMetadata = {
  initialized: false,
  source: null,
  timestamp: null,
};

export const useVariableStore = create<VariableStore>((set, get) => ({
  variables: {},
  metadata: initialMetadata,

  initializeVariables: (
    variables: Record<string, string>,
    source: VariableSource = "cookie"
  ) => {
    set({
      variables,
      metadata: {
        initialized: true,
        source,
        timestamp: Date.now(),
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[VariableStore] Initialized ${
          Object.keys(variables).length
        } variables from ${source}:`,
        Object.keys(variables)
      );
    }
  },

  updateVariable: (key: string, value: string) =>
    set((state) => ({
      variables: { ...state.variables, [key]: value },
    })),

  mergeVariables: (
    newVariables: Record<string, string>,
    source: VariableSource
  ) =>
    set((state) => {
      const merged = { ...state.variables, ...newVariables };

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[VariableStore] Merged ${
            Object.keys(newVariables).length
          } variables from ${source}:`,
          Object.keys(newVariables)
        );
      }

      return {
        variables: merged,
        metadata: {
          ...state.metadata,
          source,
          timestamp: Date.now(),
        },
      };
    }),

  resetVariables: () =>
    set({
      variables: {},
      metadata: initialMetadata,
    }),

  hasVariable: (key: string) => key in get().variables,

  getVariableKeys: () => Object.keys(get().variables),
}));
