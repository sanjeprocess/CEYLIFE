import { IForm, IFormField } from "@/common/interfaces/form.interfaces";
import { FormValue } from "@/common/types/common.types";

export interface FieldValidationError {
  fieldKey: string;
  fieldLabel: string;
  error: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
}

/**
 * Validates if a value is empty (for required field checks)
 */
function isEmpty(value: FormValue): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string" && value.trim() === "") {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  return false;
}

/**
 * Validates required field
 */
function validateRequired(value: FormValue, fieldLabel: string): string | null {
  if (isEmpty(value)) {
    return `${fieldLabel} is required`;
  }
  return null;
}

/**
 * Validates min/max for number fields
 */
function validateMinMax(
  value: FormValue,
  min: number | undefined,
  max: number | undefined,
  fieldLabel: string
): string | null {
  if (value === null || value === undefined || value === "") {
    return null; // Skip if empty (handled by required validation)
  }

  const numValue = typeof value === "number" ? value : Number(value);
  if (isNaN(numValue)) {
    return null; // Skip if not a number (handled by type validation)
  }

  if (min !== undefined && numValue < min) {
    return `${fieldLabel} must be at least ${min}`;
  }
  if (max !== undefined && numValue > max) {
    return `${fieldLabel} must be at most ${max}`;
  }
  return null;
}

/**
 * Validates minLength/maxLength for string and array fields
 */
function validateLength(
  value: FormValue,
  minLength: number | undefined,
  maxLength: number | undefined,
  fieldLabel: string
): string | null {
  if (value === null || value === undefined || value === "") {
    return null; // Skip if empty (handled by required validation)
  }

  let length: number;
  if (typeof value === "string") {
    length = value.length;
  } else if (Array.isArray(value)) {
    length = value.length;
  } else {
    return null; // Not a string or array, skip
  }

  if (minLength !== undefined && length < minLength) {
    return `${fieldLabel} must be at least ${minLength} character${minLength !== 1 ? "s" : ""}`;
  }
  if (maxLength !== undefined && length > maxLength) {
    return `${fieldLabel} must be at most ${maxLength} character${maxLength !== 1 ? "s" : ""}`;
  }
  return null;
}

/**
 * Validates pattern (regex) for string fields
 */
function validatePattern(
  value: FormValue,
  pattern: string | undefined,
  fieldLabel: string
): string | null {
  if (!pattern) {
    return null;
  }
  if (value === null || value === undefined || value === "") {
    return null; // Skip if empty (handled by required validation)
  }
  if (typeof value !== "string") {
    return null; // Pattern only applies to strings
  }

  try {
    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
      return `${fieldLabel} format is invalid`;
    }
  } catch {
    // Invalid regex pattern, skip validation
    console.warn(`Invalid regex pattern for ${fieldLabel}: ${pattern}`);
    return null;
  }
  return null;
}

/**
 * Validates email format
 */
function validateEmail(value: FormValue, fieldLabel: string): string | null {
  if (value === null || value === undefined || value === "") {
    return null; // Skip if empty (handled by required validation)
  }
  if (typeof value !== "string") {
    return null;
  }

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(value)) {
    return `${fieldLabel} must be a valid email address`;
  }
  return null;
}

/**
 * Validates URL format
 */
function validateUrl(value: FormValue, fieldLabel: string): string | null {
  if (value === null || value === undefined || value === "") {
    return null; // Skip if empty (handled by required validation)
  }
  if (typeof value !== "string") {
    return null;
  }

  try {
    new URL(value);
  } catch {
    return `${fieldLabel} must be a valid URL`;
  }
  return null;
}

/**
 * Validates tel format (basic validation - allows common phone number formats)
 */
function validateTel(value: FormValue, fieldLabel: string): string | null {
  if (value === null || value === undefined || value === "") {
    return null; // Skip if empty (handled by required validation)
  }
  if (typeof value !== "string") {
    return null;
  }

  // Basic tel validation - allows digits, spaces, dashes, plus, parentheses
  const telRegex = /^[\d\s\-\+\(\)]+$/;
  if (!telRegex.test(value)) {
    return `${fieldLabel} must be a valid phone number`;
  }
  return null;
}

/**
 * Validates a single field based on its configuration
 */
