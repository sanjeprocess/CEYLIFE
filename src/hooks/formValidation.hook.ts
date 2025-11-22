"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import type { IJSONSchema } from "@/common/interfaces/formData";
import { compileSchemaValidator } from "@/utils/validation.utils";

/**
 * Create a React Hook Form resolver that uses AJV for validation
 */
export function createAjvResolver(schema: IJSONSchema): Resolver<any> {
  const validate = compileSchemaValidator(schema);

  return async (values) => {
    const valid = validate(values);

    if (valid) {
      return {
        values,
        errors: {},
      };
    }

    const errors: Record<string, any> = {};

    if (validate.errors) {
      validate.errors.forEach((error) => {
        const fieldName =
          error.instancePath?.replace(/^\//, "") ||
          error.params?.missingProperty ||
          "";

        if (fieldName) {
          if (!errors[fieldName]) {
            errors[fieldName] = {
              type: error.keyword || "validation",
              message: error.message || "Validation error",
            };
          }
        }
      });
    }

    return {
      values: {},
      errors,
    };
  };
}

/**
 * Hook to use React Hook Form with AJV validation
 */
export function useFormValidation(schema: IJSONSchema, defaultValues?: any) {
  const resolver = useMemo(() => createAjvResolver(schema), [schema]);

  const form = useForm({
    resolver,
    defaultValues: defaultValues || {},
    mode: "onChange",
  });

  return form;
}

