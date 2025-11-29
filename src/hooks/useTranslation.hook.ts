import { useLocalizationStore } from "@/stores/localization.store";

/**
 * Hook for translating form fields and metadata
 * @returns A function that translates a key with fallback to original value
 */
export function useTranslation() {
  const { currentLocale, localization } = useLocalizationStore();

  return (key: string, originalValue?: string): string => {
    const localeTranslations = localization[currentLocale];

    if (!localeTranslations) {
      return originalValue ?? key;
    }

    const translatedValue = localeTranslations[key];

    // If translation exists, return it; otherwise fallback to original value or key
    if (
      translatedValue !== undefined &&
      translatedValue !== null &&
      translatedValue !== ""
    ) {
      return translatedValue;
    }

    return originalValue ?? key;
  };
}
