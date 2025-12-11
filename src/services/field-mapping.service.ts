import { IFormSubmissionFieldMapping } from "@/common/interfaces/form.interfaces";
import { setValueByPath } from "@/utils/path.utils";

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
    let sourceValue: string | undefined;

    // Determine source value based on 'from' field
    if (Array.isArray(mapping.from)) {
      // Multiple fields - combine them (for future use)
      sourceValue = mapping.from
        .map((field) => {
          const val = formValues[field];
          return val !== undefined && val !== null ? String(val) : "";
        })
        .join(" ");
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
      // Form field value
      const formValue = formValues[mapping.from];
      if (formValue === undefined || formValue === null) {
        // Skip if field value is not present
        continue;
      }
      sourceValue = String(formValue);
    }

    // Apply transformations if provided
    if (sourceValue !== undefined) {
      const transformedValue = await applyTransformation(
        mapping.transform,
        mapping.script,
        sourceValue,
        variables
      );

      // Set value at the specified path in the body
      // setValueByPath returns a new object with all previous values + the new value at the path
      body = setValueByPath(body, mapping.to, transformedValue);
    }
  }

  return body;
}
