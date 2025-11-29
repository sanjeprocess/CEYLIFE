import { IFormSelectField } from "@/common/interfaces/form.interfaces";
import useFormStore from "@/stores/form.store";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../atoms/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../atoms/select";

export function SelectField({
  field,
  name,
}: {
  field: IFormSelectField;
  name: string;
}) {
  const { values, updateValue } = useFormStore();
  const storedValue = values[name];
  const value = storedValue !== undefined && storedValue !== null
    ? (storedValue as string)
    : (field.defaultValue || "");

  const handleValueChange = (newValue: string) => {
    updateValue(name, newValue || null);
  };

  const options = field.options || {};

  return (
    <Field>
      <FieldLabel>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <FieldContent>
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(options).map(([optionValue, optionLabel]) => (
              <SelectItem key={optionValue} value={optionValue}>
                {optionLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {field.description && (
          <FieldDescription>{field.description}</FieldDescription>
        )}
      </FieldContent>
    </Field>
  );
}
