import { useLocalizationStore } from "@/stores/localization.store";

import { useVariableReplacement } from "./useVariableReplacement.hook";

/**
 * Hook for translating form fields and metadata with automatic variable replacement
 * @returns A function that translates a key with fallback to original value and applies variable replacement
 */
export function useTranslation() {
  const { currentLocale, localization } = useLocalizationStore();
  const applyVariableReplacement = useVariableReplacement;

  return (key: string, originalValue?: string): string => {
    const localeTranslations = localization[currentLocale];

    if (!localeTranslations) {
      const fallback = originalValue ?? key;
      return applyVariableReplacement(fallback);
    }

    const translatedValue = localeTranslations[key];

    // If translation exists, return it; otherwise fallback to original value or key
    if (
      translatedValue !== undefined &&
      translatedValue !== null &&
      translatedValue !== ""
    ) {
      return applyVariableReplacement(translatedValue);
    }

    const fallback = originalValue ?? key;
    return applyVariableReplacement(fallback);
  };
}
