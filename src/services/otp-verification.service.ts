"use server";

import axios from "axios";
import { cookies } from "next/headers";

import { COOKIES } from "@/common/constants/cookie.constants";
import { IFormOtp } from "@/common/interfaces/form.interfaces";
import { convertToString, getValueByPath } from "@/utils/path.utils";

import { replaceVariablesInTextWithRuntime } from "./variable-replacement.service";
import { getWorkhubToken } from "./workhub-auth.service";

export interface OtpVerificationResult {
  success: boolean;
  variables?: Record<string, string>;
  error?: string;
}

export async function verifyOtp(
  otp: string,
  otpConfig: IFormOtp,
  currentVariables: Record<string, string>
): Promise<OtpVerificationResult> {
  const baseUrl = `${otpConfig.verification.baseUrl.replace(/\/$/, "")}/${otpConfig.verification.endpoint.replace(/^\//, "")}`;

  try {
    const workhubToken = await getWorkhubToken();

    const runtimeVariables = {
      $WORKHUB_TOKEN: workhubToken,
    };

    const allVariables = {
      ...currentVariables,
      otp,
    };

    const headers = buildRequestHeaders(
      otpConfig.verification,
      allVariables,
      runtimeVariables
    );

    const queryParams = buildQueryParams(
      otpConfig.verification,
      allVariables,
      runtimeVariables
    );

    const response = await axios.request({
      method: otpConfig.verification.method,
      url: baseUrl,
      headers,
      params: queryParams,
    });

    if (Array.isArray(response.data) && response.data.length === 0) {
      return {
        success: false,
        error: "Invalid OTP. Please check and try again.",
      };
    }

    if (!response.data) {
      return {
        success: false,
        error: "No data received from server. Please try again.",
      };
    }

    const extractedVariables = extractVariablesFromResponse(
      response.data,
      otpConfig.verification.response.variableMapping
    );

    if (!extractedVariables.success) {
      return {
        success: false,
        error:
          extractedVariables.error || "Unable to process the response data.",
      };
    }

    await updateVariablesInCookies(extractedVariables.variables!);

    return {
      success: true,
      variables: extractedVariables.variables,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusText = error.response?.statusText || "Unknown error";
      const status = error.response?.status || "N/A";

      console.error("[OTP Verification] Network request failed:", {
        status,
        statusText,
        url: baseUrl,
        method: otpConfig.verification.method,
        errorData: error.response?.data,
        message: error.message,
      });

      return {
        success: false,
        error: `OTP verification failed: ${status} ${statusText}`,
      };
    }

    console.error("[OTP Verification] Unexpected error:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown verification error",
    };
  }
}

function buildQueryParams(
  verification: IFormOtp["verification"],
  variables: Record<string, string>,
  runtimeVariables: Record<string, string>
): Record<string, string> {
  const params: Record<string, string> = {};

  for (const param of verification.queryParams) {
    const interpolatedValue = replaceVariablesInTextWithRuntime(
      param.value,
      variables,
      runtimeVariables
    );
    params[param.name] = interpolatedValue;
  }

  return params;
}

function buildRequestHeaders(
  verification: IFormOtp["verification"],
  variables: Record<string, string>,
  runtimeVariables: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const header of verification.headers) {
    const interpolatedValue = replaceVariablesInTextWithRuntime(
      header.value,
      variables,
      runtimeVariables
    );
    headers[header.name] = interpolatedValue;
  }

  return headers;
}

function extractVariablesFromResponse(
  responseData: unknown,
  variableMapping: IFormOtp["verification"]["response"]["variableMapping"]
): { success: boolean; variables?: Record<string, string>; error?: string } {
  const extractedVariables: Record<string, string> = {};
  const missingRequiredFields: string[] = [];

  for (const mapping of variableMapping) {
    const value = getValueByPath(responseData, mapping.path);

    if (value === undefined || value === null) {
      if (mapping.required) {
        missingRequiredFields.push(mapping.to);
      }
      continue;
    }

    extractedVariables[mapping.to] = convertToString(value);
  }

  if (missingRequiredFields.length > 0) {
    return {
      success: false,
      error:
        "There is not enough data to open the form. Please contact support.",
    };
  }

  return {
    success: true,
    variables: extractedVariables,
  };
}

async function updateVariablesInCookies(
  newVariables: Record<string, string>
): Promise<void> {
  const cookieStore = await cookies();
  const existingVariablesCookie = cookieStore.get(COOKIES.VARIABLES);
  const existingVariables = existingVariablesCookie
    ? JSON.parse(existingVariablesCookie.value)
    : {};

  const updatedVariables = {
    ...existingVariables,
    ...newVariables,
  };

  cookieStore.set(COOKIES.VARIABLES, JSON.stringify(updatedVariables));
}
