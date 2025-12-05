"use server";

import { cookies } from "next/headers";

import { COOKIES } from "@/common/constants/cookie.constants";
import { IForm } from "@/common/interfaces/form.interfaces";

const isDevelopment = process.env.NODE_ENV === "development";

function sanitizeValue(value: string): string {
  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function preProcessForm(
  form: IForm,
  context: {
    id: string;
    searchParams?: { [key: string]: string | string[] | undefined };
  }
) {
  const { metadata } = form;
  const cookieStore = await cookies();

  cookieStore.set(COOKIES.CURRENT_FORM_ID, context.id);

  if (metadata.searchParamsVariables && context.searchParams) {
    await setInitialVariables(
      metadata.searchParamsVariables,
      context.searchParams
    );
  }
}

export async function setInitialVariables(
  searchParamsVariables: Record<string, string>,
  searchParams: { [key: string]: string | string[] | undefined }
) {
  const cookieStore = await cookies();
  const variables: Record<string, string> = {};
  const warnings: string[] = [];

  for (const [searchParamKey, variableName] of Object.entries(
    searchParamsVariables
  )) {
    const paramValue = searchParams[searchParamKey];

    if (paramValue === undefined || paramValue === "") {
      warnings.push(
        `Search param '${searchParamKey}' (variable: ${variableName}) is missing or empty`
      );
      variables[variableName] = "";
      continue;
    }

    const rawValue = Array.isArray(paramValue)
      ? paramValue.join(",")
      : paramValue;

    variables[variableName] = sanitizeValue(rawValue);
  }

  if (isDevelopment && warnings.length > 0) {
    console.warn("[FormService] Variable initialization warnings:", warnings);
  }

  cookieStore.set(COOKIES.VARIABLES, JSON.stringify(variables));
}
