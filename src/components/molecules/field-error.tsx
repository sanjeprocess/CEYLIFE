"use client";

import { FieldError as FieldErrorAtom } from "@/components/atoms/field";
import useFormStore from "@/stores/form.store";

interface FieldErrorProps {
  fieldName: string;
}

export function FieldError({ fieldName }: FieldErrorProps) {
  const error = useFormStore((state) => state.fieldErrors[fieldName]);

  if (!error) {
    return null;
  }

  return <FieldErrorAtom>{error}</FieldErrorAtom>;
}

