"use server";

import axios from "axios";
import { cookies } from "next/headers";

import { COOKIES } from "@/common/constants/cookie.constants";
import {
  IFormSubmission,
  IFormSubmissionResponse,
} from "@/common/interfaces/form.interfaces";
import { convertToString, getValueByPath } from "@/utils/path.utils";

import { mapFieldsToBody } from "./field-mapping.service";
import { replaceVariablesInTextWithRuntime } from "./variable-replacement.service";
import { getWorkhubToken } from "./workhub-auth.service";

export interface FormSubmissionResult {
  success: boolean;
  variables?: Record<string, string>;
  error?: string;
  errorReason?: string; // Specific error reason for display
  responseData?: unknown;
}

/**
 * Main function to submit form data to external endpoint
 */
export async function submitForm(
  submissionConfig: IFormSubmission,
  formValues: Record<string, unknown>,
  currentVariables: Record<string, string>,
  options?: {
    requestId?: string;
    requestIdFieldName?: string;
  }
): Promise<FormSubmissionResult> {
  const baseUrl = submissionConfig.baseUrl
    ? `${submissionConfig.baseUrl.replace(/\/$/, "")}/${submissionConfig.endpoint.replace(/^\//, "")}`
    : submissionConfig.endpoint;

  try {
    // Get runtime variables (like WORKHUB_TOKEN)
    const runtimeVariables: Record<string, string> = {};
    if (submissionConfig.requiresAccessToken) {
      const workhubToken = await getWorkhubToken();
      runtimeVariables.$WORKHUB_TOKEN = workhubToken;
    }

    // Build request headers
    const headers = buildRequestHeaders(
      submissionConfig,
      currentVariables,
      runtimeVariables
    );

    // Build query parameters
    const queryParams = buildQueryParams(
      submissionConfig,
      currentVariables,
      runtimeVariables
    );

    // Build request body from field mapping
    const baseBody = submissionConfig.fieldMapping
      ? await mapFieldsToBody(
          submissionConfig.fieldMapping,
          formValues,
          currentVariables,
          runtimeVariables
        )
      : formValues; // Fallback to raw form values if no mapping

    // Optionally inject requestId for WebSocket redirect-link flows
    const requestId = options?.requestId;
    const requestIdFieldName = options?.requestIdFieldName || "requestId";
    
    // Build final body with requestId if provided
    let body = baseBody;
    if (requestId) {
      if (baseBody && typeof baseBody === "object" && !Array.isArray(baseBody)) {
        // Merge requestId into existing object
        body = { ...(baseBody as Record<string, unknown>), [requestIdFieldName]: requestId };
      } else {
        // Create new object with requestId (baseBody might be null, undefined, array, or primitive)
        body = { [requestIdFieldName]: requestId };
        // If baseBody exists but isn't a plain object, try to include it
        if (baseBody !== null && baseBody !== undefined && Array.isArray(baseBody)) {
          // For arrays, wrap in an object with requestId
          body = { [requestIdFieldName]: requestId, data: baseBody };
        } else if (baseBody !== null && baseBody !== undefined) {
          // For primitives, wrap in an object
          body = { [requestIdFieldName]: requestId, value: baseBody };
        }
      }
    }

    console.log({
      method: submissionConfig.method,
      url: baseUrl,
      headers,
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      // Always send body if it exists, even if empty (for POST/PUT requests)
      data: body,
    });

    // Make the request
    const response = await axios.request({
      method: submissionConfig.method,
      url: baseUrl,
      headers,
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      // Always send body if it exists, even if empty (for POST/PUT requests)
      data: body,
    });

    // Check if submission was successful
    const successCheck = checkSubmissionSuccess(
      response,
      submissionConfig.response?.successCheck
    );

    if (!successCheck.success) {
      return {
        success: false,
        error: successCheck.error || "Form submission failed",
        errorReason: successCheck.errorReason,
        responseData: response.data,
      };
    }

    // Extract variables from response if configured
    let extractedVariables: Record<string, string> | undefined;
    if (submissionConfig.response?.variableMapping) {
      const extractionResult = extractVariablesFromResponse(
        response.data,
        submissionConfig.response.variableMapping
      );

      if (!extractionResult.success) {
        return {
          success: false,
          error:
            extractionResult.error || "Failed to extract response variables",
          errorReason: extractionResult.errorReason,
          responseData: response.data,
        };
      }

      extractedVariables = extractionResult.variables;

      // Update variables in cookies (server-side)
      if (extractedVariables) {
        await updateVariablesInCookies(extractedVariables);
      }
    }

    return {
      success: true,
      variables: extractedVariables,
      responseData: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusText = error.response?.statusText || "Unknown error";
      const status = error.response?.status || "N/A";
      const errorData = error.response?.data;

      console.error("[Form Submission] Network request failed:", {
        status,
        statusText,
        url: baseUrl,
        method: submissionConfig.method,
        errorData,
        message: error.message,
      });

      // Try to extract error message from response
      let errorReason: string | undefined;
      if (errorData) {
        if (typeof errorData === "string") {
          errorReason = errorData;
        } else if (typeof errorData === "object") {
          // Try common error message fields
          errorReason =
            (errorData as { message?: string }).message ||
            (errorData as { error?: string }).error ||
            (errorData as { errorMessage?: string }).errorMessage ||
            JSON.stringify(errorData);
        }
      } else {
        errorReason = `${status} ${statusText}`;
      }

      return {
        success: false,
        error: "Form submission failed",
        errorReason,
        responseData: errorData,
      };
    }

    console.error("[Form Submission] Unexpected error:", error);

    return {
      success: false,
      error: "An unexpected error occurred",
      errorReason:
        error instanceof Error ? error.message : "Unknown submission error",
    };
  }
}

