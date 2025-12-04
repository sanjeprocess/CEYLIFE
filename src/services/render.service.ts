import { marked } from "marked";
import { CSSProperties } from "react";

export function mdToHtml(markdown: string): string {
  if (!markdown) return "";
  // Trim whitespace for consistent output
  return marked.parse(markdown.trim()) as string;
}

// Removes empty css properties
export function styles(css: CSSProperties): CSSProperties {
  return Object.fromEntries(
    Object.entries(css).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, value]) => value !== undefined && value !== "" && value !== 0
    )
  );
}
