"use client";

import { useEffect } from "react";

import { IForm } from "@/common/interfaces/form.interfaces";
import useFormStore from "@/stores/form.store";
import { useLocalizationStore } from "@/stores/localization.store";

import { LayoutRenderer } from "../molecules/layout-renderer";

export function FormView({ form }: { form: IForm }) {
  const { values, initializeForm } = useFormStore();
  const { initializeLocalization } = useLocalizationStore();

  useEffect(() => {
    initializeForm(form);
    initializeLocalization(form);
  }, [form, initializeForm, initializeLocalization]);

  return (
    <div className="mt-12 grid grid-cols-1 gap-4">
      {form.layout.map((item, index) => (
        <LayoutRenderer key={index} layout={item} fields={form.fields} />
      ))}
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
}
