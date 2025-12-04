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

export function getMissingSearchParams(
  searchParamsVariables: Record<string, string>,
  searchParams: { [key: string]: string | string[] | undefined }
) {
  return Object.keys(searchParamsVariables).filter((key) => !searchParams[key]);
}
