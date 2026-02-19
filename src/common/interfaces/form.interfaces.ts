import { HttpMethod } from "@/common/types/common.types";
import {
  FieldType,
  FormConditionalOperator,
  FormLayoutItemAlign,
  FormLayoutItemType,
  FormRadioGroupOrientation,
  FormVersion,
  Locale,
} from "@/common/types/form.types";

export interface IForm {
  metadata: IFormMetadata;
  otp?: IFormOtp;
  submission: IFormSubmission;
  fields: Record<string, IFormField>;
  layout: IFormLayoutItem[];
  localization: Record<Locale, Record<string, string>>; // based on json keys (eg: "fields.name.label" -> "Name")
}

// OTP Header configuration for API requests
export interface IFormOtpHeader {
  name: string;
  value: string;
}

// OTP Query parameter configuration for API requests
export interface IFormOtpQueryParam {
  name: string;
  value: string;
}

// Variable mapping from API response to form variables
export interface IFormOtpVariableMapping {
  path: string; // Path expression e.g., "[0].clientName", "data.user.name"
  to: string; // Target variable name
  required: boolean; // If true, verification fails if this field is missing
}

// OTP request body field configuration (for POST requests)
export interface IFormOtpBodyField {
  name: string;
  value: string;
  type?: "string" | "number" | "boolean"; // Converts the value to the specified type
}

// OTP request API configuration (for on-demand OTP sending)
export interface IFormOtpRequest {
  method: HttpMethod;
  baseUrl: string;
  endpoint: string;
  headers: IFormOtpHeader[];
  queryParams?: IFormOtpQueryParam[]; // Optional for POST requests
  body?: IFormOtpBodyField[]; // Optional: for POST/PUT requests with JSON body
}

// OTP verification API request configuration
export interface IFormOtpVerification {
  method: HttpMethod;
  baseUrl: string;
  endpoint: string;
  headers: IFormOtpHeader[];
  queryParams: IFormOtpQueryParam[];
  response: {
    variableMapping: IFormOtpVariableMapping[];
  };
}

// OTP request dialog UI configuration (shown before OTP is sent)
export interface IFormOtpRequestDialog {
  title?: string;
  content?: string;
  button?: string;
}

// OTP dialog UI configuration (shown for OTP verification)
export interface IFormOtpDialog {
  title?: string;
  content?: string;
  button?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
}

// Main OTP configuration interface
export interface IFormOtp {
  enabled: boolean;
  request?: IFormOtpRequest; // Optional: if present, OTP is sent on-demand
  requestDialog?: IFormOtpRequestDialog; // Optional: UI config for request step
  dialog?: IFormOtpDialog;
  verification: IFormOtpVerification;
}

export interface IFormMetadata {
  formVersion: FormVersion;
  formTitle: string;
  formDescription: string;
  showFormHeader: boolean; // default: true (show form header with title and description)
  availableLocales: Locale[];
  defaultLocale?: Locale; // if left blank, en is used
  searchParamsVariables?: Record<string, string>; // variables to be used in the form (eg: "cs": "contract_sequence", "id": "card_id")
  /**
   * If true, the frontend will initiate a WebSocket flow to obtain a requestId,
   * include it in the 3rd party submission, then wait for a redirectLink and redirect.
   */
  listenToRedirectLink?: boolean;
  /**
   * Field name used when including the requestId in the 3rd party API request body.
   * Defaults to "requestId" when omitted.
   */
  requestIdFieldName?: string;
  /**
   * Timeout in seconds for waiting for requestId from WebSocket after sending init message.
   * Defaults to 120 seconds (2 minutes) when omitted.
   */
  requestIdTimeoutSeconds?: number;

  // Based on the query key, form will expire after the specified number of days.
  formExpiration?: boolean; 
  formExpirationDays?: number;
  formExpirationQueryKey?: string; // The creation timestamp in format XXX-{timestamp}
}

export interface IFormSubmissionHeader {
  name: string;
  value: string;
}

export interface IFormSubmissionQueryParam {
  name: string;
  value: string;
}

export type IFormSubmissionTransform =
  | string
  | string[]
  | { name: string; options?: Record<string, unknown> };

export interface IFormSubmissionFieldMapping {
  from: string | string[];
  to: string;
  transform?: IFormSubmissionTransform;
  options?: Record<string, unknown>;
  script?: string; // transformation script to be executed
  value?: string;
  returnType?: "string" | "number" | "boolean" | "array" | "object" | "json" | "any"; // expected return type for strong type validation
}

export interface IFormSubmissionSuccessCheck {
  type: "status" | "field";
  values?: number[];
  path?: string;
  value?: unknown;
}

export interface IFormSubmissionVariableMapping {
  path: string;
  to: string;
  required: boolean;
}

export interface IFormSubmissionMessages {
  success: {
    title?: string;
    content: string;
  };
  error: {
    title?: string;
    content: string;
  };
}

