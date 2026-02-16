import { IFormSubmissionFieldMapping } from "@/common/interfaces/form.interfaces";
import { setValueByPath, getValueByPath } from "@/utils/path.utils";

import { applyTransformation } from "./form-transformation.service";
import { replaceVariablesInTextWithRuntime } from "./variable-replacement.service";

/**
 * Maps form fields to request body structure based on fieldMapping configuration
 * @param fieldMapping - Array of field mapping configurations
 * @param formValues - Current form field values
 * @param variables - Form variables (for $variable sources)
 * @param runtimeVariables - Runtime variables (like $WORKHUB_TOKEN)
 * @returns The mapped request body object
 */
export async function mapFieldsToBody(
  fieldMapping: IFormSubmissionFieldMapping[],
  formValues: Record<string, unknown>,
  variables: Record<string, string>,
  runtimeVariables: Record<string, string>
): Promise<Record<string, unknown>> {
  let body: Record<string, unknown> = {};

  for (const mapping of fieldMapping) {
    let sourceValue: unknown;

    // Determine source value based on 'from' field
    if (Array.isArray(mapping.from)) {
      // Multiple fields - combine them as array or join based on returnType
      const values = mapping.from
        .map((field) => {
          const val = formValues[field];
          return val !== undefined && val !== null ? val : null;
        })
        .filter((val) => val !== null);

      // If returnType is array, keep as array; otherwise join as string
      if (mapping.returnType === "array") {
        sourceValue = values;
      } else {
        sourceValue = values.map((val) => String(val)).join(" ");
      }
    } else if (mapping.from === "$static") {
      // Static value from 'value' field
      if (!mapping.value) {
        console.warn(
          `[Field Mapping] $static mapping missing 'value' field for path: ${mapping.to}`
        );
        continue;
      }
      sourceValue = replaceVariablesInTextWithRuntime(
        mapping.value,
        variables,
        runtimeVariables
      );
    } else if (mapping.from === "$variable") {
      // Variable value from 'value' field
      if (!mapping.value) {
        console.warn(
          `[Field Mapping] $variable mapping missing 'value' field for path: ${mapping.to}`
        );
        continue;
      }
      sourceValue = replaceVariablesInTextWithRuntime(
        mapping.value,
        variables,
        runtimeVariables
      );
    } else {
      // Form field value - handle table field paths with wildcards
      const fromPath = mapping.from;
      
      // Check for wildcard pattern: fieldName[*].columnKey
      // Use non-greedy match to ensure we capture the field name correctly
      const wildcardMatch = fromPath.match(/^([^[\]]+)\[(\*)\]\.(.+)$/);
      if (wildcardMatch) {
        const [, fieldName, , columnKey] = wildcardMatch;
        const tableValue = formValues[fieldName];
        
        if (Array.isArray(tableValue) && tableValue.length > 0) {
          // Extract all values of the specified column
          sourceValue = (tableValue as Record<string, unknown>[])
            .map((row) => row?.[columnKey])
            .filter((val) => val !== undefined && val !== null);
        } else {
          // Empty table or not an array - return empty array for array returnType, otherwise skip
          if (mapping.returnType === "array") {
            sourceValue = [];
          } else {
            continue;
          }
        }
      } else if (fromPath.includes("[") && fromPath.includes("]")) {
        // Handle indexed path: fieldName[0].columnKey
        // Use getValueByPath to extract the value
        const fieldName = fromPath.split("[")[0];
        const restOfPath = fromPath.substring(fieldName.length);
        const fieldValue = formValues[fieldName];
        
        if (fieldValue !== undefined && fieldValue !== null) {
          sourceValue = getValueByPath(fieldValue, restOfPath);
          // If path resolution returns undefined, skip this mapping
          if (sourceValue === undefined) {
            continue;
          }
        } else {
          continue;
        }
      } else {
        // Regular field value - keep original type
        const formValue = formValues[fromPath];
        if (formValue === undefined || formValue === null) {
          // Skip if field value is not present
          continue;
        }
        sourceValue = formValue;
      }
    }

    // Apply transformations if provided
    if (sourceValue !== undefined && sourceValue !== null) {
      try {
        // Basic type check before transformation - if returnType is specified and source is clearly wrong type, skip
        if (mapping.returnType && mapping.returnType !== "any") {
          const sourceType = Array.isArray(sourceValue) 
            ? "array" 
            : typeof sourceValue;
          
          // If source is an object/array but returnType expects a primitive, and no script/transform to convert it, warn
          if (
            (mapping.returnType === "string" || mapping.returnType === "number" || mapping.returnType === "boolean") &&
            (sourceType === "object" && !Array.isArray(sourceValue)) &&
            !mapping.script &&
            !mapping.transform
          ) {
            console.warn(
              `[Field Mapping] Type mismatch for "${mapping.from}" -> "${mapping.to}": source is object but returnType is ${mapping.returnType}. Skipping.`
            );
            continue;
          }
        }

        const transformedValue = await applyTransformation(
          mapping.transform,
          mapping.script,
          sourceValue,
          variables,
          mapping.returnType
        );

        // Set value at the specified path in the body
        // setValueByPath returns a new object with all previous values + the new value at the path
        body = setValueByPath(body, mapping.to, transformedValue);
      } catch (error) {
        // Log error but don't fail entire submission
        console.error(
          `[Field Mapping] Failed to map field "${mapping.from}" to "${mapping.to}":`,
          error instanceof Error ? error.message : error
        );
        // Skip this mapping and continue with others
        continue;
      }
    }
  }

  return body;
}
