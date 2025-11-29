import { create } from "zustand";

import { IForm } from "@/common/interfaces/form.interfaces";
import { FormValue } from "@/common/types/common.types";
import { parseFormToFormData } from "@/services/parsing.service";

interface FormStore {
  form: IForm | undefined;
  values: Record<string, FormValue>;
  initializeForm: (form: IForm) => void;
  updateValue: (key: string, value: FormValue) => void;
  resetForm: () => void;
}

const useFormStore = create<FormStore>((set, get) => ({
  form: undefined,
  values: {},
  initializeForm: (form: IForm) =>
    set({ form, values: parseFormToFormData(form) }),

  updateValue: (key: string, value: FormValue) =>
    set((state) => ({ values: { ...state.values, [key]: value } })),
  resetForm: () =>
    set({ values: get().form ? parseFormToFormData(get().form!) : {} }),
}));

export default useFormStore;
