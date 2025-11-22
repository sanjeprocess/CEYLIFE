"use client";

import { useController, useFormContext } from "react-hook-form";
import { IFieldLayoutItem } from "@/common/interfaces/formData";
import { IJSONSchemaProperty } from "@/common/interfaces/formData";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { getFieldConfig } from "@/utils/schemaMapper.utils";

interface FieldInputProps extends IFieldLayoutItem {
  schema?: IJSONSchemaProperty;
  required?: boolean;
}

export const FieldInput = ({
  name,
  label,
  schema,
  required,
}: FieldInputProps) => {
  const { control } = useFormContext();
  const isRequired = required || false;

  const fieldConfig = schema
    ? getFieldConfig(schema, isRequired)
    : {
        required: isRequired,
        inputType: "text" as const,
      };

  // Use label from JSON layout item, fall back to schema title if no label provided
  console.log(label, fieldConfig.label, name);
  const displayLabel = label || fieldConfig.label || name;

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: fieldConfig.required ? `${displayLabel} is required` : false,
      pattern: fieldConfig.pattern
        ? {
            value: new RegExp(fieldConfig.pattern),
            message: "Invalid format",
          }
        : undefined,
      minLength: fieldConfig.minLength
        ? {
            value: fieldConfig.minLength,
            message: `Minimum length is ${fieldConfig.minLength}`,
          }
        : undefined,
      maxLength: fieldConfig.maxLength
        ? {
            value: fieldConfig.maxLength,
            message: `Maximum length is ${fieldConfig.maxLength}`,
          }
        : undefined,
    },
    defaultValue: fieldConfig.defaultValue || "",
  });

  const inputProps = {
    ...field,
    id: name,
    type: "text" as const,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${name}-error` : undefined,
  };

  return (
    <Field>
      <FieldLabel htmlFor={name}>
        {displayLabel}
        {fieldConfig.required && (
          <span className="text-destructive ml-1">*</span>
        )}
      </FieldLabel>
      <FieldContent>
        <Input {...inputProps} />
        {fieldConfig.description && (
          <FieldDescription>{fieldConfig.description}</FieldDescription>
        )}
        {error && <FieldError>{error.message}</FieldError>}
      </FieldContent>
    </Field>
  );
};
