import { IFormCheckboxField } from "@/common/interfaces/form.interfaces";
import { useFormValue } from "@/hooks/useFormValue.hook";
import { useTranslation } from "@/hooks/useTranslation.hook";
import useFormStore from "@/stores/form.store";
import {
  getFieldDescriptionKey,
  getFieldLabelKey,
} from "@/utils/fieldKey.utils";

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
  const { rawValue, updateValue } = useFormValue(name);
  const translate = useTranslation();
  const getFieldError = useFormStore((state) => state.getFieldError);
  const hasError = !!getFieldError(name);

  const value =
    rawValue !== undefined
      ? (rawValue as boolean)
      : (field.checked ?? field.defaultValue === "true");

  const handleCheckedChange = (checked: boolean) => {
    updateValue(checked);
  };

  const label = translate(getFieldLabelKey(name), field.label);

  const description = field.description
    ? translate(getFieldDescriptionKey(name), field.description)
    : undefined;

  return (
    <Field orientation="horizontal">
      <FieldContent>
        <div className="flex items-center gap-2">
          <Checkbox
            id={name}
            checked={value}
            onCheckedChange={handleCheckedChange}
            required={field.required}
            aria-invalid={hasError}
          />
          <FieldLabel htmlFor={name} className="cursor-pointer font-normal">
            {label}
            {field.required && <span className="text-destructive"> *</span>}
          </FieldLabel>
        </div>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}
