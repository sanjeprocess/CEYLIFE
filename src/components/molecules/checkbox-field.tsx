import { IFormCheckboxField } from "@/common/interfaces/form.interfaces";
import useFormStore from "@/stores/form.store";

import { Checkbox } from "../atoms/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../atoms/field";

export function CheckboxField({
  field,
  name,
}: {
  field: IFormCheckboxField;
  name: string;
}) {
  const { values, updateValue } = useFormStore();
  const storedValue = values[name];
  const value =
    storedValue !== undefined
      ? (storedValue as boolean)
      : field.checked ?? field.defaultValue === "true";

  const handleCheckedChange = (checked: boolean) => {
    updateValue(name, checked);
  };

  return (
    <Field orientation="horizontal">
      <FieldContent>
        <div className="flex items-center gap-2">
          <Checkbox
            id={name}
            checked={value}
            onCheckedChange={handleCheckedChange}
            required={field.required}
          />
          <FieldLabel htmlFor={name} className="font-normal cursor-pointer">
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </FieldLabel>
        </div>
        {field.description && (
          <FieldDescription>{field.description}</FieldDescription>
        )}
      </FieldContent>
    </Field>
  );
}
