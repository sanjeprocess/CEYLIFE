/**
 * Main Form Data Interface
 * Combines JSON Schema and UI layout configurations
 */

import type { IJSONSchema } from "./jsonSchema.interface";
import type { IFormUI } from "./layout.interface";

export interface IFormData {
  formId: string;
  formName: string;
  schema: IJSONSchema;
  customComponent?: boolean;
  ui: IFormUI;
  [key: string]: unknown; // Allow additional form-level properties
}
