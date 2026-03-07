import { create } from "zustand";

import { IForm } from "@/common/interfaces/form.interfaces";
import { Locale } from "@/common/types/form.types";
import { useVariableStore } from "@/stores/variable.store";

interface LocalizationStore {
  availableLocales: Locale[];
  currentLocale: Locale;
  localization: Record<Locale, Record<string, string>>;
  initializeLocalization: (form: IForm) => void;
  setCurrentLocale: (locale: Locale) => void;
}

export const useLocalizationStore = create<LocalizationStore>((set) => ({
  availableLocales: [],
  currentLocale: "en",
  localization: {
    en: {},
    si: {},
    ta: {},
  },
  initializeLocalization: (form: IForm) => {
    // Always use form's defaultLocale (ignore cookie locale during init)
    const defaultLocale = form.metadata.defaultLocale ?? "en";
    
    set({
      availableLocales: form.metadata.availableLocales,
      localization: form.localization ?? { en: {}, si: {}, ta: {} },
      currentLocale: defaultLocale,
    });

    // Set locale in variable store immediately so {{locale}} is always available
    // This ensures {{locale}} is never empty, even before variable initialization
    useVariableStore.getState().updateVariable("locale", defaultLocale);
  },
  setCurrentLocale: (locale: Locale) => {
    set({ currentLocale: locale });
    // Also update variable store so it syncs to cookie via VariableHandler
    useVariableStore.getState().updateVariable("locale", locale);
  },
}));
