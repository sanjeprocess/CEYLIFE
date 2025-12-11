import { LoaderCircle } from "lucide-react";

import { IFormLayoutItem } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import { styles } from "@/services/render.service";
import useFormStore from "@/stores/form.store";
import { cn } from "@/utils/shadcn.utils";

import { Button } from "../atoms/button";

interface SubmitButtonProps {
  layout: IFormLayoutItem;
  submitText: string | number | boolean;
}

export function SubmitButton({ layout, submitText }: SubmitButtonProps) {
  const translate = useTranslation();
  const translationKey = layout.key;
  const { isSubmitting } = useFormStore();

  const translatedText = translationKey
    ? translate(translationKey, String(submitText))
    : String(submitText);

  const buttonText = useVariableReplacement(translatedText);

  const loadingText = layout.loadingTextKey
    ? translate(layout.loadingTextKey, layout.loadingText || "Submitting...")
    : layout.loadingText || "Submitting...";

  const variant = layout.variant || "default";

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
        type="submit"
        variant={variant}
        disabled={isSubmitting}
        className="gap-2"
      >
        {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {isSubmitting ? loadingText : buttonText}
      </Button>
    </div>
  );
}