export interface IFormSubmissionResponse {
  successCheck?: IFormSubmissionSuccessCheck[];
  variableMapping?: IFormSubmissionVariableMapping[];
  messages?: IFormSubmissionMessages;
}

export interface IFormSubmission {
  baseUrl?: string;
  endpoint: string;
  method: HttpMethod;
  requiresAccessToken: boolean;
  headers?: IFormSubmissionHeader[];
  queryParams?: IFormSubmissionQueryParam[];
  fieldMapping?: IFormSubmissionFieldMapping[];
  response?: IFormSubmissionResponse;
}

export interface IFormFileOptions {
  maxSize?: number;
  allowedExtensions?: string[];
  multiple?: boolean;
}

export interface IFormFieldValidation {
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  pattern?: string; // regex pattern
}

export interface IFormConditionalFieldOptions {
  operator: FormConditionalOperator;
  value: string | number | boolean | string[] | number[] | boolean[];
}

export interface IFormFieldBase {
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  validation?: IFormFieldValidation;
  dependencies?: Record<string, IFormField>; // for conditional rendering (If the dependant fields render right below the parent field)
  dependsOn?: string; // for conditional rendering (If the fields can render anywhere of the form)
  conditionalOptions?: IFormConditionalFieldOptions; // for conditional fields
  readOnly?: boolean; // for readonly fields
}

export interface IFormTextareaField extends IFormFieldBase {
  rows?: number;
}

export interface IFormCheckboxField extends IFormFieldBase {
  checked?: boolean;
}

export interface IFormSelectField extends IFormFieldBase {
  options?: Record<string, string>; // for select and radio-group
}

export interface IFormRadioGroupField extends IFormFieldBase {
  orientation?: FormRadioGroupOrientation;
  options?: Record<string, string>; // for select and radio-group
}

export interface IFormCheckboxGroupField extends IFormFieldBase {
  options?: Record<string, string>; // for checkbox-group
}

export interface IFormFileField extends IFormFieldBase {
  fileOptions?: IFormFileOptions; // for file
}

export interface IFormAgeField extends IFormFieldBase {
  dateOfBirthField: string;
  format?: string; // Eg: "{y} years, {m} months, {d} days", default: "{y}"
  toDate?: string;
}

// Table column definition - each column can have its own field type and properties
export interface IFormTableColumn {
  key: string; // Column key (property name in row object)
  label: string; // Column label
  type: FieldType; // Field type for this column
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  validation?: IFormFieldValidation;
  readOnly?: boolean;
  // Field-specific properties
  rows?: number; // for textarea
  checked?: boolean; // for checkbox
  options?: Record<string, string>; // for select, radio-group, checkbox-group
  orientation?: FormRadioGroupOrientation; // for radio-group
  fileOptions?: IFormFileOptions; // for file
  dateOfBirthField?: string; // for age
  format?: string; // for age
  toDate?: string; // for age
}

export interface IFormTableField extends IFormFieldBase {
  columns: IFormTableColumn[];
  minRows?: number; // Minimum number of rows (default: 0)
  maxRows?: number; // Maximum number of rows (optional, no limit if undefined)
  defaultRows?: number; // Initial number of rows (default: 0 or minRows)
}

export type IFormField =
  | IFormSelectField
  | IFormRadioGroupField
  | IFormCheckboxGroupField
  | IFormFileField
  | IFormCheckboxField
  | IFormTextareaField
  | IFormAgeField
  | IFormTableField;

// Layout styling options for form layout items
export interface IFormLayoutStyles {
  align?: FormLayoutItemAlign; // Horizontal alignment ("left", "center", etc.)
  fontSize?: number; // Font size in pixels (auto-size if not set)
  margin?: number | string; // Margin in CSS shorthand, e.g. "10px 0 20px 0"
}

// Submit button specific properties
export interface IFormLayoutSubmitButton {
  variant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"; // Button variant (defaults to "default")
  loadingText?: string; // Text to show while submitting (for future use)
  loadingTextKey?: string; // Translation key for loading text (for future use)
}

// Card-specific content for "card" layout items
export interface IFormLayoutCardContent extends IFormLayoutStyles {
  label: string; // Label for the card
  key?: string; // Translation key for the card description
}

// The main type describing any layout item in the form layout
export type IFormLayoutItem = IFormLayoutStyles & {
  // Optional translation key for non-field items (e.g. headings, text, cards, submit)
  key?: string;

  // Only for "card" layout items: nested layout items inside the card
  items?: IFormLayoutItem[];

  // Only for "row" layout items: describes the row's columns/items
  columns?: IFormLayoutItem[];
  colspan?: number; // Only for "row" layout column items
} & IFormLayoutSubmitButton & {
  // For every layout item type, optionally store associated value:
  // e.g., field: true, h1: "Heading", divider: true, submit: "Submit Form", etc.
  [K in FormLayoutItemType]?: string | number | boolean;
};
