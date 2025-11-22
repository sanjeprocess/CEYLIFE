/**
 * JSON Schema interfaces for form validation and structure
 */

import type { JSONSchemaType, JSONSchemaFormat } from "./types";

export interface IJSONSchemaProperty {
  type: JSONSchemaType;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  format?: JSONSchemaFormat;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  items?: IJSONSchemaProperty | IJSONSchemaProperty[];
  properties?: Record<string, IJSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean | IJSONSchemaProperty;
  [key: string]: unknown; // Allow additional JSON Schema properties
}

export interface IJSONSchema {
  type: "object";
  properties?: Record<string, IJSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean | IJSONSchemaProperty;
  [key: string]: unknown; // Allow additional JSON Schema properties
}
