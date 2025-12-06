"use server";

import axios from "axios";

const WORKHUB_AUTH_URL = "https://app.workhub24.com/api/auth/token";

interface WorkhubTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export async function getWorkhubToken(): Promise<string> {
  const clientId = process.env.WORKHUB_CLIENT_ID;
  const clientSecret = process.env.WORKHUB_CLIENT_SECRET;
  const grantType = process.env.WORKHUB_GRANT_TYPE;

  if (!clientId || !clientSecret || !grantType) {
    throw new Error(
      "Missing Workhub credentials. Ensure WORKHUB_CLIENT_ID, WORKHUB_CLIENT_SECRET, and WORKHUB_GRANT_TYPE are set."
    );
  }

  try {
    const response = await axios.post<WorkhubTokenResponse>(
      WORKHUB_AUTH_URL,
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: grantType,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.access_token) {
      throw new Error("Workhub token response missing access_token");
    }

    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusText = error.response?.statusText || "Unknown error";
      const status = error.response?.status || "N/A";
      const errorData = error.response?.data || error.message;

      console.error("[Workhub Auth] Failed to fetch token:", {
        status,
        statusText,
        errorData,
        url: WORKHUB_AUTH_URL,
      });

      throw new Error(
        `Failed to fetch Workhub token: ${status} ${statusText} - ${JSON.stringify(errorData)}`
      );
    }

    console.error("[Workhub Auth] Unexpected error:", error);
    throw error;
  }
}
