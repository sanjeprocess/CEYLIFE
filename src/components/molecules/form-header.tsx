"use client";

import { useEffect } from "react";

import { IForm } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import { useLocalizationStore } from "@/stores/localization.store";
import {
  getFormDescriptionKey,
  getFormTitleKey,
} from "@/utils/fieldKey.utils";

import { H1, P } from "../atoms/typography";

interface FormHeaderProps {
  form: IForm;
}

export function FormHeader({ form }: FormHeaderProps) {
  const { initializeLocalization } = useLocalizationStore();
  const translate = useTranslation();

  useEffect(() => {
    initializeLocalization(form);
  }, [form, initializeLocalization]);

  const translatedTitle = translate(
    getFormTitleKey(),
    form.metadata.formTitle
  );
  const translatedDescription = translate(
    getFormDescriptionKey(),
    form.metadata.formDescription
  );

  // Apply variable replacement
  const formTitle = useVariableReplacement(translatedTitle);
  const formDescription = useVariableReplacement(translatedDescription);

  return (
    <div className="mt-6 text-center">
      <H1>{formTitle}</H1>
      <P className="text-muted-foreground">{formDescription}</P>
    </div>
  );
}

