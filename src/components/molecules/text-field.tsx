import { IFormField } from "@/common/interfaces/form.interfaces";
import { useFormValue } from "@/hooks/useFormValue.hook";
import { useTranslation } from "@/hooks/useTranslation.hook";
import {
  getFieldDescriptionKey,
  getFieldLabelKey,
  getFieldPlaceholderKey,
} from "@/utils/fieldKey.utils";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../atoms/field";
import { Input } from "../atoms/input";

export function TextField({
  field,
  name,
}: {
  field: IFormField;
  name: string;
}) {
  const { computedValue, updateValue } = useFormValue(name);
  const translate = useTranslation();

  const value =
    computedValue !== undefined && computedValue !== null ? computedValue : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      field.type === "number"
        ? e.target.value === ""
          ? null
          : Number(e.target.value)
        : e.target.value;
    updateValue(newValue);
  };

  const label = translate(getFieldLabelKey(name), field.label);

  const placeholder = field.placeholder
    ? translate(getFieldPlaceholderKey(name), field.placeholder)
    : undefined;

  const description = field.description
    ? translate(getFieldDescriptionKey(name), field.description)
    : undefined;

  return (
    <Field>
      <FieldLabel>
        {label}
        {field.required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <FieldContent>
        <Input
          type={field.type}
          name={name}
          value={value as string | number}
          placeholder={placeholder}
          required={field.required}
          min={field.validation?.min}
          max={field.validation?.max}
          minLength={field.validation?.minLength}
          maxLength={field.validation?.maxLength}
          pattern={field.validation?.pattern}
          onChange={handleChange}
          readOnly={field.readOnly}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}
