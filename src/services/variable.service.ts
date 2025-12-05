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
        useVariableStore.getState().initializeVariables(variables, "cookie");
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
