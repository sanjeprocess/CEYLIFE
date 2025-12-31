"use client";

import { LoaderCircle } from "lucide-react";

import { IFormLayoutItem } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import { submitForm } from "@/services/form-submission.service";
import { validateForm } from "@/services/form-validation.service";
import { styles } from "@/services/render.service";
import { refreshVariablesFromCookies } from "@/services/variable.service";
import useFormStore from "@/stores/form.store";
import { useVariableStore } from "@/stores/variable.store";
import { cn } from "@/utils/shadcn.utils";

import { Button } from "../atoms/button";

interface SubmitButtonProps {
  layout: IFormLayoutItem;
  submitText: string | number | boolean;
}

export function SubmitButton({ layout, submitText }: SubmitButtonProps) {
  const translate = useTranslation();
  const translationKey = layout.key;
  const {
    isSubmitting,
    form,
    getComputedValues,
    setSubmitting,
    setSubmissionError,
    setSubmissionSuccess,
    setFieldErrors,
  } = useFormStore();
  const { variables } = useVariableStore();

  const translatedText = translationKey
    ? translate(translationKey, String(submitText))
    : String(submitText);

  const buttonText = useVariableReplacement(translatedText);

  const loadingText = layout.loadingTextKey
    ? translate(layout.loadingTextKey, layout.loadingText || "Submitting...")
    : layout.loadingText || "Submitting...";

  const variant = layout.variant || "default";

  const handleSubmit = async () => {
    if (!form || !form.submission) {
      console.error("[SubmitButton] Form or submission config not found");
      return;
    }

    // Validate all fields
    const formValues = getComputedValues();
    const validationResult = validateForm(form, formValues);

    if (!validationResult.isValid) {
      // Store field errors in form store
      const fieldErrorsMap: Record<string, string> = {};
      validationResult.errors.forEach((err) => {
        fieldErrorsMap[err.fieldKey] = err.error;
      });
      setFieldErrors(fieldErrorsMap);

      // Show short, user-friendly error message
      const errorCount = validationResult.errors.length;
      const errorMessage =
        errorCount === 1
          ? "Please fix the error below and try again."
          : `Please fix the ${errorCount} errors below and try again. Look for fields marked in red for details.`;
      setSubmissionError("Validation failed", errorMessage);
      return;
    }

    // Start submission
    setSubmitting(true);

    try {
      const result = await submitForm(form.submission, formValues, variables);

      if (result.success) {
        // Update variables if extracted from response
        if (result.variables) {
          useVariableStore.getState().mergeVariables(result.variables, "api");
        }
        // Also refresh from cookies to ensure sync
        refreshVariablesFromCookies();
        setSubmissionSuccess(
          true,
          result.responseData as Record<string, unknown>
        );
      } else {
        setSubmissionError(
          result.error || "Submission failed",
          result.errorReason
        );
      }
    } catch (error) {
      console.error("[SubmitButton] Submission error:", error);
      setSubmissionError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div
      className={cn("flex w-full", {
        "justify-center": layout.align === "center",
        "justify-end": layout.align === "right",
        "justify-start": layout.align === "left" || !layout.align,
      })}
      style={styles({
        margin: layout.margin,
      })}
    >
      <Button
        type="button"
        variant={variant}
        disabled={isSubmitting}
        className="gap-2"
        onClick={handleSubmit}
      >
        {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {isSubmitting ? loadingText : buttonText}
      </Button>
    </div>
  );
}
