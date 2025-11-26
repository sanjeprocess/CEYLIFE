export type FormVersion = 1;

export type Locale = "en" | "si" | "ta";

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "date"
  | "time"
  | "datetime-local"
  | "checkbox"
  | "radio-group"
  | "select"
  | "textarea"
  | "file"
  | "url"
  | "tel";

export type FormConditionalOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith";

export type FormLayoutItemType =
  | "field"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "text"
  | "spacer"
  | "divider"
  | "section.title"
  | "section.description";
