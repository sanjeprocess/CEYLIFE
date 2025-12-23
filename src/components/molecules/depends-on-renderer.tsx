import { useEffect, useRef, useState } from "react";

import { IFormField } from "@/common/interfaces/form.interfaces";
import { evaluateCondition } from "@/services/conditinonal.service";
import useFormStore from "@/stores/form.store";

interface DependsOnRendererProps {
  field: IFormField;
  fieldName: string;
  children: React.ReactNode;
}

export function DependsOnRenderer({
  field,
  fieldName,
  children,
}: DependsOnRendererProps) {
  // All hooks must be called before any early returns
  const { rawValues, form, updateValue } = useFormStore();
  const { dependsOn, conditionalOptions } = field;
  const { operator, value: expectedValue } = conditionalOptions ?? {};

  // If no dependsOn, always render. Otherwise, start with false and evaluate in effect
  const [shouldRender, setShouldRender] = useState<boolean>(!dependsOn);
  const previousShouldRender = useRef<boolean>(shouldRender);

  useEffect(() => {
    // If field doesn't depend on another field, always render (no state update needed)
    if (!dependsOn) {
      return;
    }

    function checkCondition() {
      if (!operator || expectedValue === undefined || expectedValue === null) {
        console.warn(
          "DependsOnRenderer: No operator or expected value found for field: ",
          fieldName
        );
        setShouldRender(false);
        return;
      }

      if (!dependsOn) return; // Type guard

      const parentField = form?.fields?.[dependsOn];
      if (!parentField) {
        console.warn(
          "DependsOnRenderer: Parent field not found for dependsOn: ",
          dependsOn
        );
        setShouldRender(false);
        return;
      }

      const actualValue = rawValues?.[dependsOn];

      const shouldRenderResult = evaluateCondition(
        operator,
        actualValue,
        expectedValue,
        parentField.type
      );
      setShouldRender(shouldRenderResult);
    }

    checkCondition();
  }, [rawValues, form, fieldName, dependsOn, operator, expectedValue]);

  // Clear field value when condition becomes false
  useEffect(() => {
    if (dependsOn && previousShouldRender.current && !shouldRender) {
      updateValue(fieldName, null);
    }
    previousShouldRender.current = shouldRender;
  }, [shouldRender, fieldName, updateValue, dependsOn]);

  // If field doesn't depend on another field, always render
  if (!dependsOn) {
    return <>{children}</>;
  }

  // Only render children if condition is met
  return shouldRender ? <>{children}</> : null;
}
