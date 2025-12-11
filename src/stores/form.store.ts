import { create } from "zustand";

import { IForm } from "@/common/interfaces/form.interfaces";
import { FormValue } from "@/common/types/common.types";
import {
  buildFieldDependencyMap,
  FieldVariableDeps,
} from "@/services/form-dependency.service";
import { parseFormToFormData } from "@/services/parsing.service";
import { replaceVariablesInText } from "@/services/variable-replacement.service";
import { useVariableStore } from "@/stores/variable.store";

interface FormStore {
  form: IForm | undefined;
  rawValues: Record<string, FormValue>;
  fieldVariableDeps: FieldVariableDeps;
  isSubmitting: boolean;
  submissionError: string | null;
  submissionSuccess: boolean;
  submissionData: Record<string, unknown> | null;
  initializeForm: (form: IForm) => void;
  updateValue: (key: string, value: FormValue) => void;
  getRawValue: (key: string) => FormValue;
  getComputedValue: (key: string) => FormValue;
  getComputedValues: () => Record<string, FormValue>;
  resetForm: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmissionError: (error: string | null) => void;
  setSubmissionSuccess: (
    success: boolean,
    data?: Record<string, unknown>
  ) => void;
  resetSubmissionState: () => void;
}

function computeValue(
  value: FormValue,
  variables: Record<string, string>
): FormValue {
  if (typeof value !== "string") {
    return value;
  }
  return replaceVariablesInText(value, variables, {
    keepUnresolved: false,
    warnOnMissing: false,
  });
}

const useFormStore = create<FormStore>((set, get) => ({
  form: undefined,
  rawValues: {},
  fieldVariableDeps: {},
  isSubmitting: false,
  submissionError: null,
  submissionSuccess: false,
  submissionData: null,

  initializeForm: (form: IForm) => {
    const rawValues = parseFormToFormData(form);
    const fieldVariableDeps = buildFieldDependencyMap(form);
    set({ form, rawValues, fieldVariableDeps });
  },

  updateValue: (key: string, value: FormValue) =>
    set((state) => ({ rawValues: { ...state.rawValues, [key]: value } })),

  getRawValue: (key: string) => get().rawValues[key],

  getComputedValue: (key: string) => {
    const rawValue = get().rawValues[key];
    const variables = useVariableStore.getState().variables;
    return computeValue(rawValue, variables);
  },

  getComputedValues: () => {
    const { rawValues } = get();
    const variables = useVariableStore.getState().variables;

    return Object.entries(rawValues).reduce(
      (acc, [key, value]) => {
        acc[key] = computeValue(value, variables);
        return acc;
      },
      {} as Record<string, FormValue>
    );
  },

  resetForm: () => {
    const form = get().form;
    if (form) {
      const rawValues = parseFormToFormData(form);
      set({ rawValues });
    }
  },

  setSubmitting: (isSubmitting: boolean) =>
    set({ isSubmitting, submissionError: null }),

  setSubmissionError: (error: string | null) =>
    set({
      submissionError: error,
      isSubmitting: false,
      submissionSuccess: false,
    }),

  setSubmissionSuccess: (success: boolean, data?: Record<string, unknown>) =>
    set({
      submissionSuccess: success,
      submissionData: data || null,
      isSubmitting: false,
      submissionError: null,
    }),

  resetSubmissionState: () =>
    set({
      isSubmitting: false,
      submissionError: null,
      submissionSuccess: false,
      submissionData: null,
    }),
}));

export default useFormStore;
