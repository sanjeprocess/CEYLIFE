import {
  IForm,
  IFormField,
  IFormTableField,
} from "@/common/interfaces/form.interfaces";
import { FormValue } from "@/common/types/common.types";

export function parseFormToFormData(form: IForm): Record<string, FormValue> {
  const values: Record<string, FormValue> = {};
  function parseField(key: string, field: IFormField) {
    // Handle table fields specially
    if (field.type === "table") {
      const tableField = field as IFormTableField;
      const defaultRows = tableField.defaultRows ?? tableField.minRows ?? 0;
      const rows: Record<string, FormValue>[] = [];

      // Initialize rows with default values
      for (let i = 0; i < defaultRows; i++) {
        const row: Record<string, FormValue> = {};
        tableField.columns.forEach((column) => {
          row[column.key] = column.defaultValue ?? null;
        });
        rows.push(row);
      }

      values[key] = rows;
    } else {
      values[key] = field.defaultValue ?? null;
    }

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
