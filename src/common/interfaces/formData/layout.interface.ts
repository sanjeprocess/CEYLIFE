/**
 * UI Layout interfaces for form rendering
 */

import type { TextAlign, ListBulletType } from "./types";

// Base layout item types
export interface IFieldLayoutItem {
  type: "field";
  name: string;
}

export interface ISubheaderLayoutItem {
  type: "subheader";
  text: string;
  align?: TextAlign;
}

export interface IMarkdownLayoutItem {
  type: "md";
  text: string;
}

export interface IListItem {
  type: "list:item";
  text: string;
}

export interface IListItemBreak {
  type: "list:item-break";
  text: string;
}

export type IListOrderedItem = IListItem | IListItemBreak;

export interface IListOrderedLayoutItem {
  type: "list:ordered";
  bullet?: ListBulletType;
  items: IListOrderedItem[];
}

export interface IListUnorderedLayoutItem {
  type: "list:unordered";
  bullet?: ListBulletType;
  items: IListOrderedItem[];
}

export interface ITableLayoutItem {
  type: "table";
  headers?: string[];
  rows?: (string | number | boolean)[][];
  caption?: string;
}

export interface IButtonLayoutItem {
  type: "button";
  text: string;
  link?: string;
  href?: string;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  action?: string;
}

export interface IFieldsetLayoutItem {
  type: "fieldset";
  legend?: string;
  fields: string[];
  description?: string;
}

export interface ICheckboxLayoutItem {
  type: "checkbox";
  name: string;
  label?: string;
  description?: string;
  checked?: boolean;
}

// Forward declare ILayoutItem for recursive structures
export type ILayoutItem =
  | IFieldLayoutItem
  | ISubheaderLayoutItem
  | IMarkdownLayoutItem
  | IListOrderedLayoutItem
  | IListUnorderedLayoutItem
  | ITableLayoutItem
  | IButtonLayoutItem
  | ICardLayoutItem
  | IFieldsetLayoutItem
  | ICheckboxLayoutItem;

// ICardLayoutItem uses ILayoutItem[] for recursive content
export interface ICardLayoutItem {
  type: "card";
  title?: string;
  content?: ILayoutItem[];
  description?: string;
}

export interface IFormUI {
  "ui:header"?: boolean;
  "ui:layout": ILayoutItem[];
  [key: string]: unknown; // Allow additional UI properties
}

