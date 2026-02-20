"use client";

import cookies from "js-cookie";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { COOKIES } from "@/common/constants/cookie.constants";
import { IFormLayoutItem } from "@/common/interfaces/form.interfaces";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import { useWebSocket } from "@/hooks/useWebSocket.hook";
import { submitForm } from "@/services/form-submission.service";
import { validateForm } from "@/services/form-validation.service";
import { styles } from "@/services/render.service";
import { refreshVariablesFromCookies } from "@/services/variable.service";
import useFormStore from "@/stores/form.store";
import { useVariableStore } from "@/stores/variable.store";
import { cn } from "@/utils/shadcn.utils";

import { Button } from "../atoms/button";

interface SubmitButtonProps {
  layout: IFormLayoutItem;
  submitText: string | number | boolean;
}

export function SubmitButton({ layout, submitText }: SubmitButtonProps) {
  const router = useRouter();
  const translate = useTranslation();
  const translationKey = layout.key;
  const {
    isSubmitting,
    isWaitingForRedirect,
    form,
    getComputedValues,
    setSubmitting,
    setWaitingForRedirect,
    setRedirectError,
    setSubmissionError,
    setSubmissionSuccess,
    setFieldErrors,
  } = useFormStore();
  const { variables } = useVariableStore();

  const listenToRedirectLink = !!form?.metadata?.listenToRedirectLink;
  const requestIdFieldName = form?.metadata?.requestIdFieldName || "requestId";
  const requestIdTimeoutMs = (form?.metadata?.requestIdTimeoutSeconds ?? 120) * 1000; // Default 2 minutes
  const websocketUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
      "wss://2h66jss926.execute-api.ap-south-1.amazonaws.com/prod",
    []
  );

  const [pendingRedirect, setPendingRedirect] = useState<{
    redirectLink: string;
    requestId: string;
  } | null>(null);

  const { getRequestId: getWsRequestId, sendInit, isReady } = useWebSocket({
    url: websocketUrl,
    enabled: listenToRedirectLink,
    onRedirect: (redirectLink, requestId) => {
      setPendingRedirect({ redirectLink, requestId });
    },
    onError: (err) => {
      setRedirectError(err);
      setSubmitting(false);
    },
  });

  useEffect(() => {
    if (!pendingRedirect) return;
    // close modal + redirect
    setWaitingForRedirect(false);
    router.push(pendingRedirect.redirectLink);
  }, [pendingRedirect, router, setWaitingForRedirect]);

  const translatedText = translationKey
    ? translate(translationKey, String(submitText))
    : String(submitText);

  const buttonText = useVariableReplacement(translatedText);

  const loadingText = layout.loadingTextKey
    ? translate(layout.loadingTextKey, layout.loadingText || "Submitting...")
    : layout.loadingText || "Submitting...";

  const variant = layout.variant || "default";

  const handleSubmit = async () => {
    if (!form || !form.submission) {
      console.error("[SubmitButton] Form or submission config not found");
      return;
    }

    // Validate all fields
    const formValues = getComputedValues();
    const validationResult = validateForm(form, formValues);

    if (!validationResult.isValid) {
      // Store field errors in form store
      const fieldErrorsMap: Record<string, string> = {};
      validationResult.errors.forEach((err) => {
        fieldErrorsMap[err.fieldKey] = err.error;
      });
      setFieldErrors(fieldErrorsMap);

      // Show short, user-friendly error message
      const errorCount = validationResult.errors.length;
      const errorMessage =
        errorCount === 1
          ? "Please fix the error below and try again."
          : `Please fix the ${errorCount} errors below and try again. Look for fields marked in red for details.`;
      setSubmissionError("Validation failed", errorMessage);
      return;
    }

    // Start submission
    setSubmitting(true);

    try {
      if (listenToRedirectLink) {
        setRedirectError(null);
        setWaitingForRedirect(true);

        const formId = cookies.get(COOKIES.CURRENT_FORM_ID) || "";
        if (!formId) {
          setWaitingForRedirect(false);
          setSubmitting(false);
          setSubmissionError("Submission failed", "Missing form id for WebSocket init");
          return;
        }

        // Wait for WS connection before sending init
        const connectionEstablished = await waitForConnection({
          getIsReady: isReady,
          timeoutMs: 10000,
        });

        if (!connectionEstablished) {
          setWaitingForRedirect(false);
          setSubmitting(false);
          setSubmissionError(
            "Connection failed",
            "Could not establish WebSocket connection. Please try again."
          );
          return;
        }

        // Send init message
        const initSent = sendInit(formId, { timestamp: new Date().toISOString() });
        if (!initSent) {
          setWaitingForRedirect(false);
          setSubmitting(false);
          setSubmissionError(
            "Init failed",
            "Failed to send WebSocket init message. Please try again."
          );
          return;
        }

        // Wait for requestId response
        const requestId = await waitForRequestId({
          getRequestId: () => getWsRequestId(),
          timeoutMs: requestIdTimeoutMs,
        });

        const result = await submitForm(form.submission, formValues, variables, {
          requestId,
          requestIdFieldName,
        });

        if (!result.success) {
          setWaitingForRedirect(false);
          setSubmissionError(
            result.error || "Submission failed",
            result.errorReason
          );
          return;
        }

        // Update variables if extracted from response
        if (result.variables) {
          useVariableStore.getState().mergeVariables(result.variables, "api");
        }
        refreshVariablesFromCookies();

        // Keep waiting modal open until redirect arrives
        setSubmitting(false);
        return;
      }

      const result = await submitForm(form.submission, formValues, variables);

      if (result.success) {
        // Update variables if extracted from response
        if (result.variables) {
          useVariableStore.getState().mergeVariables(result.variables, "api");
        }
        // Also refresh from cookies to ensure sync
        refreshVariablesFromCookies();
        setSubmissionSuccess(
          true,
          result.responseData as Record<string, unknown>
        );
      } else {
        setSubmissionError(
          result.error || "Submission failed",
          result.errorReason
        );
      }
    } catch (error) {
      console.error("[SubmitButton] Submission error:", error);
      setWaitingForRedirect(false);
      setSubmissionError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <>
      <div
        className={cn("flex w-full", {
          "justify-center": layout.align === "center",
          "justify-end": layout.align === "right",
          "justify-start": layout.align === "left" || !layout.align,
        })}
        style={styles({
          margin: layout.margin,
        })}
      >
        <Button
          type="button"
          variant={variant}
          disabled={isSubmitting || isWaitingForRedirect}
          className="gap-2"
          onClick={handleSubmit}
        >
          {(isSubmitting || isWaitingForRedirect) && (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          )}
          {isSubmitting ? loadingText : buttonText}
        </Button>
      </div>
    </>
  );
}

async function waitForConnection(opts: {
  getIsReady: () => boolean;
  timeoutMs: number;
}): Promise<boolean> {
  if (opts.getIsReady()) return true;

  const start = Date.now();
  const checkInterval = 100; // Check every 100ms

  while (Date.now() - start < opts.timeoutMs) {
    await new Promise((r) => setTimeout(r, checkInterval));
    if (opts.getIsReady()) return true;
  }

  return false;
}

async function waitForRequestId(opts: {
  getRequestId: () => string | null;
  timeoutMs: number;
}) {
  const start = Date.now();
  const checkInterval = 50; // Check every 50ms
  // Polling is fine here because requestId only arrives once and quickly.
  while (Date.now() - start < opts.timeoutMs) {
    const id = opts.getRequestId();
    if (id) return id;
    await new Promise((r) => setTimeout(r, checkInterval));
  }
  throw new Error("Timed out waiting for requestId");
}
