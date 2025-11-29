import {
  IFormField,
  IFormLayoutItem,
} from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";

import { CheckboxField } from "./checkbox-field";
import { ConditionalRenderer } from "./conditional-renderer";
import { FileField } from "./file-field";
import { RadioGroupField } from "./radio-group-field";
import { SelectField } from "./select-field";
import { TextField } from "./text-field";
import { TextareaField } from "./textarea-field";
import { Separator } from "../atoms/separator";
import { H1, H4, H2, H3, H5, H6, P } from "../atoms/typography";

interface LayoutRendererProps {
  layout: IFormLayoutItem;
  fields: Record<string, IFormField>;
}

export function LayoutRenderer({ layout, fields }: LayoutRendererProps) {
  const translate = useTranslation();
  const items = Object.entries(layout).filter(([key]) => key !== "key");
  if (items.length === 0) return null;
  if (items.length > 1) {
    console.warn("LayoutRenderer: Only one item is allowed in the layout");
  }
  const [type, value] = items[0];
  const translationKey = layout.key;

  switch (type) {
    case "h1": {
      const displayValue = translationKey
        ? translate(translationKey, value as string)
        : (value as string);
      return <H1>{displayValue}</H1>;
    }
    case "h2": {
      const displayValue = translationKey
        ? translate(translationKey, value as string)
        : (value as string);
      return <H2>{displayValue}</H2>;
    }
    case "h3": {
      const displayValue = translationKey
        ? translate(translationKey, value as string)
        : (value as string);
      return <H3>{displayValue}</H3>;
    }
    case "h4": {
      const displayValue = translationKey
        ? translate(translationKey, value as string)
        : (value as string);
      return <H4>{displayValue}</H4>;
    }
    case "h5": {
      const displayValue = translationKey
        ? translate(translationKey, value as string)
        : (value as string);
      return <H5>{displayValue}</H5>;
    }
    case "h6": {
      const displayValue = translationKey
        ? translate(translationKey, value as string)
        : (value as string);
      return <H6>{displayValue}</H6>;
    }
    case "text": {
      const displayValue = translationKey
        ? translate(translationKey, value as string)
        : (value as string);
      return <P>{displayValue}</P>;
    }
    case "spacer":
      return <div style={{ height: value as number }} />;
    case "divider":
      return <Separator />;
    case "field":
      return (
        <FieldRenderer field={fields[value as string]} name={value as string} />
      );
    default:
      return <div>Unsupported layout type: {type}</div>;
  }
}

export function FieldRenderer({
  field,
  name,
}: {
  field: IFormField;
  name: string;
}) {
  if (!field) return null;
  let Component = null;
  switch (field.type) {
    case "text":
    case "number":
    case "email":
    case "password":
    case "date":
    case "time":
    case "datetime-local":
    case "tel":
    case "url":
      Component = <TextField field={field} name={name} />;
      break;
    case "select":
      Component = <SelectField field={field} name={name} />;
      break;
    case "radio-group":
      Component = <RadioGroupField field={field} name={name} />;
      break;
    case "checkbox":
      Component = <CheckboxField field={field} name={name} />;
      break;
    case "textarea":
      Component = <TextareaField field={field} name={name} />;
      break;
    case "file":
      Component = <FileField field={field} name={name} />;
      break;
    default:
      Component = (
        <div>
          Unsupported field type: {field.type} for field: {name}
        </div>
      );
      break;
  }

  return (
    <>
      {Component}
      {/* Rendering Conditional Dependencies */}
      {field.dependencies && (
        <ConditionalRenderer
          parentName={name}
          dependencies={field.dependencies}
        />
      )}
    </>
  );
}
