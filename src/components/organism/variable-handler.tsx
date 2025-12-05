"use client";

import { useEffect } from "react";

import { syncVariables } from "@/services/variable.service";
import { useVariableStore } from "@/stores/variable.store";

export function VariableHandler() {
  const { variables } = useVariableStore();

  // Sync to cookies whenever variables change
  // Note: syncVariables() internally checks if initialization is complete
  useEffect(() => {
    syncVariables();
  }, [variables]);

  return null;
}
