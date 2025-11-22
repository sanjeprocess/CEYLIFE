/**
 * Type definitions for Form Data
 */

export type JSONSchemaType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "null";

export type JSONSchemaFormat =
  | "date"
  | "date-time"
  | "time"
  | "email"
  | "uri"
  | "url"
  | "uuid"
  | "ipv4"
  | "ipv6"
  | string;

export type TextAlign = "left" | "center" | "right";

export type ListBulletType =
  | "roman"
  | "decimal"
  | "alpha"
  | "disc"
  | "circle"
  | "square"
  | string;

