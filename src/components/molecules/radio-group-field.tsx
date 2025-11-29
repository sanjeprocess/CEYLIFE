import { IFormRadioGroupField } from "@/common/interfaces/form.interfaces";
import useFormStore from "@/stores/form.store";

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
  const storedValue = values[name];
  const value = storedValue !== undefined && storedValue !== null
    ? (storedValue as string)
    : (field.defaultValue || "");

  const handleValueChange = (newValue: string) => {
    updateValue(name, newValue || null);
  };

  const { orientation = "vertical", options } = field;

  return (
    <Field>
      <FieldLabel>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <FieldContent>
        <RadioGroup
          value={value}
          onValueChange={handleValueChange}
          className={orientation === "horizontal" ? "flex flex-row gap-4" : ""}
        >
          {options &&
            Object.entries(options).map(([optionValue, optionLabel]) => (
              <div
                key={optionValue}
                className="flex items-center gap-2 space-x-2"
              >
                <RadioGroupItem value={optionValue} id={`${name}-${optionValue}`} />
                <Label
                  htmlFor={`${name}-${optionValue}`}
                  className="font-normal cursor-pointer"
                >
                  {optionLabel}
                </Label>
              </div>
            ))}
        </RadioGroup>
        {field.description && (
          <FieldDescription>{field.description}</FieldDescription>
        )}
      </FieldContent>
    </Field>
  );
}
