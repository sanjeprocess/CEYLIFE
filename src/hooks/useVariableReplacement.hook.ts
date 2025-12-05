import { useMemo } from "react";

import { useVariableStore } from "@/stores/variable.store";

/**
 * Custom hook to replace variables in text with actual values from the variable store
 * Variables are defined using {{variableName}} syntax
 * 
 * @param text - The text containing variable placeholders
 * @returns The text with variables replaced, or empty strings for unresolved variables
 * 
 * @example
 * const text = "Hello {{userName}}, your ID is {{userId}}";
 * const processedText = useVariableReplacement(text);
 * // Returns: "Hello John, your ID is 12345" (when variables are loaded)
 * // Returns: "Hello , your ID is " (when variables are not loaded yet)
 */
export function useVariableReplacement(text: string): string {
  const { variables } = useVariableStore();

  return useMemo(() => {
    let processedText = text;

    // Replace all known variables with their values
    Object.entries(variables).forEach(([key, value]) => {
      // Use global replace to handle multiple occurrences of the same variable
      processedText = processedText.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        value
      );
    });

    // Remove any remaining unresolved variable placeholders
    // This prevents showing {{variableName}} to users before variables load
    processedText = processedText.replace(/\{\{[^}]+\}\}/g, "");

    return processedText;
  }, [text, variables]); // Re-compute when text or variables change
}



