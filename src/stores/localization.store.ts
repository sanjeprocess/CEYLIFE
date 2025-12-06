import { create } from "zustand";

import { IForm } from "@/common/interfaces/form.interfaces";
import { Locale } from "@/common/types/form.types";

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
    set({
      availableLocales: form.metadata.availableLocales,
      localization: form.localization ?? { en: {}, si: {}, ta: {} },
      currentLocale: form.metadata.defaultLocale ?? "en",
    });
  },
  setCurrentLocale: (locale: Locale) => {
    set({ currentLocale: locale });
  },
}));
