import cookies from "js-cookie";

import { COOKIES } from "@/common/constants/cookie.constants";
import { useVariableStore } from "@/stores/variable.store";

/**
 * Initialize zustand store from cookie variables (cookie → store)
 * Should be called once after Server Action sets cookies
 */
export function initializeVariablesFromCookies() {
  // Only run on client side
  if (typeof window === "undefined") return;

  try {
    const cookieVariables = cookies.get(COOKIES.VARIABLES);
    if (cookieVariables) {
      const variables = JSON.parse(cookieVariables);
      // Only initialize if variables is a valid object
      if (variables && typeof variables === "object") {
        useVariableStore.getState().initializeVariables(variables);
        // Set initialization flag to enable bidirectional sync
        cookies.set(COOKIES.VARIABLES_INITIALIZED, "true");
      }
    }
  } catch (error) {
    console.error("Failed to initialize variables from cookies:", error);
  }
}

/**
 * Check if variables have been initialized from cookies
 */
export function isVariablesInitialized(): boolean {
  if (typeof window === "undefined") return false;
  return cookies.get(COOKIES.VARIABLES_INITIALIZED) === "true";
}

/**
 * Sync zustand store to cookies (store → cookie)
 * Called whenever the store changes
 * Only syncs if initialization is complete
 */
export function syncVariables() {
  // Only run on client side
  if (typeof window === "undefined") return;
  
  // Only sync if initialization is complete
  if (!isVariablesInitialized()) return;
  
  const storeVariables = useVariableStore.getState().variables;
  cookies.set(COOKIES.VARIABLES, JSON.stringify(storeVariables));
  cookies.set(COOKIES.VARIABLES_SYNCED, Date.now().toString());
}

export async function replaceVariables(text: string) {
  // Only run on client side
  if (typeof window === "undefined") return text;
  const storeVariables = useVariableStore.getState().variables;
  let replacedText = text;
  Object.entries(storeVariables).forEach(([key, value]) => {
    replacedText = replacedText.replace(`{{${key}}}`, value);
  });
  return replacedText;
}
