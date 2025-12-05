"use client";

import { useEffect, useRef } from "react";

import { IForm } from "@/common/interfaces/form.interfaces";
import { preProcessForm } from "@/services/form.service";
import { initializeVariablesFromCookies } from "@/services/variable.service";

interface CookieInitializerProps {
  form: IForm;
  formId: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export function CookieInitializer({
  form,
  formId,
  searchParams,
}: CookieInitializerProps) {
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      // Call Server Action to set cookies, then initialize variables from cookies
      preProcessForm(form, { id: formId, searchParams }).then(() => {
        // After cookies are set, initialize the zustand store
        initializeVariablesFromCookies();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // This component doesn't render anything
}