/**
 * Builds request headers with variable replacement
 */
function buildRequestHeaders(
  submissionConfig: IFormSubmission,
  variables: Record<string, string>,
  runtimeVariables: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (submissionConfig.headers) {
    for (const header of submissionConfig.headers) {
      const interpolatedValue = replaceVariablesInTextWithRuntime(
        header.value,
        variables,
        runtimeVariables
      );
      headers[header.name] = interpolatedValue;
    }
  }

  return headers;
}

/**
 * Builds query parameters with variable replacement
 */
function buildQueryParams(
  submissionConfig: IFormSubmission,
  variables: Record<string, string>,
  runtimeVariables: Record<string, string>
): Record<string, string> {
  const params: Record<string, string> = {};

  if (submissionConfig.queryParams) {
    for (const param of submissionConfig.queryParams) {
      const interpolatedValue = replaceVariablesInTextWithRuntime(
        param.value,
        variables,
        runtimeVariables
      );
      params[param.name] = interpolatedValue;
    }
  }

  return params;
}

/**
 * Checks if submission was successful based on configuration
 */
function checkSubmissionSuccess(
  response: { status: number; data: unknown },
  successCheck?: IFormSubmissionResponse["successCheck"]
): { success: boolean; error?: string; errorReason?: string } {
  if (!successCheck || successCheck.length === 0) {
    // Default: 2xx status codes are success
    return {
      success: response.status >= 200 && response.status < 300,
    };
  }

  for (const check of successCheck) {
    if (check.type === "status") {
      if (check.values && check.values.includes(response.status)) {
        return { success: true };
      }
    } else if (check.type === "field") {
      if (check.path) {
        const value = getValueByPath(response.data, check.path);
        if (check.value !== undefined) {
          if (value === check.value) {
            return { success: true };
          }
        } else {
          // If no value specified, just check if field exists and is truthy
          if (value !== undefined && value !== null && value !== false) {
            return { success: true };
          }
        }
      }
    }
  }

  return {
    success: false,
    error: "Submission validation failed",
    errorReason: `Response did not meet success criteria (status: ${response.status})`,
  };
}

/**
 * Extracts variables from response based on variable mapping
 */
function extractVariablesFromResponse(
  responseData: unknown,
  variableMapping?: IFormSubmissionResponse["variableMapping"]
): {
  success: boolean;
  variables?: Record<string, string>;
  error?: string;
  errorReason?: string;
} {
  if (!variableMapping) {
    return { success: true, variables: {} };
  }

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
      error: "Failed to extract required variables from response",
      errorReason: `Missing required fields: ${missingRequiredFields.join(", ")}`,
    };
  }

  return {
    success: true,
    variables: extractedVariables,
  };
}

/**
 * Updates variables in cookies (server-side)
 */
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
