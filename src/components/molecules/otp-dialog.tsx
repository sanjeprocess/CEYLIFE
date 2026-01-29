"use client";

import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { IFormOtp } from "@/common/interfaces/form.interfaces";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import { requestOtp, verifyOtp } from "@/services/otp-verification.service";
import { refreshVariablesFromCookies } from "@/services/variable.service";
import { useVariableStore } from "@/stores/variable.store";
import {
  getOtpDialogTitleKey,
  getOtpDialogContentKey,
  getOtpDialogButtonKey,
  getOtpDialogInputLabelKey,
  getOtpDialogInputPlaceholderKey,
  getOtpRequestDialogTitleKey,
  getOtpRequestDialogContentKey,
  getOtpRequestDialogButtonKey,
} from "@/utils/fieldKey.utils";

import { P } from "../atoms/typography";

// Default values for OTP Request Dialog
const DEFAULT_REQUEST_TITLE = "Request OTP";
const DEFAULT_REQUEST_CONTENT =
  "Thank you for accessing the digital forms of Ceylinco Life. Click the button below to receive your One-Time Password (OTP) via SMS.";
const DEFAULT_REQUEST_BUTTON = "Proceed";

// Default values for OTP Verification Dialog
const DEFAULT_OTP_TITLE = "OTP Verification";
const DEFAULT_OTP_CONTENT =
  "Thank you for accessing the digital forms of Ceylinco Life. In order to proceed ahead, please enter the OTP you received via SMS.";
const DEFAULT_OTP_BUTTON = "Verify OTP";
const DEFAULT_OTP_LABEL = "OTP";
const DEFAULT_OTP_PLACEHOLDER = "Enter OTP";

// Retry countdown durations in seconds
const RETRY_COUNTDOWNS = [60, 150, 300]; // 60s, 2:30, 5:00
const MAX_RETRIES = 3;

type OtpStep = "request" | "verify";

/**
 * Formats seconds into MM:SS display format
 */
