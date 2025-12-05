import { IFormCheckboxGroupField } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import useFormStore from "@/stores/form.store";
import {
  getFieldDescriptionKey,
  getFieldLabelKey,
  getFieldOptionKey,
} from "@/utils/fieldKey.utils";

import { Checkbox } from "../atoms/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../atoms/field";
import { Label } from "../atoms/label";

export function CheckboxGroupField({
  field,
  name,
}: {
  field: IFormCheckboxGroupField;
  name: string;
}) {
  const { values, updateValue } = useFormStore();
  const translate = useTranslation();
  
  // Apply variable replacement to default value via translate
  const defaultValue = field.defaultValue ? translate("", field.defaultValue) : "";
  
  const storedValue = values[name];
  const value = Array.isArray(storedValue)
    ? (storedValue as string[])
    : defaultValue
      ? defaultValue.split(",").filter(Boolean)
      : [];

  const handleCheckedChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(storedValue)
      ? (storedValue as string[])
      : defaultValue
        ? defaultValue.split(",").filter(Boolean)
        : [];

    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((v) => v !== optionValue);

    updateValue(name, newValues.length > 0 ? newValues : []);
  };

  const { options } = field;

  // Translation now includes variable replacement
  const label = translate(getFieldLabelKey(name), field.label);
  
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
        <div className="flex flex-col gap-2" data-slot="checkbox-group">
          {options &&
            Object.entries(options).map(([optionValue, optionLabel]) => {
              const isChecked = value.includes(optionValue);
              const optionLabelWithVars = translate(
                getFieldOptionKey(name, optionValue),
                optionLabel
              );
              return (
                <div
                  key={optionValue}
                  className="flex items-center gap-2 space-x-2"
                >
                  <Checkbox
                    id={`${name}-${optionValue}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCheckedChange(optionValue, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`${name}-${optionValue}`}
                    className="font-normal cursor-pointer"
                  >
                    {optionLabelWithVars}
                  </Label>
                </div>
              );
            })}
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}

