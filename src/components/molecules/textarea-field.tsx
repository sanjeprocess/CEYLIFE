import { IFormTextareaField } from "@/common/interfaces/form.interfaces";
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
import { Textarea } from "../atoms/textarea";

export function TextareaField({
  field,
  name,
}: {
  field: IFormTextareaField;
  name: string;
}) {
  const { computedValue, updateValue } = useFormValue(name);
  const translate = useTranslation();

  const value =
    computedValue !== undefined && computedValue !== null
      ? (computedValue as string)
      : "";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateValue(e.target.value || null);
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
          minLength={field.validation?.minLength}
          maxLength={field.validation?.maxLength}
          onChange={handleChange}
          readOnly={field.readOnly}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}
