"use client";

import {
  IFormTableColumn,
  IFormField,
  IFormAgeField,
} from "@/common/interfaces/form.interfaces";
import { FormValue } from "@/common/types/common.types";
import { useTranslation } from "@/hooks/useTranslation.hook";
import useFormStore from "@/stores/form.store";
import {
  formatCurrencyDisplay,
  parseCurrencyInput,
} from "@/utils/currency.utils";
import {
  getFieldLabelKey,
  getFieldPlaceholderKey,
  getFieldOptionKey,
} from "@/utils/fieldKey.utils";

import { AgeField } from "./age-field";
import { Checkbox } from "../atoms/checkbox";
import { FieldError } from "../atoms/field";
import { Input } from "../atoms/input";
import { Label } from "../atoms/label";
import { RadioGroup, RadioGroupItem } from "../atoms/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../atoms/select";
import { Textarea } from "../atoms/textarea";

interface TableCellProps {
  column: IFormTableColumn;
  value: FormValue;
  rowIndex: number;
  columnKey: string;
  fieldName: string;
  onUpdate: (rowIndex: number, columnKey: string, value: FormValue) => void;
  mobileView?: boolean;
}

export function TableCell({
  column,
  value,
  rowIndex,
  columnKey,
  fieldName,
  onUpdate,
  mobileView = false,
}: TableCellProps) {
  const translate = useTranslation();
  const getFieldError = useFormStore((state) => state.getFieldError);

  const cellFieldName = `${fieldName}[${rowIndex}].${columnKey}`;
  const error = getFieldError(cellFieldName);
  const hasError = !!error;

  const label = mobileView
    ? translate(
        getFieldLabelKey(fieldName) + `.columns.${columnKey}`,
        column.label
      )
    : undefined;

  const placeholder = column.placeholder
    ? translate(
        getFieldPlaceholderKey(fieldName) + `.columns.${columnKey}`,
        column.placeholder
      )
    : undefined;

  const handleChange = (newValue: FormValue) => {
    onUpdate(rowIndex, columnKey, newValue);
  };

  // Convert column to IFormField for field components that need it
  const fieldForComponent: IFormField = {
    type: column.type,
    label: column.label,
    required: column.required,
    placeholder: column.placeholder,
    description: column.description,
    defaultValue: column.defaultValue,
    validation: column.validation,
    readOnly: column.readOnly,
    ...(column.type === "textarea" && { rows: column.rows }),
    ...(column.type === "checkbox" && { checked: column.checked }),
    ...(column.type === "select" && { options: column.options }),
    ...(column.type === "radio-group" && {
      orientation: column.orientation,
      options: column.options,
    }),
    ...(column.type === "checkbox-group" && { options: column.options }),
    ...(column.type === "file" && { fileOptions: column.fileOptions }),
    ...(column.type === "age" && {
      dateOfBirthField: column.dateOfBirthField || "",
      format: column.format,
      toDate: column.toDate,
    }),
  } as IFormField;

  switch (column.type) {
    case "text":
    case "number":
    case "email":
    case "password":
    case "date":
    case "time":
    case "datetime-local":
    case "tel":
    case "url":
    case "currency": {
      const isCurrency = column.type === "currency";
      const displayValue = isCurrency
        ? formatCurrencyDisplay(
            typeof value === "number" ? value : null
          )
        : value !== undefined && value !== null
          ? value
          : "";

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        let newValue: string | number | null;

        if (isCurrency) {
          newValue = parseCurrencyInput(inputValue);
        } else if (column.type === "number") {
          newValue = inputValue === "" ? null : Number(inputValue);
        } else {
          newValue = inputValue;
        }

        handleChange(newValue);
      };

      return (
        <div className={mobileView ? "space-y-1" : ""}>
          {label && (
            <Label className="text-xs font-medium">
              {label}
              {column.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          )}
          <Input
            type={isCurrency ? "text" : column.type}
            value={displayValue as string | number}
            placeholder={placeholder}
            required={column.required}
            min={column.validation?.min}
            max={column.validation?.max}
            minLength={column.validation?.minLength}
            maxLength={column.validation?.maxLength}
            pattern={column.validation?.pattern}
            onChange={handleInputChange}
            readOnly={column.readOnly}
            aria-invalid={hasError}
            className={mobileView ? "w-full" : "min-w-[120px]"}
          />
          {error && <FieldError className="text-xs">{error}</FieldError>}
        </div>
      );
    }

    case "textarea": {
      const textareaValue =
        value !== undefined && value !== null ? String(value) : "";

      return (
        <div className={mobileView ? "space-y-1" : ""}>
          {label && (
            <Label className="text-xs font-medium">
              {label}
              {column.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          )}
          <Textarea
            value={textareaValue}
            placeholder={placeholder}
            required={column.required}
            minLength={column.validation?.minLength}
            maxLength={column.validation?.maxLength}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={column.readOnly}
            aria-invalid={hasError}
            rows={column.rows || 2}
            className={mobileView ? "w-full" : "min-w-[200px]"}
          />
          {error && <FieldError className="text-xs">{error}</FieldError>}
        </div>
      );
    }

    case "select": {
      const selectValue =
        value !== undefined && value !== null ? String(value) : "";

      return (
        <div className={mobileView ? "space-y-1" : ""}>
          {label && (
            <Label className="text-xs font-medium">
              {label}
              {column.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          )}
          <Select
            value={selectValue}
            onValueChange={(newValue) => handleChange(newValue || null)}
          >
            <SelectTrigger
              aria-invalid={hasError}
              className={mobileView ? "w-full" : "min-w-[120px]"}
            >
              <SelectValue placeholder={placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {column.options &&
                Object.entries(column.options).map(([optionValue, optionLabel]) => {
                  const optionLabelWithVars = translate(
                    getFieldOptionKey(fieldName, optionValue),
                    optionLabel
                  );
                  return (
                    <SelectItem
                      key={optionValue}
                      value={optionValue}
                      disabled={column.readOnly}
                    >
                      {optionLabelWithVars}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
          {error && <FieldError className="text-xs">{error}</FieldError>}
        </div>
      );
    }

    case "checkbox": {
      const checked = value === true;

      return (
        <div className={mobileView ? "space-y-1" : "flex items-center"}>
          {label && (
            <Label className="text-xs font-medium flex items-center gap-2">
              <Checkbox
                checked={checked}
                onCheckedChange={(checked) => handleChange(checked === true)}
                disabled={column.readOnly}
                aria-invalid={hasError}
              />
              {label}
              {column.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          )}
          {!label && (
            <Checkbox
              checked={checked}
              onCheckedChange={(checked) => handleChange(checked === true)}
              disabled={column.readOnly}
              aria-invalid={hasError}
            />
          )}
          {error && <FieldError className="text-xs">{error}</FieldError>}
        </div>
      );
    }

    case "radio-group": {
      const radioValue =
        value !== undefined && value !== null ? String(value) : "";

      return (
        <div className={mobileView ? "space-y-2" : ""}>
          {label && (
            <Label className="text-xs font-medium block mb-1">
              {label}
              {column.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          )}
          <RadioGroup
            value={radioValue}
            onValueChange={(newValue) => handleChange(newValue || null)}
            orientation={column.orientation || "vertical"}
            disabled={column.readOnly}
          >
            {column.options &&
              Object.entries(column.options).map(([optionValue, optionLabel]) => {
                const optionLabelWithVars = translate(
                  getFieldOptionKey(fieldName, optionValue),
                  optionLabel
                );
                return (
                  <div key={optionValue} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={optionValue}
                      id={`${cellFieldName}-${optionValue}`}
                      aria-invalid={hasError}
                    />
                    <Label
                      htmlFor={`${cellFieldName}-${optionValue}`}
                      className="text-xs font-normal cursor-pointer"
                    >
                      {optionLabelWithVars}
                    </Label>
                  </div>
                );
              })}
          </RadioGroup>
          {error && <FieldError className="text-xs">{error}</FieldError>}
        </div>
      );
    }

    case "checkbox-group": {
      const selectedValues = Array.isArray(value) ? (value as string[]) : [];

      const handleCheckboxChange = (optionValue: string, checked: boolean) => {
        let newValues: string[];
        if (checked) {
          newValues = [...selectedValues, optionValue];
        } else {
          newValues = selectedValues.filter((v) => v !== optionValue);
        }
        handleChange(newValues);
      };

      return (
        <div className={mobileView ? "space-y-2" : ""}>
          {label && (
            <Label className="text-xs font-medium block mb-1">
              {label}
              {column.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          )}
          <div className="space-y-1">
            {column.options &&
              Object.entries(column.options).map(([optionValue, optionLabel]) => {
                const optionLabelWithVars = translate(
                  getFieldOptionKey(fieldName, optionValue),
                  optionLabel
                );
                const isChecked = selectedValues.includes(optionValue);
                return (
                  <div key={optionValue} className="flex items-center space-x-2">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(optionValue, checked === true)
                      }
                      disabled={column.readOnly}
                      aria-invalid={hasError}
                    />
                    <Label className="text-xs font-normal cursor-pointer">
                      {optionLabelWithVars}
                    </Label>
                  </div>
                );
              })}
          </div>
          {error && <FieldError className="text-xs">{error}</FieldError>}
        </div>
      );
    }

    case "age": {
      // Age field needs special handling - it depends on another field
      // For table cells, we'll need to handle this differently
      // For now, render as a read-only display or text input
      return (
        <div className={mobileView ? "space-y-1" : ""}>
          {label && (
            <Label className="text-xs font-medium">
              {label}
              {column.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          )}
          <AgeField
            field={fieldForComponent as IFormAgeField}
            name={cellFieldName}
          />
          {error && <FieldError className="text-xs">{error}</FieldError>}
        </div>
      );
    }

    case "file": {
      // File upload in table cells - simplified for now
      return (
        <div className={mobileView ? "space-y-1" : ""}>
          {label && (
            <Label className="text-xs font-medium">
              {label}
              {column.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          )}
          <Input
            type="file"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleChange(column.fileOptions?.multiple ? Array.from(files) : files[0]);
              }
            }}
            multiple={column.fileOptions?.multiple}
            accept={
              column.fileOptions?.allowedExtensions
                ?.map((ext) => `.${ext}`)
                .join(",")
            }
            disabled={column.readOnly}
            aria-invalid={hasError}
            className={mobileView ? "w-full" : "min-w-[120px]"}
          />
          {error && <FieldError className="text-xs">{error}</FieldError>}
        </div>
      );
    }

    default:
      return (
        <div className="text-xs text-muted-foreground">
          Unsupported column type: {column.type}
        </div>
      );
  }
}
