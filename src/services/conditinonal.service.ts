import { FieldType, FormConditionalOperator } from "@/common/types/form.types";

export function normalizeValueForConditions(
  value: unknown,
  fieldType: FieldType
): number {
  // Handle null, undefined, and empty values
  if (value === null || value === undefined) {
    return 0;
  }

  switch (fieldType) {
    case "text":
    case "email":
    case "password":
    case "textarea":
    case "tel":
    case "url":
      const strValue = String(value);
      return strValue.length;
    case "date":
    case "datetime-local":
      try {
        const dateValue = new Date(value as string | number | Date);
        return isNaN(dateValue.getTime()) ? 0 : dateValue.getTime();
      } catch {
        return 0;
      }
    case "time":
      // Parse the time as "HH:MM" or "HH:MM:SS", fallback to 0 if invalid
      if (typeof value === "string") {
        const [h, m = "0", s = "0"] = value.split(":");
        const hours = Number(h);
        const mins = Number(m);
        const secs = Number(s);
        if (!isNaN(hours) && !isNaN(mins) && !isNaN(secs)) {
          return hours * 3600 + mins * 60 + secs;
        }
      }
      return 0;
    case "checkbox":
      // Boolean values: true = 1, false = 0
      if (typeof value === "boolean") {
        return value ? 1 : 0;
      }
      // String representations
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        if (lower === "true" || lower === "1" || lower === "yes") return 1;
        if (lower === "false" || lower === "0" || lower === "no") return 0;
      }
      // Number: 0 = false, non-zero = true
      if (typeof value === "number") {
        return value ? 1 : 0;
      }
      return 0;
    case "select":
    case "radio-group":
      // For select/radio, compare as strings for equality, but normalize to number for numeric ops
      const strVal = String(value);
      const numAttempt = Number(value);
      return isNaN(numAttempt) ? strVal.length : numAttempt;
    case "number":
      const attempt = Number(value);
      return isNaN(attempt) ? 0 : attempt;
    case "age":
      // Age fields contain formatted strings, treat as text
      // Try to parse as number first (for simple formats like "{y}")
      const ageNumAttempt = Number(value);
      if (!isNaN(ageNumAttempt)) {
        return ageNumAttempt;
      }
      // Fall back to string length for formatted strings
      return String(value).length;
    default:
      return 0;
  }
}

export function evaluateCondition(
  operator: FormConditionalOperator,
  actualValue: unknown,
  expectedValue: unknown,
  fieldType: FieldType
): boolean {
  // Handle null/undefined actual values
  if (actualValue === null || actualValue === undefined) {
    // For equality checks, null/undefined should match null/undefined expected
    if (operator === "eq") {
      return expectedValue === null || expectedValue === undefined;
    }
    if (operator === "neq") {
      return expectedValue !== null && expectedValue !== undefined;
    }
    // For other operators, null/undefined fails the condition
    return false;
  }

  // String operators: use raw string comparison
  const stringOperators: FormConditionalOperator[] = [
    "contains",
    "notContains",
    "startsWith",
    "endsWith",
  ];

  if (stringOperators.includes(operator)) {
    const actualStr = String(actualValue);
    const expectedStr = String(expectedValue);

    switch (operator) {
      case "contains":
        return actualStr.includes(expectedStr);
      case "notContains":
        return !actualStr.includes(expectedStr);
      case "startsWith":
        return actualStr.startsWith(expectedStr);
      case "endsWith":
        return actualStr.endsWith(expectedStr);
      default:
        return false;
    }
  }

  // Numeric operators: use normalized number comparison
  const actualNormalized = normalizeValueForConditions(actualValue, fieldType);
  const expectedNormalized = normalizeValueForConditions(
    expectedValue,
    fieldType
  );

  switch (operator) {
    case "eq":
      // For checkbox/boolean fields, also check direct equality
      if (fieldType === "checkbox") {
        const actualBool =
          typeof actualValue === "boolean"
            ? actualValue
            : String(actualValue).toLowerCase() === "true" ||
              String(actualValue) === "1" ||
              String(actualValue).toLowerCase() === "yes";
        const expectedBool =
          typeof expectedValue === "boolean"
            ? expectedValue
            : String(expectedValue).toLowerCase() === "true" ||
              String(expectedValue) === "1" ||
              String(expectedValue).toLowerCase() === "yes";
        return actualBool === expectedBool;
      }
      // For select/radio-group, compare as strings
      if (fieldType === "select" || fieldType === "radio-group") {
        return String(actualValue) === String(expectedValue);
      }
      return actualNormalized === expectedNormalized;
    case "neq":
      // For checkbox/boolean fields, also check direct inequality
      if (fieldType === "checkbox") {
        const actualBool =
          typeof actualValue === "boolean"
            ? actualValue
            : String(actualValue).toLowerCase() === "true" ||
              String(actualValue) === "1" ||
              String(actualValue).toLowerCase() === "yes";
        const expectedBool =
          typeof expectedValue === "boolean"
            ? expectedValue
            : String(expectedValue).toLowerCase() === "true" ||
              String(expectedValue) === "1" ||
              String(expectedValue).toLowerCase() === "yes";
        return actualBool !== expectedBool;
      }
      // For select/radio-group, compare as strings
      if (fieldType === "select" || fieldType === "radio-group") {
        return String(actualValue) !== String(expectedValue);
      }
      return actualNormalized !== expectedNormalized;
    case "gt":
      return actualNormalized > expectedNormalized;
    case "gte":
      return actualNormalized >= expectedNormalized;
    case "lt":
      return actualNormalized < expectedNormalized;
    case "lte":
      return actualNormalized <= expectedNormalized;
    default:
      return false;
  }
}
