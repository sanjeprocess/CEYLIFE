import { IFormSelectField } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import useFormStore from "@/stores/form.store";
import {
  getFieldDescriptionKey,
  getFieldLabelKey,
  getFieldOptionKey,
  getFieldPlaceholderKey,
} from "@/utils/fieldKey.utils";

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
  const translate = useTranslation();
  
  // Apply variable replacement to default value via translate
  const defaultValue = field.defaultValue ? translate("", field.defaultValue) : "";
  
  const storedValue = values[name];
  const value = storedValue !== undefined && storedValue !== null
    ? (storedValue as string)
    : defaultValue;

  const handleValueChange = (newValue: string) => {
    updateValue(name, newValue || null);
  };

  const options = field.options || {};

  // Translation now includes variable replacement
  const label = translate(getFieldLabelKey(name), field.label);
  
  const placeholder = field.placeholder
    ? translate(getFieldPlaceholderKey(name), field.placeholder)
    : translate("", "Select an option");
  
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
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(options).map(([optionValue, optionLabel]) => {
              const optionLabelWithVars = translate(
                getFieldOptionKey(name, optionValue),
                optionLabel
              );
              return (
                <SelectItem key={optionValue} value={optionValue}>
                  {optionLabelWithVars}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {description && (
          <FieldDescription>{description}</FieldDescription>
        )}
      </FieldContent>
    </Field>
  );
}
