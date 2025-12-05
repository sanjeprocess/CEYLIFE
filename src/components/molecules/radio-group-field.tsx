import { IFormRadioGroupField } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import useFormStore from "@/stores/form.store";
import {
  getFieldDescriptionKey,
  getFieldLabelKey,
  getFieldOptionKey,
} from "@/utils/fieldKey.utils";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../atoms/field";
import { Label } from "../atoms/label";
import { RadioGroup, RadioGroupItem } from "../atoms/radio-group";

export function RadioGroupField({
  field,
  name,
}: {
  field: IFormRadioGroupField;
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

  const { orientation = "vertical", options } = field;

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
        <RadioGroup
          value={value}
          onValueChange={handleValueChange}
          className={orientation === "horizontal" ? "flex flex-row gap-4" : ""}
        >
          {options &&
            Object.entries(options).map(([optionValue, optionLabel]) => {
              const optionLabelWithVars = translate(
                getFieldOptionKey(name, optionValue),
                optionLabel
              );
              return (
                <div
                  key={optionValue}
                  className="flex items-center gap-2 space-x-2"
                >
                  <RadioGroupItem value={optionValue} id={`${name}-${optionValue}`} />
                  <Label
                    htmlFor={`${name}-${optionValue}`}
                    className="font-normal cursor-pointer"
                  >
                    {optionLabelWithVars}
                  </Label>
                </div>
              );
            })}
        </RadioGroup>
        {description && (
          <FieldDescription>{description}</FieldDescription>
        )}
      </FieldContent>
    </Field>
  );
}
