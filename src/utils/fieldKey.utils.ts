/**
 * Utility functions for generating translation keys for form fields and metadata
 */

/**
 * Generates a translation key for a field label
 * @param fieldKey - The field key (e.g., "fullName")
 * @returns Translation key (e.g., "fullName.label")
 */
export function getFieldLabelKey(fieldKey: string): string {
  return `${fieldKey}.label`;
}

/**
 * Generates a translation key for a field placeholder
 * @param fieldKey - The field key (e.g., "fullName")
 * @returns Translation key (e.g., "fullName.placeholder")
 */
export function getFieldPlaceholderKey(fieldKey: string): string {
  return `${fieldKey}.placeholder`;
}

/**
 * Generates a translation key for a field description
 * @param fieldKey - The field key (e.g., "fullName")
 * @returns Translation key (e.g., "fullName.description")
 */
export function getFieldDescriptionKey(fieldKey: string): string {
  return `${fieldKey}.description`;
}

/**
 * Generates a translation key for a field option
 * @param fieldKey - The field key (e.g., "gender")
 * @param optionValue - The option value (e.g., "male")
 * @returns Translation key (e.g., "gender.options.male")
 */
export function getFieldOptionKey(
  fieldKey: string,
  optionValue: string
): string {
  return `${fieldKey}.options.${optionValue}`;
}

/**
 * Returns the translation key for form title
 * @returns Translation key "formTitle"
 */
export function getFormTitleKey(): string {
  return "formTitle";
}

/**
 * Returns the translation key for form description
 * @returns Translation key "formDescription"
 */
export function getFormDescriptionKey(): string {
  return "formDescription";
}

// OTP Request Dialog keys (for on-demand OTP sending)
export function getOtpRequestDialogTitleKey(): string {
  return "otp.requestDialog.title";
}

export function getOtpRequestDialogContentKey(): string {
  return "otp.requestDialog.content";
}

export function getOtpRequestDialogButtonKey(): string {
  return "otp.requestDialog.button";
}

// OTP Verification Dialog keys
export function getOtpDialogTitleKey(): string {
  return "otp.dialog.title";
}

export function getOtpDialogContentKey(): string {
  return "otp.dialog.content";
}

export function getOtpDialogButtonKey(): string {
  return "otp.dialog.button";
}

export function getOtpDialogInputLabelKey(): string {
  return "otp.dialog.inputLabel";
}

export function getOtpDialogInputPlaceholderKey(): string {
  return "otp.dialog.inputPlaceholder";
}
