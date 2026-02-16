"use client";

import { IFormTableField, IFormTableColumn } from "@/common/interfaces/form.interfaces";
import { FormValue } from "@/common/types/common.types";
import { useFormValue } from "@/hooks/useFormValue.hook";
import { useTranslation } from "@/hooks/useTranslation.hook";
import useFormStore from "@/stores/form.store";
import { getFieldLabelKey } from "@/utils/fieldKey.utils";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldError,
} from "../atoms/field";
import { Button } from "../atoms/button";
import { TableCell } from "./table-cell";

interface TableFieldProps {
  field: IFormTableField;
  name: string;
}

export function TableField({ field, name }: TableFieldProps) {
  const { computedValue, updateValue } = useFormValue(name);
  const translate = useTranslation();
  const getFieldError = useFormStore((state) => state.getFieldError);

  // Get table data as array of objects
  const tableData = Array.isArray(computedValue)
    ? (computedValue as Record<string, FormValue>[])
    : [];

  // Ensure columns exist - check both field.columns and handle potential parsing issues
  const columns = (field.columns && Array.isArray(field.columns) && field.columns.length > 0)
    ? field.columns
    : [];
  
  // Debug logging in development
  if (process.env.NODE_ENV === "development" && columns.length === 0) {
    console.warn(`[TableField] No columns found for field "${name}". Field:`, field);
  }
  
  const minRows = field.minRows ?? 0;
  const maxRows = field.maxRows;
  const canAddRow = maxRows === undefined || tableData.length < maxRows;
  const canRemoveRow = tableData.length > minRows;

  const handleAddRow = () => {
    if (!canAddRow || columns.length === 0) return;

    const newRow: Record<string, FormValue> = {};
    columns.forEach((column) => {
      newRow[column.key] = column.defaultValue ?? null;
    });

    const newData = [...tableData, newRow];
    updateValue(newData);
  };

  const handleRemoveRow = (index: number) => {
    if (!canRemoveRow || index < 0 || index >= tableData.length) return;

    const newData = tableData.filter((_, i) => i !== index);
    updateValue(newData);
  };

  const handleCellUpdate = (rowIndex: number, columnKey: string, value: FormValue) => {
    const newData = [...tableData];
    if (!newData[rowIndex]) {
      newData[rowIndex] = {};
    }
    newData[rowIndex] = { ...newData[rowIndex], [columnKey]: value };
    updateValue(newData);
  };

  const label = translate(getFieldLabelKey(name), field.label);
  const description = field.description
    ? translate(getFieldLabelKey(name) + ".description", field.description)
    : undefined;

  const fieldError = getFieldError(name);
  const hasError = !!fieldError;

  // If no columns defined, show error message
  if (columns.length === 0) {
    return (
      <Field>
        <FieldLabel>
          {label}
          {field.required && <span className="text-destructive"> *</span>}
        </FieldLabel>
        <FieldContent>
          <div className="text-sm text-destructive">
            Table configuration error: No columns defined
          </div>
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      </Field>
    );
  }

  return (
    <Field>
      <FieldLabel>
        {label}
        {field.required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <FieldContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
                      >
                        {translate(
                          getFieldLabelKey(name) + `.columns.${column.key}`,
                          column.label
                        )}
                        {column.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-medium text-foreground uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {tableData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        No rows added yet. Click "Add Row" to get started.
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/50">
                        {columns.map((column) => (
                          <td key={column.key} className="px-4 py-3 whitespace-nowrap">
                            <TableCell
                              column={column}
                              value={row[column.key]}
                              rowIndex={rowIndex}
                              columnKey={column.key}
                              fieldName={name}
                              onUpdate={handleCellUpdate}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRow(rowIndex)}
                            disabled={!canRemoveRow}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {tableData.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8 border rounded-lg">
              No rows added yet. Click "Add Row" to get started.
            </div>
          ) : (
            tableData.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="border rounded-lg p-4 space-y-4 bg-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Row {rowIndex + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(rowIndex)}
                    disabled={!canRemoveRow}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
                {columns.map((column) => (
                  <div key={column.key}>
                    <TableCell
                      column={column}
                      value={row[column.key]}
                      rowIndex={rowIndex}
                      columnKey={column.key}
                      fieldName={name}
                      onUpdate={handleCellUpdate}
                      mobileView={true}
                    />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Add Row Button */}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddRow}
            disabled={!canAddRow}
            className="w-full md:w-auto"
          >
            Add Row
          </Button>
          {maxRows && (
            <p className="text-xs text-muted-foreground mt-2">
              {tableData.length} / {maxRows} rows
            </p>
          )}
        </div>

        {description && <FieldDescription>{description}</FieldDescription>}
        {fieldError && <FieldError>{fieldError}</FieldError>}
      </FieldContent>
    </Field>
  );
}
