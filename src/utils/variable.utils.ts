const VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;

export function extractVariableNames(text: string): string[] {
  if (typeof text !== "string") {
    return [];
  }

  const variables = new Set<string>();
  let match: RegExpExecArray | null;

  const regex = new RegExp(VARIABLE_PATTERN);
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1]?.trim();
    if (varName) {
      variables.add(varName);
    }
  }

  return Array.from(variables);
}

export function hasVariables(text: string): boolean {
  if (typeof text !== "string") {
    return false;
  }
  return VARIABLE_PATTERN.test(text);
}

export function isValidVariableSyntax(text: string): boolean {
  if (typeof text !== "string") {
    return false;
  }

  const openBraces = (text.match(/\{\{/g) || []).length;
  const closeBraces = (text.match(/\}\}/g) || []).length;

  if (openBraces !== closeBraces) {
    return false;
  }

  const matches = text.match(VARIABLE_PATTERN);
  if (!matches) {
    return true;
  }

  for (const match of matches) {
    const varName = match.slice(2, -2).trim();
    if (!varName || varName.includes("{{") || varName.includes("}}")) {
      return false;
    }
  }

  return true;
}
