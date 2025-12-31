"use client";

import { useEffect, useMemo, useRef } from "react";

import { IFormAgeField } from "@/common/interfaces/form.interfaces";
import { useFormValue } from "@/hooks/useFormValue.hook";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { replaceVariablesInText } from "@/services/variable-replacement.service";
import useFormStore from "@/stores/form.store";
import { useVariableStore } from "@/stores/variable.store";
import { calculateAge, formatAge } from "@/utils/age-calculation.utils";
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

export function AgeField({
  field,
  name,
}: {
  field: IFormAgeField;
  name: string;
}) {
  const { computedValue, updateValue } = useFormValue(name);
  const translate = useTranslation();
  const rawValues = useFormStore((state) => state.rawValues);
  const getComputedValue = useFormStore((state) => state.getComputedValue);
  const getFieldError = useFormStore((state) => state.getFieldError);
  const hasError = !!getFieldError(name);
  const variables = useVariableStore((state) => state.variables);

  // Get date of birth value from the referenced field
  const dateOfBirthRawValue = rawValues[field.dateOfBirthField];
  const dateOfBirthValue = useMemo(() => {
    if (dateOfBirthRawValue === undefined || dateOfBirthRawValue === null) {
      return null;
    }
    const computed = getComputedValue(field.dateOfBirthField);
    // Type guard: ensure we have a string (date fields should be strings)
    if (typeof computed === "string") {
      return computed;
    }
    // If it's a number, convert to string (shouldn't happen for date fields, but handle it)
    if (typeof computed === "number") {
      return String(computed);
    }
    // For any other type (boolean, arrays, File, etc.), return null
    return null;
  }, [getComputedValue, field.dateOfBirthField, dateOfBirthRawValue]);

  // Resolve toDate (supports variables like {{$today}})
  const toDateString = useMemo(() => {
    if (!field.toDate) {
      // For default (now), use current date ISO string
      return new Date().toISOString();
    }
    const resolved = replaceVariablesInText(field.toDate, variables, {
      keepUnresolved: false,
      warnOnMissing: false,
    });
    // Convert resolved string to Date object and get ISO string
    const dateValue = resolved ? new Date(resolved) : new Date();
    // Validate the date
    if (isNaN(dateValue.getTime())) {
      return new Date().toISOString(); // Fallback to current date if invalid
    }
    return dateValue.toISOString();
  }, [field.toDate, variables]);

  // Convert string back to Date for calculation
  const toDateValue = useMemo(() => new Date(toDateString), [toDateString]);

  // Track previous computed value to avoid unnecessary updates
  const previousComputedValueRef = useRef<string | null>(null);

  // Calculate and format age when date of birth changes
  useEffect(() => {
    if (!dateOfBirthValue) {
      if (previousComputedValueRef.current !== "") {
        updateValue("");
        previousComputedValueRef.current = "";
      }
      return;
    }

    const age = calculateAge(dateOfBirthValue, toDateValue);
    if (!age) {
      if (previousComputedValueRef.current !== "") {
        updateValue("");
        previousComputedValueRef.current = "";
      }
      return;
    }

    const formattedAge = formatAge(age, field.format || "{y}");
    // Only update if the value actually changed
    if (previousComputedValueRef.current !== formattedAge) {
      updateValue(formattedAge);
      previousComputedValueRef.current = formattedAge;
    }
  }, [dateOfBirthValue, toDateString, field.format, updateValue, toDateValue]);

  const value =
    computedValue !== undefined && computedValue !== null
      ? (computedValue as string)
      : "";

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
          type="text"
          name={name}
          value={value}
          placeholder={placeholder}
          required={field.required}
          readOnly
          className="bg-muted cursor-not-allowed"
          aria-invalid={hasError}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}