function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function OtpDialog({ otpConfig }: { otpConfig: IFormOtp }) {
  const translate = useTranslation();
  const { variables } = useVariableStore();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine initial step based on whether request config exists
  const hasRequestConfig = !!otpConfig.request;
  const [step, setStep] = useState<OtpStep>(
    hasRequestConfig ? "request" : "verify"
  );

  // Resend OTP state
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(RETRY_COUNTDOWNS[0]);
  const [isResending, setIsResending] = useState(false);

  // Request dialog values
  const requestTitleValue =
    otpConfig.requestDialog?.title ?? DEFAULT_REQUEST_TITLE;
  const requestContentValue =
    otpConfig.requestDialog?.content ?? DEFAULT_REQUEST_CONTENT;
  const requestButtonValue =
    otpConfig.requestDialog?.button ?? DEFAULT_REQUEST_BUTTON;

  // Verification dialog values
  const titleValue = otpConfig.dialog?.title ?? DEFAULT_OTP_TITLE;
  const contentValue = otpConfig.dialog?.content ?? DEFAULT_OTP_CONTENT;
  const buttonValue = otpConfig.dialog?.button ?? DEFAULT_OTP_BUTTON;
  const labelValue = otpConfig.dialog?.inputLabel ?? DEFAULT_OTP_LABEL;
  const placeholderValue =
    otpConfig.dialog?.inputPlaceholder ?? DEFAULT_OTP_PLACEHOLDER;

  // Translate request dialog
  const translatedRequestTitle = translate(
    getOtpRequestDialogTitleKey(),
    requestTitleValue
  );
  const translatedRequestContent = translate(
    getOtpRequestDialogContentKey(),
    requestContentValue
  );
  const translatedRequestButton = translate(
    getOtpRequestDialogButtonKey(),
    requestButtonValue
  );

  // Translate verification dialog
  const translatedTitle = translate(getOtpDialogTitleKey(), titleValue);
  const translatedContent = translate(getOtpDialogContentKey(), contentValue);
  const translatedButton = translate(getOtpDialogButtonKey(), buttonValue);
  const translatedLabel = translate(getOtpDialogInputLabelKey(), labelValue);
  const translatedPlaceholder = translate(
    getOtpDialogInputPlaceholderKey(),
    placeholderValue
  );

  // Apply variable replacement for request dialog
  const requestTitle = useVariableReplacement(translatedRequestTitle);
  const requestContent = useVariableReplacement(translatedRequestContent);
  const requestButtonText = useVariableReplacement(translatedRequestButton);

  // Apply variable replacement for verification dialog
  const title = useVariableReplacement(translatedTitle);
  const content = useVariableReplacement(translatedContent);
  const buttonText = useVariableReplacement(translatedButton);
  const label = useVariableReplacement(translatedLabel);
  const placeholder = useVariableReplacement(translatedPlaceholder);

  // Countdown timer effect
  useEffect(() => {
    if (step !== "verify" || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleRequestOtp = async () => {
    if (!otpConfig.request) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await requestOtp(otpConfig.request, variables);

      if (result.success) {
        // Move to verification step and start countdown
        setStep("verify");
        setCountdown(RETRY_COUNTDOWNS[0]);
        setError(null);
      } else {
        setError(result.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("OTP request error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = useCallback(async () => {
    if (!otpConfig.request || retryCount >= MAX_RETRIES || countdown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      const result = await requestOtp(otpConfig.request, variables);

      if (result.success) {
        // Increment retry count and set next countdown
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        // Set countdown based on retry count (use last value if exceeded array)
        const countdownIndex = Math.min(newRetryCount, RETRY_COUNTDOWNS.length - 1);
        setCountdown(RETRY_COUNTDOWNS[countdownIndex]);
      } else {
        setError(result.error || "Failed to resend OTP");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("OTP resend error:", err);
    } finally {
      setIsResending(false);
    }
  }, [otpConfig.request, retryCount, countdown, variables]);

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const otp = formData.get("otp") as string;

    if (!otp || otp.trim() === "") {
      setError("Please enter an OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOtp(otp, otpConfig, variables);

      if (result.success) {
        // Refresh variables from cookies to sync new data
        refreshVariablesFromCookies();
        // Close dialog on success
        setIsOpen(false);
      } else {
        setError(result.error || "Verification failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("OTP verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate retries remaining for display
  const retriesRemaining = MAX_RETRIES - retryCount;

  // Render Request Step
  if (step === "request") {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-3xl" showCloseButton={false}>
          <div className="grid gap-4">
            <div className="mt-4">
              <Image
                src="/images/header.png"
                alt="Ceylinco Life"
                width={1776}
                height={212}
              />
            </div>
            <DialogHeader>
              <DialogTitle>{requestTitle}</DialogTitle>
            </DialogHeader>
            <P>{requestContent}</P>
            {error && <P className="text-sm text-red-600">{error}</P>}
            <div>
              <Button
                type="button"
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {isLoading ? "Sending..." : requestButtonText}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render Verification Step
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-3xl" showCloseButton={false}>
        <form onSubmit={handleVerifyOtp} className="grid gap-4">
          <div className="mt-4">
            <Image
              src="/images/header.png"
              alt="Ceylinco Life"
              width={1776}
              height={212}
            />
          </div>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <P>{content}</P>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="otp">{label}</Label>
              <Input
                id="otp"
                name="otp"
                placeholder={placeholder}
                disabled={isLoading}
              />
            </div>

            {/* Resend OTP Section */}
            {hasRequestConfig && (
              <div className="text-sm text-muted-foreground">
                {countdown > 0 ? (
                  <P>
                    Resend OTP in{" "}
                    <span className="font-medium text-foreground">
                      {formatCountdown(countdown)}
                    </span>
                  </P>
                ) : retryCount >= MAX_RETRIES ? (
                  <P className="text-amber-600">
                    Maximum OTP requests reached. Please contact support if you
                    need assistance.
                  </P>
                ) : (
                  <P className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending}
                      className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                    >
                      {isResending && (
                        <LoaderCircle className="h-3 w-3 animate-spin" />
                      )}
                      {isResending ? "Sending..." : "Resend OTP"}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      ({retriesRemaining} {retriesRemaining === 1 ? "attempt" : "attempts"} remaining)
                    </span>
                  </P>
                )}
              </div>
            )}

            {error && <P className="text-sm text-red-600">{error}</P>}
          </div>
          <div>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {isLoading ? "Verifying..." : buttonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
