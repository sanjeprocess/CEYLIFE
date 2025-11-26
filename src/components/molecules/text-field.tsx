import { IFormField } from "@/common/interfaces/form.interfaces";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";

import { P } from "../atoms/typography";

const SUPPORTED_TYPES = [
  "text",
  "email",
  "password",
  "number",
  "tel",
  "url",
  "date",
  "time",
  "datetime-local",
];

export function TextField({
  field,
  name,
}: {
  field: IFormField;
  name: string;
}) {
  if (!SUPPORTED_TYPES.includes(field.type)) {
    return null;
  }

  return (
    <div className="my-4">
      <Label htmlFor={name} className="mb-1">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        placeholder={field.placeholder}
        required={field.required}
        name={name}
      />
      {field.description && (
        <P className="text-muted-foreground text-sm mt-1 italic">
          {field.description}
        </P>
      )}
    </div>
  );
}
