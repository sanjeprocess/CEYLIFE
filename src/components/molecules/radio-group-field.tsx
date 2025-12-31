import { IFormRadioGroupField } from "@/common/interfaces/form.interfaces";
import { useFormValue } from "@/hooks/useFormValue.hook";
import { useTranslation } from "@/hooks/useTranslation.hook";
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
  const { computedValue, updateValue } = useFormValue(name);
  const translate = useTranslation();

  const value =
    computedValue !== undefined && computedValue !== null
      ? (computedValue as string)
      : "";

  const handleValueChange = (newValue: string) => {
    updateValue(newValue || null);
  };

  const { orientation = "vertical", options } = field;

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
                  <RadioGroupItem
                    value={optionValue}
                    id={`${name}-${optionValue}`}
                    disabled={field.readOnly}
                  />
                  <Label
                    htmlFor={`${name}-${optionValue}`}
                    className="cursor-pointer font-normal"
                  >
                    {optionLabelWithVars}
                  </Label>
                </div>
              );
            })}
        </RadioGroup>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}
