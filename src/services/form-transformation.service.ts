import { IFormSubmissionTransform } from "@/common/interfaces/form.interfaces";

export interface TransformationContext {
  value: string;
  variables: Record<string, string>;
}

/**
 * Built-in transformation functions
 */
const builtInTransformations: Record<
  string,
  (value: string, options?: Record<string, unknown>) => string
> = {
  trim: (value: string) => value.trim(),
  lowercase: (value: string) => value.toLowerCase(),
  uppercase: (value: string) => value.toUpperCase(),
  toString: (value: string) => String(value),
  toNumber: (value: string) => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Cannot convert "${value}" to number`);
    }
    return String(num);
  },
  toDate: (value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Cannot parse "${value}" as date`);
    }
    return date.toISOString();
  },
  formatDate: (value: string, options?: Record<string, unknown>) => {
    const date = new Date(value);
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
 * Uses dynamic import for vm2 to avoid Next.js bundling issues
 * @param script - The JavaScript code to execute (should return a string)
 * @param context - The transformation context with value and variables
 * @returns The transformed value
 */
export async function executeCustomScript(
  script: string,
  context: TransformationContext
): Promise<string> {
  try {
    // Dynamically import vm2 to avoid Next.js bundling issues
    // This only loads when custom scripts are actually used
    const { VM } = await import("vm2");

    const vm = new VM({
      timeout: 1000, // 1 second timeout
      sandbox: {
        value: context.value,
        variables: context.variables,
        // Provide safe utility functions
        String: String,
        Number: Number,
        parseInt: parseInt,
        parseFloat: parseFloat,
        Math: Math,
        Date: Date,
      },
    });

    // Wrap the script to ensure it returns a string
    // The script should be a function body that returns a value
    const wrappedScript = `
      (function(value, variables) {
        ${script}
      })(value, variables);
    `;

    const result = vm.run(wrappedScript);

    // Ensure result is a string
    if (typeof result !== "string") {
      return String(result);
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
  value: string
): string {
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
 */
export async function applyTransformation(
  transform: IFormSubmissionTransform | undefined,
  script: string | undefined,
  value: string,
  variables: Record<string, string>
): Promise<string> {
  // If no transformation, return as-is
  if (!transform && !script) {
    return value;
  }

  let result = value;

  // Apply custom script if provided
  if (script) {
    result = await executeCustomScript(script, { value: result, variables });
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

  return result;
}
