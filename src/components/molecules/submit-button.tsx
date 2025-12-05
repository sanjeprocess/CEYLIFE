import { IFormLayoutItem } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import { styles } from "@/services/render.service";
import { cn } from "@/utils/shadcn.utils";

import { Button } from "../atoms/button";

interface SubmitButtonProps {
  layout: IFormLayoutItem;
  submitText: string | number | boolean;
}

export function SubmitButton({ layout, submitText }: SubmitButtonProps) {
  const translate = useTranslation();
  const translationKey = layout.key;

  // Get button text (translated if key provided, otherwise use submitText)
  const translatedText = translationKey
    ? translate(translationKey, String(submitText))
    : String(submitText);

  // Apply variable replacement
  const buttonText = useVariableReplacement(translatedText);

  // Get variant (default to "default" if not specified)
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
        disabled={false} // Will be handled later when submission is implemented
      >
        {buttonText}
      </Button>
    </div>
  );
}
