import { HttpMethod } from "@/common/types/common.types";
import {
  FieldType,
  FormConditionalOperator,
  FormLayoutItemType,
  FormVersion,
  Locale,
} from "@/common/types/form.types";

export interface IForm {
  metadata: IFormMetadata;
  prefilledFields?: string[]; // field keys that are prefilled using OTP service
  submission: IFormSubmission;
  fields: Record<string, IFormField>;
  layout: Record<FormLayoutItemType, string | number | boolean>;
  localization: Record<Locale, Record<string, string>>; // based on json keys (eg: "fields.name.label" -> "Name")
}

export interface IFormMetadata {
  formVersion: FormVersion;
  formTitle: string;
  formDescription: string;
  availableLocales: Locale[];
  otpRequired: boolean;
}

export interface IFormSubmission {
  endpoint: string;
  method: HttpMethod;
  requiresAccessToken: boolean;
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
  fieldId: string;
  operator: FormConditionalOperator;
  value: string | number | boolean | string[] | number[] | boolean[];
}

export interface IFormField {
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  validation: IFormFieldValidation;
  options?: Record<string, string>; // for select and radio-group
  fileOptions?: IFormFileOptions; // for file
  conditionalOptions?: IFormConditionalFieldOptions; // for conditional fields
}
