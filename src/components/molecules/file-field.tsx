import { useRef } from "react";

import { IFormFileField } from "@/common/interfaces/form.interfaces";
import useFormStore from "@/stores/form.store";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../atoms/field";
import { Input } from "../atoms/input";

export function FileField({
  field,
  name,
}: {
  field: IFormFileField;
  name: string;
}) {
  const { values, updateValue } = useFormStore();
  const storedFile = values[name] as File | null | undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileOptions = field.fileOptions || {};
  const maxSize = fileOptions.maxSize;
  const allowedExtensions = fileOptions.allowedExtensions || [];
  const multiple = fileOptions.multiple || false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      updateValue(name, null);
      return;
    }

    const file = files[0];
    
    // Validate file extension
    if (allowedExtensions.length > 0) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        alert(
          `Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
      alert(`File size exceeds maximum allowed size of ${maxSizeMB} MB`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    updateValue(name, file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const acceptExtensions = allowedExtensions.length > 0
    ? allowedExtensions.map((ext) => `.${ext}`).join(",")
    : undefined;

  return (
    <Field>
      <FieldLabel>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <FieldContent>
        <div className="flex flex-col gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={acceptExtensions}
            multiple={multiple}
            required={field.required}
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {storedFile && (
            <div className="text-sm text-muted-foreground">
              Selected: {storedFile.name} ({formatFileSize(storedFile.size)})
            </div>
          )}
          {field.description && (
            <FieldDescription>{field.description}</FieldDescription>
          )}
          {maxSize && (
            <FieldDescription>
              Maximum file size: {formatFileSize(maxSize)}
            </FieldDescription>
          )}
        </div>
      </FieldContent>
    </Field>
  );
}
