"use server";

import { cookies } from "next/headers";

import { COOKIES } from "@/common/constants/cookie.constants";
import { IForm } from "@/common/interfaces/form.interfaces";

export async function preProcessForm(
  form: IForm,
  context: {
    id: string;
    searchParams?: { [key: string]: string | string[] | undefined };
  }
) {
  // Only run on server side
  const { metadata } = form;
  const cookieStore = await cookies();

  // Set form id in cookie
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
  // searchParamsVariables maps: searchParamKey -> variableName
  // e.g., "cs" -> "contract_sequence"
  for (const [searchParamKey, variableName] of Object.entries(
    searchParamsVariables
  )) {
    const paramValue = searchParams[searchParamKey];
    variables[variableName] = Array.isArray(paramValue)
      ? paramValue.join(",")
      : paramValue ?? "";
  }
  cookieStore.set(COOKIES.VARIABLES, JSON.stringify(variables));
}
