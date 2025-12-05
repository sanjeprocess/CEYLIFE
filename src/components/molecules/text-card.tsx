import {
  IFormField,
  IFormLayoutItem,
} from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import { mdToHtml, styles } from "@/services/render.service";

import { LayoutRenderer } from "./layout-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "../atoms/card";

interface TextCardProps {
  layout: IFormLayoutItem;
  fields: Record<string, IFormField>;
  cardTitleValue: string | number | boolean;
  translationKey?: string;
}

export function TextCard({
  layout,
  fields,
  cardTitleValue,
  translationKey,
}: TextCardProps) {
  const translate = useTranslation();
  const cardTitleValueStr =
    typeof cardTitleValue === "string" ? cardTitleValue : "";
  const translatedTitle = cardTitleValueStr
    ? translationKey
      ? translate(translationKey, cardTitleValueStr)
      : cardTitleValueStr
    : "";

  // Apply variable replacement
  const cardTitle = useVariableReplacement(translatedTitle);
  const cardTitleHtml = cardTitle ? mdToHtml(cardTitle) : "";

  return (
    <Card className="border shadow-none">
      {cardTitle && (
        <CardHeader style={{ textAlign: layout.align }}>
          <CardTitle
            style={styles({
              textAlign: layout.align,
              fontSize: layout.fontSize,
              margin: layout.margin,
            })}
            dangerouslySetInnerHTML={{ __html: cardTitleHtml }}
          />
        </CardHeader>
      )}
      {layout.items && layout.items.length > 0 && (
        <CardContent>
          <div className="flex flex-col gap-4">
            {layout.items.map((item, index) => (
              <LayoutRenderer key={index} layout={item} fields={fields} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
