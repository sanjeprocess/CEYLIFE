import { useMemo } from "react";

import { IFormLayoutItem } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import { mdToHtml, styles } from "@/services/render.service";

import { H1, H2, H3, H4, H5, H6, P } from "../atoms/typography";

interface TypographyRendererProps {
  layout: IFormLayoutItem;
  type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "text";
  value: string | number | boolean;
}

export function TypographyRenderer({
  layout,
  type,
  value,
}: TypographyRendererProps) {
  const translate = useTranslation();
  const translationKey = layout.key;

  // Get the display value (translated if key exists)
  const displayValue = translationKey
    ? translate(translationKey, value as string)
    : (value as string);

  // Replace variables in the text (reactive to variable changes)
  const textWithVariables = useVariableReplacement(displayValue);

  // Convert markdown to HTML
  const processedContent = useMemo(() => {
    return mdToHtml(textWithVariables);
  }, [textWithVariables]);

  // Common style props
  const commonStyles = styles({
    textAlign: layout.align,
    fontSize: layout.fontSize,
    margin: layout.margin,
  });

  // Common props for all typography components
  const commonProps = {
    style: commonStyles,
    dangerouslySetInnerHTML: { __html: processedContent },
  };

  // Render the appropriate typography component based on type
  switch (type) {
    case "h1":
      return <H1 {...commonProps} />;
    case "h2":
      return <H2 {...commonProps} />;
    case "h3":
      return <H3 {...commonProps} />;
    case "h4":
      return <H4 {...commonProps} />;
    case "h5":
      return <H5 {...commonProps} />;
    case "h6":
      return <H6 {...commonProps} />;
    case "text":
      return <P {...commonProps} />;
    default:
      return null;
  }
}
