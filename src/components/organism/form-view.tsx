import { IForm } from "@/common/interfaces/form.interfaces";

import { SectionTitle } from "../molecules/section";
import { TextField } from "../molecules/text-field";

export function FormView({ form }: { form: IForm }) {
  return (
    <div className="mt-12">
      <SectionTitle
        title={form.metadata.formTitle}
        description={form.metadata.formDescription}
      />
      {Object.entries(form.fields).map(([key, field], index) => (
        <TextField key={index} field={field} name={key} />
      ))}
    </div>
  );
}
