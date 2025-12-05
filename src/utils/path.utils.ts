// Extracts a value from a nested object using a path expression
// Supports: "fieldName", "[0]", "[0].field", "data.nested", "results[0].name"
export function getValueByPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") {
    return undefined;
  }

  if (!path) {
    return obj;
  }

  // Split path into segments, handling both dot notation and bracket notation
  const segments = path
    .replace(/\[(\d+)\]/g, ".$1") // Convert [0] to .0
    .split(".")
    .filter((segment) => segment !== "");

  let current: unknown = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }

    // Handle array index
    if (/^\d+$/.test(segment)) {
      const index = parseInt(segment, 10);
      if (Array.isArray(current) && index >= 0 && index < current.length) {
        current = current[index];
      } else {
        return undefined;
      }
    } else {
      // Handle object property
      if (typeof current === "object" && current !== null) {
        const obj = current as Record<string, unknown>;
        if (segment in obj) {
          current = obj[segment];
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
  }

  return current;
}

// Validates if a path expression has valid syntax
export function isValidPath(path: string): boolean {
  if (typeof path !== "string") {
    return false;
  }

  if (path === "") {
    return true;
  }

  // Check for valid characters and structure
  // Allow: letters, numbers, dots, brackets, underscores
  const validPattern = /^[a-zA-Z_$][\w$]*(\.\w+|\[\d+\])*$/;
  const startsWithBracket = /^\[\d+\](\.\w+|\[\d+\])*$/;

  return validPattern.test(path) || startsWithBracket.test(path);
}

// Converts any value to a string for variable storage
export function convertToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
