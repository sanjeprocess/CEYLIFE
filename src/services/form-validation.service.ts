import { IForm, IFormField } from "@/common/interfaces/form.interfaces";
import { FormValue } from "@/common/types/common.types";
import { evaluateCondition } from "@/services/conditinonal.service";

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
 * Checks if a field should be validated based on its conditional visibility
 * Returns true if field should be validated (visible or no conditional logic), false otherwise
 */
function shouldValidateField(
  field: IFormField,
  fieldKey: string,
  form: IForm,
  formValues: Record<string, FormValue>
): boolean {
  // If field doesn't have dependsOn, always validate (backward compatible)
  if (!field.dependsOn || !field.conditionalOptions) {
    return true;
  }

  const { operator, value: expectedValue } = field.conditionalOptions;

  // If missing operator or expected value, skip validation (safe default)
  if (!operator || expectedValue === undefined || expectedValue === null) {
    console.warn(
      `validateForm: No operator or expected value found for field: ${fieldKey}`
    );
    return false;
  }

  // Get parent field
  const parentField = form.fields[field.dependsOn];
  if (!parentField) {
    console.warn(
      `validateForm: Parent field not found for dependsOn: ${field.dependsOn}`
    );
    return false;
  }

  // Get parent field value
  const actualValue = formValues[field.dependsOn];

  // Evaluate condition using same logic as DependsOnRenderer
  return evaluateCondition(
    operator,
    actualValue,
    expectedValue,
    parentField.type
  );
}

/**
 * Validates dependency fields (nested under a parent field's dependencies property)
 * Only validates fields that are conditionally visible
 */
function validateDependencyFields(
  parentField: IFormField,
  parentKey: string,
  form: IForm,
  formValues: Record<string, FormValue>,
  errors: FieldValidationError[]
): void {
  if (!parentField.dependencies) {
    return;
  }

  for (const [dependencyKey, dependencyField] of Object.entries(
    parentField.dependencies
  )) {
    // Check if dependency field should be visible
    const { operator, value: expectedValue } =
      dependencyField.conditionalOptions ?? {};

    // If no conditional options, always validate
    if (!operator || expectedValue === undefined || expectedValue === null) {
      // Validate the dependency field
      const value = formValues[dependencyKey];
      const fieldLabel = dependencyField.label || dependencyKey;
      const error = validateField(
        dependencyField,
        dependencyKey,
        value,
        fieldLabel
      );
      if (error) {
        errors.push(error);
      }
      // Recursively process nested dependencies
      validateDependencyFields(
        dependencyField,
        dependencyKey,
        form,
        formValues,
        errors
      );
      continue;
    }

    // Get parent field value (the field that this dependency depends on)
    const parentFieldValue = formValues[parentKey];
    const parentFieldType = parentField.type;

    // Evaluate condition using same logic as DependencyRenderer
    const shouldValidate = evaluateCondition(
      operator,
      parentFieldValue,
      expectedValue,
      parentFieldType
    );

    // Only validate if condition is met (field is visible)
    if (shouldValidate) {
      const value = formValues[dependencyKey];
      const fieldLabel = dependencyField.label || dependencyKey;
      const error = validateField(
        dependencyField,
        dependencyKey,
        value,
        fieldLabel
      );
      if (error) {
        errors.push(error);
      }
    }

    // Recursively process nested dependencies
    validateDependencyFields(
      dependencyField,
      dependencyKey,
      form,
      formValues,
      errors
    );
  }
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
    // Check if field should be validated based on conditional visibility
    if (!shouldValidateField(field, fieldKey, form, formValues)) {
      // Skip validation if field is conditionally hidden
      continue;
    }

    const value = formValues[fieldKey];
    const fieldLabel = field.label || fieldKey;

    const error = validateField(field, fieldKey, value, fieldLabel);
    if (error) {
      errors.push(error);
    }

    // Process dependency fields (nested under this field's dependencies property)
    validateDependencyFields(field, fieldKey, form, formValues, errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
