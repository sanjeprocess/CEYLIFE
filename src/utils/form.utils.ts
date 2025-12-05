import fs from "fs";
import path from "path";

import yaml from "yaml";

import { IForm } from "@/common/interfaces/form.interfaces";

export function getForm(formId: string): IForm {
  const root = process.cwd();
  const formFolder = path.join(root, "src", "forms", formId);

  // Check if folder exists
  if (!fs.existsSync(formFolder)) {
    throw new Error(`Form folder not found: ${formFolder}`);
  }

  // Read all YAML files (both .yml and .yaml extensions)
  const files = fs
    .readdirSync(formFolder)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

  if (files.length === 0) {
    throw new Error(`No YAML files found in form folder: ${formFolder}`);
  }

  // Combine all YAML files into one object
  const formData: Record<string, unknown> = {};

  files.forEach((file) => {
    const filePath = path.join(formFolder, file);
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = yaml.parse(content);

    // Extract property name from filename (e.g., otp.metadata.yml -> metadata)
    // Support both .yml and .yaml extensions
    const propertyName = file
      .replace(`${formId}.`, "")
      .replace(".yml", "")
      .replace(".yaml", "");

    formData[propertyName] = parsed;
  });

  return formData as unknown as IForm;
}

export interface MissingSearchParam {
  paramKey: string;
  variableName: string;
}

export function getMissingSearchParams(
  searchParamsVariables: Record<string, string>,
  searchParams: { [key: string]: string | string[] | undefined }
): string[] {
  return Object.keys(searchParamsVariables).filter((key) => !searchParams[key]);
}

export function getMissingSearchParamsDetailed(
  searchParamsVariables: Record<string, string>,
  searchParams: { [key: string]: string | string[] | undefined }
): MissingSearchParam[] {
  return Object.entries(searchParamsVariables)
    .filter(([paramKey]) => !searchParams[paramKey])
    .map(([paramKey, variableName]) => ({
      paramKey,
      variableName,
    }));
}

export function validateSearchParams(
  searchParamsVariables: Record<string, string>,
  searchParams: { [key: string]: string | string[] | undefined }
): { isValid: boolean; missing: MissingSearchParam[] } {
  const missing = getMissingSearchParamsDetailed(
    searchParamsVariables,
    searchParams
  );
  return {
    isValid: missing.length === 0,
    missing,
  };
}
