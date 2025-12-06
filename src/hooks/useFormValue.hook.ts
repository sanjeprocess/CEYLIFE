import { useMemo } from "react";

import { FormValue } from "@/common/types/common.types";
import { replaceVariablesInText } from "@/services/variable-replacement.service";
import useFormStore from "@/stores/form.store";
import { useVariableStore } from "@/stores/variable.store";

interface UseFormValueReturn {
  rawValue: FormValue;
  computedValue: FormValue;
  updateValue: (value: FormValue) => void;
}

export function useFormValue(fieldName: string): UseFormValueReturn {
  const rawValue = useFormStore((state) => state.rawValues[fieldName]);
  const updateValue = useFormStore((state) => state.updateValue);
  const variables = useVariableStore((state) => state.variables);

  const computedValue = useMemo(() => {
    if (typeof rawValue !== "string") {
      return rawValue;
    }
    return replaceVariablesInText(rawValue, variables, {
      keepUnresolved: false,
      warnOnMissing: false,
    });
  }, [rawValue, variables]);

  const handleUpdateValue = (value: FormValue) => {
    updateValue(fieldName, value);
  };

  return {
    rawValue,
    computedValue,
    updateValue: handleUpdateValue,
  };
}
