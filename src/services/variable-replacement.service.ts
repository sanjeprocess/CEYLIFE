import { getSystemVariable, isSystemVariable } from "@/utils/variable.utils";

export interface ReplacementOptions {
  keepUnresolved?: boolean;
  warnOnMissing?: boolean;
  throwOnMissing?: boolean;
}

const VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;
const isDevelopment = process.env.NODE_ENV === "development";

export function replaceVariablesInText(
  text: string,
  variables: Record<string, string>,
  options: ReplacementOptions = {}
): string {
  const {
    keepUnresolved = false,
    warnOnMissing = isDevelopment,
    throwOnMissing = false,
  } = options;

  if (typeof text !== "string") {
    return text;
  }

  const missingVariables = new Set<string>();

  const result = text.replace(VARIABLE_PATTERN, (match, varName: string) => {
    const trimmedVarName = varName.trim();

    if (isSystemVariable(trimmedVarName)) {
      const systemValue = getSystemVariable(trimmedVarName);
      if (systemValue !== null) {
        return systemValue;
      }
    }

    if (trimmedVarName in variables) {
      return variables[trimmedVarName];
    }

    missingVariables.add(trimmedVarName);

    if (throwOnMissing) {
      throw new Error(`Variable '${trimmedVarName}' is not defined`);
    }

    if (warnOnMissing) {
      const availableVars = Object.keys(variables);
      const suggestion = availableVars.find(
        (v) => v.toLowerCase() === trimmedVarName.toLowerCase()
      );
      const suggestionText = suggestion ? ` Did you mean '${suggestion}'?` : "";
      console.warn(
        `Variable '${trimmedVarName}' used but not defined.${suggestionText} Available variables: ${
          availableVars.join(", ") || "none"
        }`
      );
    }

    return keepUnresolved ? match : "";
  });

  return result;
}

// Replaces variables including runtime variables (like tokens)
// Runtime variables start with $ but are not system variables (like $now, $today)
export function replaceVariablesInTextWithRuntime(
  text: string,
  variables: Record<string, string>,
  runtimeVariables: Record<string, string>,
  options: ReplacementOptions = {}
): string {
  const {
    keepUnresolved = false,
    warnOnMissing = isDevelopment,
    throwOnMissing = false,
  } = options;

  if (typeof text !== "string") {
    return text;
  }

  const missingVariables = new Set<string>();

  const result = text.replace(VARIABLE_PATTERN, (match, varName: string) => {
    const trimmedVarName = varName.trim();

    // Check runtime variables first (like $WORKHUB_TOKEN)
    if (trimmedVarName in runtimeVariables) {
      return runtimeVariables[trimmedVarName];
    }

    // Then check system variables (like $now, $today, $time)
    if (isSystemVariable(trimmedVarName)) {
      const systemValue = getSystemVariable(trimmedVarName);
      if (systemValue !== null) {
        return systemValue;
      }
    }

    // Finally check regular variables
    if (trimmedVarName in variables) {
      return variables[trimmedVarName];
    }

    missingVariables.add(trimmedVarName);

    if (throwOnMissing) {
      throw new Error(`Variable '${trimmedVarName}' is not defined`);
    }

    if (warnOnMissing) {
      const availableVars = [
        ...Object.keys(runtimeVariables),
        ...Object.keys(variables),
      ];
      const suggestion = availableVars.find(
        (v) => v.toLowerCase() === trimmedVarName.toLowerCase()
      );
      const suggestionText = suggestion ? ` Did you mean '${suggestion}'?` : "";
      console.warn(
        `Variable '${trimmedVarName}' used but not defined.${suggestionText} Available variables: ${
          availableVars.join(", ") || "none"
        }`
      );
    }

    return keepUnresolved ? match : "";
  });

  return result;
}
