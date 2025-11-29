import { useEffect, useRef, useState } from "react";

import { IFormField } from "@/common/interfaces/form.interfaces";
import { evaluateCondition } from "@/services/conditinonal.service";
import useFormStore from "@/stores/form.store";

import { FieldRenderer } from "./layout-renderer";

interface ConditionalRendererProps {
  parentName: string;
  dependencies?: Record<string, IFormField>;
}

interface DependencyRendererProps {
  field: IFormField;
  name: string;
  parentName: string;
}

export function ConditionalRenderer({
  parentName,
  dependencies,
}: ConditionalRendererProps) {
  const dependencyItems = dependencies ? Object.entries(dependencies) : [];

  return (
    <div>
      {dependencyItems.map(([name, field]) => (
        <DependencyRenderer
          key={name}
          field={field}
          name={name}
          parentName={parentName}
        />
      ))}
    </div>
  );
}

export function DependencyRenderer({
  field,
  name,
  parentName,
}: DependencyRendererProps) {
  const { values, form, updateValue } = useFormStore();

  const { operator, value: expectedValue } = field.conditionalOptions ?? {};
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const previousShouldRender = useRef<boolean>(false);

  useEffect(() => {
    function checkCondition() {
      if (!operator || expectedValue === undefined || expectedValue === null) {
        console.warn(
          "DependencyRenderer: No operator or expected value found for field: ",
          name
        );
        setShouldRender(false);
        return;
      }

      // Get parent field from form store
      const parentField = form?.fields[parentName];
      if (!parentField) {
        console.warn(
          "DependencyRenderer: Parent field not found: ",
          parentName
        );
        setShouldRender(false);
        return;
      }

      // Get actual form value from store
      const actualValue = values[parentName];

      // Evaluate condition with actual and expected values
      const shouldRender = evaluateCondition(
        operator,
        actualValue,
        expectedValue,
        parentField.type
      );
      setShouldRender(shouldRender);
    }
    checkCondition();
  }, [values, form, field, name, parentName, operator, expectedValue]);

  // Clear field value when condition becomes false (field is hidden)
  useEffect(() => {
    // Only clear if transitioning from visible to hidden
    if (previousShouldRender.current && !shouldRender) {
      updateValue(name, null);
    }
    previousShouldRender.current = shouldRender;
  }, [shouldRender, name, updateValue]);

  return shouldRender ? <FieldRenderer field={field} name={name} /> : null;
}
