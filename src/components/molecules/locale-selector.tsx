"use client";

import { FORM_LOCALES } from "@/common/constants/form.constants";
import { useLocalizationStore } from "@/stores/localization.store";

import {
  Select,
  SelectItem,
  SelectGroup,
  SelectContent,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../atoms/select";

export function LocaleSelector() {
  const { availableLocales, currentLocale, setCurrentLocale } =
    useLocalizationStore();
  return (
    <Select value={currentLocale} onValueChange={setCurrentLocale}>
      <SelectTrigger className="w-[100px]" size="sm">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Language</SelectLabel>
          {availableLocales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {FORM_LOCALES[locale as keyof typeof FORM_LOCALES]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
