import { IFormCheckboxGroupField } from "@/common/interfaces/form.interfaces";
import { useFormValue } from "@/hooks/useFormValue.hook";
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
  const { rawValue, computedValue, updateValue } = useFormValue(name);
  const translate = useTranslation();
  const getFieldError = useFormStore((state) => state.getFieldError);
  const hasError = !!getFieldError(name);

  const defaultParsed =
    typeof computedValue === "string" && computedValue
      ? computedValue.split(",").filter(Boolean)
      : [];

  const value = Array.isArray(rawValue)
    ? (rawValue as string[])
    : defaultParsed;

  const handleCheckedChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(rawValue)
      ? (rawValue as string[])
      : defaultParsed;

    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((v) => v !== optionValue);

    updateValue(newValues.length > 0 ? newValues : []);
  };

  const { options } = field;

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
                    aria-invalid={hasError}
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
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}
