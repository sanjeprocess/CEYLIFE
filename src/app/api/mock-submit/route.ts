/**
 * Mock Submit API Route
 *
 * Development-only endpoint for testing form submissions without hitting real APIs.
 * This endpoint simulates API responses and provides debugging capabilities.
 *
 * Query Parameters:
 * - error: Simulate error response (true, 400, 500, etc.)
 * - status: Override HTTP status code (200, 201, 400, 500, etc.)
 * - delay: Add artificial delay in milliseconds
 * - missingFields: Comma-separated list of fields to omit from response
 * - invalidStatus: Override data.status value
 */

import { NextRequest } from "next/server";

interface MockResponseData {
  status: string;
  submission_id?: string;
  reference_number?: string;
  tracking_code?: string;
}

interface MockResponse {
  data: MockResponseData;
  _mockMetadata?: {
    requestId: string;
    timestamp: string;
    method: string;
    receivedHeaders?: Record<string, string>;
    receivedQueryParams?: Record<string, string>;
    receivedBody?: unknown;
  };
}

/**
 * Generate unique request ID for tracing
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate mock IDs for response fields
 */
function generateMockIds(): {
  submissionId: string;
  referenceNumber: string;
  trackingCode: string;
} {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();

  return {
    submissionId: `mock-${timestamp}-${random}`,
    referenceNumber: `REF-${timestamp}`,
    trackingCode: `TRACK-${random}`,
  };
}

/**
 * Simulate delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Log request details to console
 */
function logRequest(
  requestId: string,
  method: string,
  url: string,
  headers: Record<string, string>,
  queryParams: Record<string, string>,
  body: unknown
): void {
  const timestamp = new Date().toISOString();

  console.log("\n" + "=".repeat(80));
  console.log(`[Mock-Submit] [${requestId}] ${timestamp}`);
  console.log("=".repeat(80));
  console.log(`Method: ${method}`);
  console.log(`URL: ${url}`);
  console.log("\nHeaders:");
  console.log(JSON.stringify(headers, null, 2));
  console.log("\nQuery Parameters:");
  console.log(JSON.stringify(queryParams, null, 2));
  console.log("\nRequest Body:");
  console.log(JSON.stringify(body, null, 2));
  console.log("=".repeat(80) + "\n");
}

/**
 * Generate mock response based on query parameters
 */
function generateMockResponse(
  queryParams: Record<string, string>,
  requestBody: unknown,
  requestId: string,
  method: string,
  headers: Record<string, string>
): { status: number; data: MockResponse } {
  const ids = generateMockIds();
  const timestamp = new Date().toISOString();

  // Parse query parameters
  const errorParam = queryParams.error;
  const statusParam = queryParams.status;
  const missingFieldsParam = queryParams.missingFields;
  const invalidStatusParam = queryParams.invalidStatus;

  // Determine HTTP status code
  let httpStatus = 200;
  if (statusParam) {
    const parsedStatus = parseInt(statusParam, 10);
    if (!isNaN(parsedStatus) && parsedStatus >= 100 && parsedStatus < 600) {
      httpStatus = parsedStatus;
    }
  } else if (errorParam) {
    if (errorParam === "true") {
      httpStatus = 400;
    } else {
      const parsedError = parseInt(errorParam, 10);
      if (!isNaN(parsedError) && parsedError >= 400 && parsedError < 600) {
        httpStatus = parsedError;
      } else {
        httpStatus = 400;
      }
    }
  }

  // Determine if this is an error response
  const isError = httpStatus >= 400;

  // Build response data
  const responseData: MockResponseData = {
    status: invalidStatusParam || (isError ? "error" : "success"),
  };

  // Add fields unless they're in missingFields or it's an error
  if (!isError) {
    const missingFields = missingFieldsParam
      ? missingFieldsParam.split(",").map((f) => f.trim())
      : [];

    if (!missingFields.includes("submission_id")) {
      responseData.submission_id = ids.submissionId;
    }
    if (!missingFields.includes("reference_number")) {
      responseData.reference_number = ids.referenceNumber;
    }
    if (!missingFields.includes("tracking_code")) {
      responseData.tracking_code = ids.trackingCode;
    }
  }

  // Build full response
  const response: MockResponse = {
    data: responseData,
    _mockMetadata: {
      requestId,
      timestamp,
      method,
      receivedHeaders: headers,
      receivedQueryParams: queryParams,
      receivedBody: requestBody,
    },
  };

  return {
    status: httpStatus,
    data: response,
  };
}

/**
 * Common handler for all HTTP methods
 */
async function handleRequest(request: NextRequest): Promise<Response> {
  const requestId = generateRequestId();
  const method = request.method;
  const url = request.url;

  // Extract query parameters
  const queryParams: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // Extract headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Parse request body (if present)
  let body: unknown = null;
  try {
    if (request.body) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await request.json();
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const formData = await request.formData();
        const formObj: Record<string, unknown> = {};
        formData.forEach((value, key) => {
          formObj[key] = value;
        });
        body = formObj;
      } else {
        body = await request.text();
      }
    }
  } catch (error) {
    // If body parsing fails, log but continue
    console.error(`[Mock-Submit] [${requestId}] Failed to parse body:`, error);
  }

  // Log request
  logRequest(requestId, method, url, headers, queryParams, body);

  // Check for delay parameter
  const delayParam = queryParams.delay;
  if (delayParam) {
    const delayMs = parseInt(delayParam, 10);
    if (!isNaN(delayMs) && delayMs > 0 && delayMs <= 30000) {
      // Cap delay at 30 seconds for safety
      console.log(
        `[Mock-Submit] [${requestId}] Simulating delay of ${delayMs}ms...`
      );
      await delay(delayMs);
    }
  }

  // Generate mock response
  const { status, data } = generateMockResponse(
    queryParams,
    body,
    requestId,
    method,
    headers
  );

  // Log response
  console.log(`[Mock-Submit] [${requestId}] Responding with status ${status}`);

  // Return response
  return Response.json(data, { status });
}

// Export handlers for all HTTP methods
export async function GET(request: NextRequest): Promise<Response> {
  return handleRequest(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return handleRequest(request);
}

export async function PUT(request: NextRequest): Promise<Response> {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest): Promise<Response> {
  return handleRequest(request);
}

export async function PATCH(request: NextRequest): Promise<Response> {
  return handleRequest(request);
}
