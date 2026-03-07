import cookies from "js-cookie";

import { COOKIES } from "@/common/constants/cookie.constants";
import { useVariableStore } from "@/stores/variable.store";

export function initializeVariablesFromCookies() {
  if (typeof window === "undefined") return;

  try {
    const cookieVariables = cookies.get(COOKIES.VARIABLES);
    if (cookieVariables) {
      const variables = JSON.parse(cookieVariables);
      if (variables && typeof variables === "object") {
        // Preserve locale if it was already set by initializeLocalization
        // Form default locale takes precedence over cookie locale
        const existingLocale = useVariableStore.getState().variables.locale;
        
        useVariableStore.getState().initializeVariables(variables, "cookie");
        
        // Restore locale from form default if it was set before variable initialization
        // This ensures form default locale takes precedence over cookie locale
        if (existingLocale) {
          useVariableStore.getState().updateVariable("locale", existingLocale);
        }
        
        cookies.set(COOKIES.VARIABLES_INITIALIZED, "true");
      }
    }
  } catch (error) {
    console.error("Failed to initialize variables from cookies:", error);
  }
}

export function isVariablesInitialized(): boolean {
  if (typeof window === "undefined") return false;
  return cookies.get(COOKIES.VARIABLES_INITIALIZED) === "true";
}

export function syncVariables() {
  if (typeof window === "undefined") return;

  if (!isVariablesInitialized()) return;

  const storeVariables = useVariableStore.getState().variables;
  cookies.set(COOKIES.VARIABLES, JSON.stringify(storeVariables));
  cookies.set(COOKIES.VARIABLES_SYNCED, Date.now().toString());
}

// Refreshes variables from cookies and merges them into the store
// Used after OTP verification to sync new variables from server
export function refreshVariablesFromCookies() {
  if (typeof window === "undefined") return;

  try {
    const cookieVariables = cookies.get(COOKIES.VARIABLES);
    if (cookieVariables) {
      const variables = JSON.parse(cookieVariables);
      if (variables && typeof variables === "object") {
        const currentVariables = useVariableStore.getState().variables;
        const newVariables: Record<string, string> = {};

        // Find variables that are new or have changed
        for (const [key, value] of Object.entries(variables)) {
          if (currentVariables[key] !== value) {
            newVariables[key] = value as string;
          }
        }

        if (Object.keys(newVariables).length > 0) {
          useVariableStore.getState().mergeVariables(newVariables, "otp");
        }
      }
    }
  } catch (error) {
    console.error("Failed to refresh variables from cookies:", error);
  }
}
