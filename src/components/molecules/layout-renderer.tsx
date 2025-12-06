import {
  IFormField,
  IFormLayoutItem,
} from "@/common/interfaces/form.interfaces";

import { CheckboxField } from "./checkbox-field";
import { CheckboxGroupField } from "./checkbox-group-field";
import { ConditionalRenderer } from "./conditional-renderer";
import { FileField } from "./file-field";
import { RadioGroupField } from "./radio-group-field";
import { ResetButton } from "./reset-button";
import { RowLayout } from "./row-layout";
import { SelectField } from "./select-field";
import { SubmitButton } from "./submit-button";
import { TextCard } from "./text-card";
import { TextField } from "./text-field";
import { TextareaField } from "./textarea-field";
import { TypographyRenderer } from "./typography-renderer";
import { Separator } from "../atoms/separator";

interface LayoutRendererProps {
  layout: IFormLayoutItem;
  fields: Record<string, IFormField>;
}

export function LayoutRenderer({ layout, fields }: LayoutRendererProps) {
  const items = Object.entries(layout).filter(([key]) => key !== "key");
  if (items.length === 0) return null;
  const [type, value] = items[0];

  switch (type) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
    case "text":
      return (
        <TypographyRenderer
          layout={layout}
          type={type as "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "text"}
          value={value}
        />
      );
    case "spacer":
      return <div style={{ height: value as number }} />;
    case "divider":
      return <Separator />;
    case "card":
      return (
        <TextCard
          layout={layout}
          fields={fields}
          cardTitleValue={value}
          translationKey={layout.key}
        />
      );
    case "row":
      return (
        <RowLayout
          layout={layout}
          fields={fields}
          columnCount={value as number}
        />
      );
    case "field":
      return (
        <FieldRenderer field={fields[value as string]} name={value as string} />
      );
    case "submit":
      return (
        <SubmitButton
          layout={layout}
          submitText={value as string | number | boolean}
        />
      );
    case "reset":
      return (
        <ResetButton
          layout={layout}
          resetText={value as string | number | boolean}
        />
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
    case "checkbox-group":
      Component = <CheckboxGroupField field={field} name={name} />;
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
