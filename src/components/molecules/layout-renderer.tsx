import {
  IFormField,
  IFormLayoutItem,
} from "@/common/interfaces/form.interfaces";

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
  const items = Object.entries(layout);
  if (items.length === 0) return null;
  if (items.length > 1) {
    console.warn("LayoutRenderer: Only one item is allowed in the layout");
  }
  const [type, value] = items[0];
  switch (type) {
    case "h1":
      return <H1>{value}</H1>;
    case "h2":
      return <H2>{value}</H2>;
    case "h3":
      return <H3>{value}</H3>;
    case "h4":
      return <H4>{value}</H4>;
    case "h5":
      return <H5>{value}</H5>;
    case "h6":
      return <H6>{value}</H6>;
    case "text":
      return <P>{value}</P>;
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
