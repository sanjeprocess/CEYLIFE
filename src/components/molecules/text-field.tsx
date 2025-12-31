import { IFormField } from "@/common/interfaces/form.interfaces";
import { useFormValue } from "@/hooks/useFormValue.hook";
import { useTranslation } from "@/hooks/useTranslation.hook";
import useFormStore from "@/stores/form.store";
import {
  formatCurrencyDisplay,
  parseCurrencyInput,
} from "@/utils/currency.utils";
import {
  getFieldDescriptionKey,
  getFieldLabelKey,
  getFieldPlaceholderKey,
} from "@/utils/fieldKey.utils";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../atoms/field";
import { Input } from "../atoms/input";

export function TextField({
  field,
  name,
}: {
  field: IFormField;
  name: string;
}) {
  const { computedValue, updateValue } = useFormValue(name);
  const translate = useTranslation();
  const getFieldError = useFormStore((state) => state.getFieldError);
  const hasError = !!getFieldError(name);

  const isCurrency = field.type === "currency";

  // For currency: format display value with commas
  // For other types: use value as-is
  const displayValue = isCurrency
    ? formatCurrencyDisplay(
        typeof computedValue === "number" ? computedValue : null
      )
    : computedValue !== undefined && computedValue !== null
      ? computedValue
      : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    let newValue: string | number | null;

    if (isCurrency) {
      // Parse currency input (remove commas) and convert to number
      newValue = parseCurrencyInput(inputValue);
    } else if (field.type === "number") {
      // Handle regular number type
      newValue = inputValue === "" ? null : Number(inputValue);
    } else {
      // Handle text and other types
      newValue = inputValue;
    }

    updateValue(newValue);
  };

  const label = translate(getFieldLabelKey(name), field.label);

  const placeholder = field.placeholder
    ? translate(getFieldPlaceholderKey(name), field.placeholder)
    : undefined;

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
        <Input
          type={isCurrency ? "text" : field.type}
          name={name}
          value={displayValue as string | number}
          placeholder={placeholder}
          required={field.required}
          min={field.validation?.min}
          max={field.validation?.max}
          minLength={field.validation?.minLength}
          maxLength={field.validation?.maxLength}
          pattern={field.validation?.pattern}
          onChange={handleChange}
          readOnly={field.readOnly}
          aria-invalid={hasError}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}
