import { IFormData } from "@/common/interfaces/formData";
import fs from "fs";
import path from "path";

export const fetchFormByFormId = (formId: string): IFormData => {
  const filePath = path.join(
    process.cwd(),
    "public",
    "form-data",
    `${formId}.json`
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};
