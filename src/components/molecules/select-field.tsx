import { IFormSelectField } from "@/common/interfaces/form.interfaces";
import { useFormValue } from "@/hooks/useFormValue.hook";
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
  const { computedValue, updateValue } = useFormValue(name);
  const translate = useTranslation();
  const getFieldError = useFormStore((state) => state.getFieldError);
  const hasError = !!getFieldError(name);

  const value =
    computedValue !== undefined && computedValue !== null
      ? (computedValue as string)
      : "";

  const handleValueChange = (newValue: string) => {
    updateValue(newValue || null);
  };

  const options = field.options || {};

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
          <SelectTrigger aria-invalid={hasError}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(options).map(([optionValue, optionLabel]) => {
              const optionLabelWithVars = translate(
                getFieldOptionKey(name, optionValue),
                optionLabel
              );
              return (
                <SelectItem
                  key={optionValue}
                  value={optionValue}
                  disabled={field.readOnly}
                >
                  {optionLabelWithVars}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}
