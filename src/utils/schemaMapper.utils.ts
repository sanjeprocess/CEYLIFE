import type { IJSONSchemaProperty } from "@/common/interfaces/formData";

/**
 * Map JSON Schema format to HTML input type
 */
export function mapFormatToInputType(
  format?: string
): "text" | "email" | "date" | "datetime-local" | "time" | "url" | "tel" {
  switch (format) {
    case "email":
      return "email";
    case "date":
      return "date";
    case "date-time":
      return "datetime-local";
    case "time":
      return "time";
    case "uri":
    case "url":
      return "url";
    case "ipv4":
    case "ipv6":
      return "text";
    default:
      return "text";
  }
}

/**
 * Get field configuration from JSON Schema property
 */
export interface FieldConfig {
  label?: string;
  description?: string;
  required: boolean;
  inputType: "text" | "email" | "date" | "datetime-local" | "time" | "url" | "tel" | "number" | "textarea" | "checkbox";
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  defaultValue?: unknown;
}

export function getFieldConfig(
  property: IJSONSchemaProperty,
  isRequired: boolean
): FieldConfig {
  const config: FieldConfig = {
    required: isRequired,
    inputType: "text",
    label: property.title,
    description: property.description,
    defaultValue: property.default,
  };

  // Map type to input type
  switch (property.type) {
    case "string":
      if (property.format) {
        config.inputType = mapFormatToInputType(property.format);
      } else {
        config.inputType = "text";
      }
      // Check if it should be a textarea (long text)
      if (property.maxLength && property.maxLength > 100) {
        config.inputType = "textarea";
      }
      break;
    case "number":
      config.inputType = "number";
      break;
    case "boolean":
      config.inputType = "checkbox";
      break;
    default:
      config.inputType = "text";
  }

  // Add validation constraints
  if (property.pattern) {
    config.pattern = property.pattern;
  }
  if (property.minLength !== undefined) {
    config.minLength = property.minLength;
  }
  if (property.maxLength !== undefined) {
    config.maxLength = property.maxLength;
  }
  if (property.minimum !== undefined) {
    config.minimum = property.minimum;
  }
  if (property.maximum !== undefined) {
    config.maximum = property.maximum;
  }

  return config;
}

