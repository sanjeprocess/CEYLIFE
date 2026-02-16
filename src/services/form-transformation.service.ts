import { IFormSubmissionTransform } from "@/common/interfaces/form.interfaces";

export interface TransformationContext {
  value: unknown;
  variables: Record<string, string>;
}

/**
 * Checks if a value is JSON-serializable (safe for request body)
 */
function isJsonSerializable(value: unknown): boolean {
  if (value === null) {
    return true;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonSerializable(item));
  }

  if (typeof value === "object") {
    return Object.values(value).every((val) => isJsonSerializable(val));
  }

  // Reject functions, undefined, symbols, BigInt
  return false;
}

/**
 * Validates if a value matches the expected return type
 */
function validateReturnType(value: unknown, expectedType: string): boolean {
  if (expectedType === "any") {
    return true;
  }

  switch (expectedType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !isNaN(value);
    case "boolean":
      return typeof value === "boolean";
    case "array":
      return Array.isArray(value);
    case "object":
      return (
        typeof value === "object" && value !== null && !Array.isArray(value)
      );
    case "json":
      return typeof value === "string";
    default:
      return false;
  }
}

/**
 * Safely coerces a value to the target type if compatible
 */
function coerceToType(value: unknown, targetType: string): unknown {
  if (targetType === "any" || validateReturnType(value, targetType)) {
    return value;
  }

  switch (targetType) {
    case "number":
      if (typeof value === "string") {
        const num = Number(value);
        if (!isNaN(num)) {
          return num;
        }
      }
      break;
    case "boolean":
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        if (lower === "true" || lower === "1" || lower === "yes") {
          return true;
        }
        if (
          lower === "false" ||
          lower === "0" ||
          lower === "no" ||
          lower === ""
        ) {
          return false;
        }
      }
      if (typeof value === "number") {
        return value !== 0;
      }
      break;
    case "string":
      return String(value);
    case "array":
      if (typeof value === "string") {
        // Try to parse as JSON array, otherwise split by comma
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          // Not valid JSON, split by comma
          return value
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s);
        }
      }
      if (!Array.isArray(value)) {
        return [value];
      }
      break;
    case "json":
      // Serialize value to JSON string
      try {
        return JSON.stringify(value);
      } catch (error) {
        console.warn("[Form Transformation] Failed to serialize value to JSON:", error);
        return String(value);
      }
      break;
  }

  return value;
}

/**
 * Built-in transformation functions
 */
const builtInTransformations: Record<
  string,
  (value: unknown, options?: Record<string, unknown>) => unknown
