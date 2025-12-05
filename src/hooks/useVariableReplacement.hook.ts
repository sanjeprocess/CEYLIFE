import { useMemo } from "react";

import { replaceVariablesInText } from "@/services/variable-replacement.service";
import { useVariableStore } from "@/stores/variable.store";

export function useVariableReplacement(text: string): string {
  const { variables } = useVariableStore();

  return useMemo(() => {
    return replaceVariablesInText(text, variables, {
      keepUnresolved: false,
      warnOnMissing: true,
    });
  }, [text, variables]);
}
