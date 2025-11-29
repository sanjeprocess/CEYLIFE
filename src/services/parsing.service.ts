import { IForm, IFormField } from "@/common/interfaces/form.interfaces";
import { FormValue } from "@/common/types/common.types";

export function parseFormToFormData(form: IForm): Record<string, FormValue> {
  const values: Record<string, FormValue> = {};
  function parseField(key: string, field: IFormField) {
    values[key] = field.defaultValue ?? null;
    if (field.dependencies) {
      Object.entries(field.dependencies).forEach(
        ([dependencyKey, dependencyItem]) => {
          parseField(dependencyKey, dependencyItem);
        }
      );
    }
  }
  Object.entries(form.fields).forEach(([key, field]) => {
    parseField(key, field);
  });
  return values;
}
