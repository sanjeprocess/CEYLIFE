import { IFormTextareaField } from "@/common/interfaces/form.interfaces";
import useFormStore from "@/stores/form.store";

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
  const storedValue = values[name];
  const defaultValue = field.defaultValue || "";
  const value =
    storedValue !== undefined && storedValue !== null
      ? (storedValue as string)
      : defaultValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateValue(name, e.target.value || null);
  };

  return (
    <Field>
      <FieldLabel>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <FieldContent>
        <Textarea
          name={name}
          value={value}
          placeholder={field.placeholder}
          required={field.required}
          rows={field.rows}
          minLength={field.validation.minLength}
          maxLength={field.validation.maxLength}
          onChange={handleChange}
        />
        {field.description && (
          <FieldDescription>{field.description}</FieldDescription>
        )}
      </FieldContent>
    </Field>
  );
}