> = {
  trim: (value: unknown) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return String(value).trim();
  },
  lowercase: (value: unknown) => {
    if (typeof value === "string") {
      return value.toLowerCase();
    }
    return String(value).toLowerCase();
  },
  uppercase: (value: unknown) => {
    if (typeof value === "string") {
      return value.toUpperCase();
    }
    return String(value).toUpperCase();
  },
  toString: (value: unknown) => String(value),
  toNumber: (value: unknown) => {
    const num = typeof value === "number" ? value : Number(value);
    if (isNaN(num)) {
      throw new Error(`Cannot convert "${value}" to number`);
    }
    return num;
  },
  toBoolean: (value: unknown) => {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      return lower === "true" || lower === "1" || lower === "yes";
    }
    if (typeof value === "number") {
      return value !== 0;
    }
    return Boolean(value);
  },
  toArray: (value: unknown, options?: Record<string, unknown>) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      const delimiter = (options?.delimiter as string) || ",";
      return value
        .split(delimiter)
        .map((s) => s.trim())
        .filter((s) => s);
    }
    return [value];
  },
  toDate: (value: unknown) => {
    const date = value instanceof Date ? value : new Date(String(value));
    if (isNaN(date.getTime())) {
      throw new Error(`Cannot parse "${value}" as date`);
    }
    return date.toISOString();
  },
  toJson: (value: unknown) => {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw new Error(`Cannot serialize value to JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
  formatDate: (value: unknown, options?: Record<string, unknown>) => {
    const date = value instanceof Date ? value : new Date(String(value));
    if (isNaN(date.getTime())) {
      throw new Error(`Cannot parse "${value}" as date`);
    }

    const format = (options?.format as string) || "YYYY-MM-DD";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return format
      .replace("YYYY", String(year))
      .replace("MM", month)
      .replace("DD", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);
  },
};

/**
 * Executes a custom JavaScript transformation in a sandboxed environment
 * Uses Node.js built-in vm module for secure script execution
 * @param script - The JavaScript code to execute
 * @param context - The transformation context with value and variables
 * @param expectedReturnType - Optional expected return type for validation
 * @returns The transformed value (can be any JSON-serializable type)
 */
export async function executeCustomScript(
  script: string,
  context: TransformationContext,
  expectedReturnType?: string
): Promise<unknown> {
  try {
    // Use Node.js built-in vm module - no external dependencies, no WASM issues
    const vm = await import("node:vm");

    // Create a sandbox with only the necessary context
    // This provides isolation while avoiding the complexity of WASM/native modules
    const sandbox = {
      value: context.value,
      variables: context.variables,
      // Provide safe utility functions
      String: String,
      Number: Number,
      parseInt: parseInt,
      parseFloat: parseFloat,
      Math: Math,
      Date: Date,
      Array: Array,
      Object: Object,
      JSON: JSON,
      // String methods
      RegExp: RegExp,
    };

    // Wrap the script to ensure it returns a value
    // The script should be a function body that returns a value
    const wrappedScript = `
      (function(value, variables) {
        ${script}
      })(value, variables);
    `;

    // Execute the script with timeout (1 second) and strict context
    const result = vm.runInNewContext(wrappedScript, sandbox, {
      timeout: 1000,
      displayErrors: true,
    });

    // Validate that result is JSON-serializable
    if (!isJsonSerializable(result)) {
      throw new Error(
        "Transformation result is not JSON-serializable. Cannot return functions, undefined, symbols, or BigInt."
      );
    }

      // Validate return type if specified
      if (expectedReturnType && expectedReturnType !== "any") {
        let validatedResult = result;

        // Try to coerce to expected type if not already matching
        if (!validateReturnType(result, expectedReturnType)) {
          validatedResult = coerceToType(result, expectedReturnType);

          // If coercion didn't work, throw error with more context
          if (!validateReturnType(validatedResult, expectedReturnType)) {
            const valueType = Array.isArray(result) 
              ? "array" 
              : result === null 
                ? "null" 
                : typeof result;
            const valuePreview = typeof result === "object" && result !== null
              ? JSON.stringify(result).substring(0, 100)
              : String(result).substring(0, 100);
            throw new Error(
              `Transformation result type mismatch. Expected ${expectedReturnType}, got ${valueType}. Value: ${valuePreview}${valuePreview.length >= 100 ? "..." : ""}`
            );
          }
        }

        return validatedResult;
      }

    return result;
  } catch (error) {
    console.error(
      "[Form Transformation] Custom script execution failed:",
      error
    );
    throw new Error(
      `Custom transformation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Applies a single transformation to a value
 */
function applySingleTransformation(
  transform: string | { name: string; options?: Record<string, unknown> },
  value: unknown
): unknown {
  let transformName: string;
  let options: Record<string, unknown> | undefined;

  if (typeof transform === "string") {
    transformName = transform;
  } else {
    transformName = transform.name;
    options = transform.options;
  }

  // Check if it's a built-in transformation
  if (transformName in builtInTransformations) {
    return builtInTransformations[transformName](value, options);
  }

  throw new Error(`Unknown transformation: ${transformName}`);
}

/**
 * Applies transformations to a value
 * Supports:
 * - Single transformation: "trim"
 * - Array of transformations: ["trim", "lowercase"]
 * - Transformation with options: { name: "formatDate", options: { format: "YYYY-MM-DD" } }
 * - Custom script: script string in fieldMapping
 * @param transform - Built-in transformation(s) to apply
 * @param script - Custom script to execute
 * @param value - Input value (can be any type)
 * @param variables - Form variables
 * @param expectedReturnType - Optional expected return type for validation
 * @returns Transformed value (can be any JSON-serializable type)
 */
export async function applyTransformation(
  transform: IFormSubmissionTransform | undefined,
  script: string | undefined,
  value: unknown,
  variables: Record<string, string>,
  expectedReturnType?: string
): Promise<unknown> {
  // If no transformation, return as-is (but validate type if expected)
  if (!transform && !script) {
    if (expectedReturnType && expectedReturnType !== "any") {
      const coerced = coerceToType(value, expectedReturnType);
      if (!validateReturnType(coerced, expectedReturnType)) {
        throw new Error(
          `Value type mismatch. Expected ${expectedReturnType}, got ${typeof value}${Array.isArray(value) ? " (array)" : ""}`
        );
      }
      return coerced;
    }
    return value;
  }

  let result = value;

  // Apply custom script if provided
  if (script) {
    result = await executeCustomScript(
      script,
      { value: result, variables },
      expectedReturnType
    );
  }

  // Apply built-in transformations
  if (transform) {
    if (typeof transform === "string") {
      // Single transformation
      result = applySingleTransformation(transform, result);
    } else if (Array.isArray(transform)) {
      // Chain of transformations
      for (const t of transform) {
        result = applySingleTransformation(t, result);
      }
    } else if (typeof transform === "object" && "name" in transform) {
      // Transformation with options
      result = applySingleTransformation(transform, result);
    }
  }

  // Final validation against expected return type
  if (expectedReturnType && expectedReturnType !== "any") {
    if (!validateReturnType(result, expectedReturnType)) {
      const coerced = coerceToType(result, expectedReturnType);
      if (!validateReturnType(coerced, expectedReturnType)) {
        throw new Error(
          `Transformation result type mismatch. Expected ${expectedReturnType}, got ${typeof result}${Array.isArray(result) ? " (array)" : ""}`
        );
      }
      return coerced;
    }
  }

  // Ensure result is JSON-serializable
  if (!isJsonSerializable(result)) {
    throw new Error(
      "Transformation result is not JSON-serializable. Cannot return functions, undefined, symbols, or BigInt."
    );
  }

  return result;
}
