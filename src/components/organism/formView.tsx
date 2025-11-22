"use client";

import { FormProvider } from "react-hook-form";
import { IFormData } from "@/common/interfaces/formData";
import { FormElement } from "./formElement";
import { useFormValidation } from "@/hooks/formValidation.hook";
import { useMemo } from "react";
import { Button } from "@/components/atoms/button";

export const FormView = ({ formData }: { formData: IFormData }) => {
  // Create default values from schema
  const defaultValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    if (formData.schema.properties) {
      Object.entries(formData.schema.properties).forEach(([key, prop]) => {
        values[key] = prop.default ?? "";
      });
    }
    return values;
  }, [formData.schema]);

  const form = useFormValidation(formData.schema, defaultValues);

  const onSubmit = (data: unknown) => {
    console.log("Form submitted:", data);
    // TODO: Handle form submission
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formData.ui["ui:layout"].map((element, index) => {
          // Pass schema information to field elements
          if (element.type === "field" && formData.schema.properties) {
            const fieldSchema = formData.schema.properties[element.name];
            const isRequired =
              formData.schema.required?.includes(element.name) || false;
            return (
              <FormElement
                key={index}
                element={element}
                schema={fieldSchema}
                required={isRequired}
              />
            );
          }
          return <FormElement key={index} element={element} />;
        })}
        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" size="lg">
            Submit
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
