import { create } from "zustand";

import { IForm } from "@/common/interfaces/form.interfaces";
import { FormValue } from "@/common/types/common.types";
import {
  buildFieldDependencyMap,
  FieldVariableDeps,
} from "@/services/form-dependency.service";
import { validateField } from "@/services/form-validation.service";
import { parseFormToFormData } from "@/services/parsing.service";
import { replaceVariablesInText } from "@/services/variable-replacement.service";
import { useVariableStore } from "@/stores/variable.store";

interface FormStore {
  form: IForm | undefined;
  rawValues: Record<string, FormValue>;
  fieldVariableDeps: FieldVariableDeps;
  isSubmitting: boolean;
  submissionError: string | null;
  submissionErrorReason: string | null;
  submissionSuccess: boolean;
  submissionData: Record<string, unknown> | null;
  fieldErrors: Record<string, string>;
  initializeForm: (form: IForm) => void;
  updateValue: (key: string, value: FormValue) => void;
  getRawValue: (key: string) => FormValue;
  getComputedValue: (key: string) => FormValue;
  getComputedValues: () => Record<string, FormValue>;
  resetForm: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmissionError: (
    error: string | null,
    errorReason?: string | null
  ) => void;
  setSubmissionSuccess: (
    success: boolean,
    data?: Record<string, unknown>
  ) => void;
  resetSubmissionState: () => void;
  setFieldErrors: (errors: Record<string, string>) => void;
  clearFieldErrors: () => void;
  clearFieldError: (fieldKey: string) => void;
  getFieldError: (fieldKey: string) => string | undefined;
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
  submissionErrorReason: null,
  submissionSuccess: false,
  submissionData: null,
  fieldErrors: {},

  initializeForm: (form: IForm) => {
    const rawValues = parseFormToFormData(form);
    const fieldVariableDeps = buildFieldDependencyMap(form);
    set({ form, rawValues, fieldVariableDeps });
  },

  updateValue: (key: string, value: FormValue) => {
    const state = get();
    const newRawValues = { ...state.rawValues, [key]: value };

    // If this field has an error, validate it and clear if valid
    if (state.fieldErrors[key] && state.form) {
      const field = state.form.fields[key];
      if (field) {
        // Compute the value for validation (with variable replacement)
        const variables = useVariableStore.getState().variables;
        const computedValue = computeValue(value, variables);
        const fieldLabel = field.label || key;

        // Validate the field
        const validationError = validateField(
          field,
          key,
          computedValue,
          fieldLabel
        );

        // If validation passes (no error), clear the error for this field
        if (!validationError) {
          const newFieldErrors = { ...state.fieldErrors };
          delete newFieldErrors[key];
          set({ rawValues: newRawValues, fieldErrors: newFieldErrors });
          return;
        }
      }
    }

    set({ rawValues: newRawValues });
  },

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
    set({ isSubmitting, submissionError: null, fieldErrors: {} }),

  setSubmissionError: (error: string | null, errorReason?: string | null) =>
    set({
      submissionError: error,
      submissionErrorReason: errorReason || null,
      isSubmitting: false,
      submissionSuccess: false,
    }),

  setSubmissionSuccess: (success: boolean, data?: Record<string, unknown>) =>
    set({
      submissionSuccess: success,
      submissionData: data || null,
      isSubmitting: false,
      submissionError: null,
      fieldErrors: {}, // Clear errors on successful submission
    }),

  resetSubmissionState: () =>
    set({
      isSubmitting: false,
      submissionError: null,
      submissionErrorReason: null,
      submissionSuccess: false,
      submissionData: null,
      // Don't clear fieldErrors here - keep them visible after dialog closes
    }),

  setFieldErrors: (errors: Record<string, string>) =>
    set({ fieldErrors: errors }),

  clearFieldErrors: () => set({ fieldErrors: {} }),

  clearFieldError: (fieldKey: string) =>
    set((state) => {
      const newFieldErrors = { ...state.fieldErrors };
      delete newFieldErrors[fieldKey];
      return { fieldErrors: newFieldErrors };
    }),

  getFieldError: (fieldKey: string) => {
    const { fieldErrors } = get();
    return fieldErrors[fieldKey];
  },
}));

export default useFormStore;
