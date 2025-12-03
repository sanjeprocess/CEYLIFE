import { HttpMethod } from "@/common/types/common.types";
import {
  FieldType,
  FormConditionalOperator,
  FormLayoutItemType,
  FormRadioGroupOrientation,
  FormVersion,
  Locale,
} from "@/common/types/form.types";

export interface IForm {
  metadata: IFormMetadata;
  prefilledFields?: string[]; // field keys that are prefilled using OTP service
  submission: IFormSubmission;
  fields: Record<string, IFormField>;
  layout: IFormLayoutItem[];
  localization: Record<Locale, Record<string, string>>; // based on json keys (eg: "fields.name.label" -> "Name")
}

export interface IOnFormOpen {
  action: "verify-user";
  method: HttpMethod;
  endpoint: string;
  requiresAccessToken: boolean;
  parameters: Record<string, string>;
  body: Record<string, unknown>;
  response: Record<string, string>;
}

export interface IFormMetadata {
  formVersion: FormVersion;
  formTitle: string;
  formDescription: string;
  availableLocales: Locale[];
  defaultLocale?: Locale; // if left blank, en is used
  otp: boolean; // whether OTP is required for the form, if enabled form can use $otp for its onFormOpen, fields as a variable.
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
  dependencies?: Record<string, IFormField>; // for conditional rendering
  conditionalOptions?: IFormConditionalFieldOptions; // for conditional fields
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

export interface IFormFileField extends IFormFieldBase {
  fileOptions?: IFormFileOptions; // for file
}

export type IFormField =
  | IFormSelectField
  | IFormRadioGroupField
  | IFormFileField
  | IFormCheckboxField
  | IFormTextareaField;

export type IFormLayoutItem = {
  [K in FormLayoutItemType]?: string | number | boolean;
} & {
  key?: string; // Translation key for non-field layout items (e.g., "h2.personal_information")
};
