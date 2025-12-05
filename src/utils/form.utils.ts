import fs from "fs";
import path from "path";

import { IForm } from "@/common/interfaces/form.interfaces";

export function getForm(formId: string): IForm {
  const root = process.cwd();
  const formDataPath = path.join(root, "src", "forms", `${formId}.json`);
  if (!fs.existsSync(formDataPath)) {
    throw new Error(`Form data file not found: ${formDataPath}`);
  }
  const formData = fs.readFileSync(formDataPath, "utf8");
  return JSON.parse(formData) as IForm;
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
