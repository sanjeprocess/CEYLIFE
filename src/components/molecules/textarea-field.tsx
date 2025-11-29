import { IFormTextareaField } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import useFormStore from "@/stores/form.store";
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
import { Textarea } from "../atoms/textarea";

export function TextareaField({
  field,
  name,
}: {
  field: IFormTextareaField;
  name: string;
}) {
  const { values, updateValue } = useFormStore();
  const translate = useTranslation();
  const storedValue = values[name];
  const defaultValue = field.defaultValue || "";
  const value =
    storedValue !== undefined && storedValue !== null
      ? (storedValue as string)
      : defaultValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateValue(name, e.target.value || null);
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
        <Textarea
          name={name}
          value={value}
          placeholder={placeholder}
          required={field.required}
          rows={field.rows}
          minLength={field.validation.minLength}
          maxLength={field.validation.maxLength}
          onChange={handleChange}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}
