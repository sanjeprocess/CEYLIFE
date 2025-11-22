import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { IJSONSchema } from "@/common/interfaces/formData";

/**
 * Create and configure AJV instance with format validators
 */
export function createAjvInstance() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
}

/**
 * Compile a JSON Schema validator
 */
export function compileSchemaValidator(schema: IJSONSchema) {
  const ajv = createAjvInstance();
  return ajv.compile(schema);
}

/**
 * Validate data against a JSON Schema
 * Returns validation result with errors
 */
export function validateAgainstSchema(
  schema: IJSONSchema,
  data: unknown
): { valid: boolean; errors: Array<{ path: string; message: string }> } {
  const validate = compileSchemaValidator(schema);
  const valid = validate(data);

  if (!valid && validate.errors) {
    const errors = validate.errors.map((error) => ({
      path: error.instancePath || error.params?.missingProperty || "",
      message: error.message || "Validation error",
    }));
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Get field-level validation errors for a specific field
 */
export function getFieldErrors(
  schema: IJSONSchema,
  data: unknown,
  fieldName: string
): string[] {
  const result = validateAgainstSchema(schema, data);
  return result.errors
    .filter((error) => {
      // Match errors for this field (e.g., "/proposers_name" or "proposers_name")
      const path = error.path.replace(/^\//, "");
      return path === fieldName || path.endsWith(`/${fieldName}`);
    })
    .map((error) => error.message);
}

