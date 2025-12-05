import { IFormLayoutItem } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import { styles } from "@/services/render.service";
import useFormStore from "@/stores/form.store";
import { cn } from "@/utils/shadcn.utils";

import { Button } from "../atoms/button";

interface ResetButtonProps {
  layout: IFormLayoutItem;
  resetText: string | number | boolean;
}

export function ResetButton({ layout, resetText }: ResetButtonProps) {
  const translate = useTranslation();
  const translationKey = layout.key;
  const { resetForm } = useFormStore();

  // Get button text (translated if key provided, otherwise use resetText)
  const translatedText = translationKey
    ? translate(translationKey, String(resetText))
    : String(resetText);

  // Apply variable replacement
  const buttonText = useVariableReplacement(translatedText);

  // Get variant (default to "outline" if not specified, as reset is typically less prominent)
  const variant = layout.variant || "outline";

  const handleReset = () => {
    resetForm();
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
      <Button type="button" variant={variant} onClick={handleReset}>
        {buttonText}
      </Button>
    </div>
  );
}