export function validateField(
  field: IFormField,
  fieldKey: string,
  value: FormValue,
  fieldLabel: string
): FieldValidationError | null {
  const errors: string[] = [];

  // Validate required
  if (field.required) {
    // Special handling for checkboxes: required checkbox must be checked (true)
    if (field.type === "checkbox") {
      if (value !== true) {
        const requiredError = `${fieldLabel} must be checked`;
        return {
          fieldKey,
          fieldLabel,
          error: requiredError,
        };
      }
    } else {
      const requiredError = validateRequired(value, fieldLabel);
      if (requiredError) {
        errors.push(requiredError);
        // If required field is empty, skip other validations
        return {
          fieldKey,
          fieldLabel,
          error: requiredError,
        };
      }
    }
  }

  // Skip other validations if value is empty and not required
  // Note: For checkboxes, false is a valid value (unchecked), not empty
  if (field.type !== "checkbox" && isEmpty(value)) {
    return null;
  }

  const validation = field.validation;
  if (!validation) {
    return null;
  }

  // Validate based on field type
  switch (field.type) {
    case "number":
      const minMaxError = validateMinMax(
        value,
        validation.min,
        validation.max,
        fieldLabel
      );
      if (minMaxError) errors.push(minMaxError);
      break;

    case "email":
      const emailError = validateEmail(value, fieldLabel);
      if (emailError) errors.push(emailError);
      // Also check length if specified
      if (validation.minLength || validation.maxLength) {
        const lengthError = validateLength(
          value,
          validation.minLength,
          validation.maxLength,
          fieldLabel
        );
        if (lengthError) errors.push(lengthError);
      }
      // Also check pattern if specified
      if (validation.pattern) {
        const patternError = validatePattern(
          value,
          validation.pattern,
          fieldLabel
        );
        if (patternError) errors.push(patternError);
      }
      break;

    case "url":
      const urlError = validateUrl(value, fieldLabel);
      if (urlError) errors.push(urlError);
      // Also check length if specified
      if (validation.minLength || validation.maxLength) {
        const lengthError = validateLength(
          value,
          validation.minLength,
          validation.maxLength,
          fieldLabel
        );
        if (lengthError) errors.push(lengthError);
      }
      // Also check pattern if specified
      if (validation.pattern) {
        const patternError = validatePattern(
          value,
          validation.pattern,
          fieldLabel
        );
        if (patternError) errors.push(patternError);
      }
      break;

    case "tel":
      const telError = validateTel(value, fieldLabel);
      if (telError) errors.push(telError);
      // Also check length if specified
      if (validation.minLength || validation.maxLength) {
        const lengthError = validateLength(
          value,
          validation.minLength,
          validation.maxLength,
          fieldLabel
        );
        if (lengthError) errors.push(lengthError);
      }
      // Also check pattern if specified
      if (validation.pattern) {
        const patternError = validatePattern(
          value,
          validation.pattern,
          fieldLabel
        );
        if (patternError) errors.push(patternError);
      }
      break;

    case "text":
    case "password":
    case "textarea":
    case "date":
    case "time":
    case "datetime-local":
      // String-based fields
      if (validation.minLength || validation.maxLength) {
        const lengthError = validateLength(
          value,
          validation.minLength,
          validation.maxLength,
          fieldLabel
        );
        if (lengthError) errors.push(lengthError);
      }
      if (validation.pattern) {
        const patternError = validatePattern(
          value,
          validation.pattern,
          fieldLabel
        );
        if (patternError) errors.push(patternError);
      }
      // For number-like text fields, also check min/max if specified
      if (validation.min !== undefined || validation.max !== undefined) {
        const numValue = typeof value === "number" ? value : Number(value);
        if (!isNaN(numValue)) {
          const minMaxError = validateMinMax(
            value,
            validation.min,
            validation.max,
            fieldLabel
          );
          if (minMaxError) errors.push(minMaxError);
        }
      }
      break;

    case "checkbox-group":
      // Array-based fields
      if (validation.minLength || validation.maxLength) {
        const lengthError = validateLength(
          value,
          validation.minLength,
          validation.maxLength,
          fieldLabel
        );
        if (lengthError) errors.push(lengthError);
      }
      break;

    case "checkbox":
    case "radio-group":
    case "select":
    case "file":
      // These field types don't typically use validation rules
      // but we can still check min/max for numeric values if needed
      if (validation.min !== undefined || validation.max !== undefined) {
        const numValue = typeof value === "number" ? value : Number(value);
        if (!isNaN(numValue)) {
          const minMaxError = validateMinMax(
            value,
            validation.min,
            validation.max,
            fieldLabel
          );
          if (minMaxError) errors.push(minMaxError);
        }
      }
      break;
  }

  if (errors.length > 0) {
    return {
      fieldKey,
      fieldLabel,
      error: errors[0], // Return first error
    };
  }

  return null;
}

/**
 * Validates an entire form based on field configurations and values
 */
export function validateForm(
  form: IForm,
  formValues: Record<string, FormValue>
): FormValidationResult {
  const errors: FieldValidationError[] = [];

  for (const [fieldKey, field] of Object.entries(form.fields)) {
    const value = formValues[fieldKey];
    const fieldLabel = field.label || fieldKey;

    const error = validateField(field, fieldKey, value, fieldLabel);
    if (error) {
      errors.push(error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
