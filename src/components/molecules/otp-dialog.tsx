"use client";

import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
import { verifyOtp } from "@/services/otp-verification.service";
import { refreshVariablesFromCookies } from "@/services/variable.service";
import { useVariableStore } from "@/stores/variable.store";
import {
  getOtpDialogTitleKey,
  getOtpDialogContentKey,
  getOtpDialogButtonKey,
  getOtpDialogInputLabelKey,
  getOtpDialogInputPlaceholderKey,
} from "@/utils/fieldKey.utils";

import { P } from "../atoms/typography";

const DEFAULT_OTP_TITLE = "OTP Verification";
const DEFAULT_OTP_CONTENT =
  "Thank you for accessing the digital forms of Ceylinco Life. In order to proceed ahead, please enter the OTP you received via SMS.";
const DEFAULT_OTP_BUTTON = "Verify OTP";
const DEFAULT_OTP_LABEL = "OTP";
const DEFAULT_OTP_PLACEHOLDER = "Enter OTP";

export function OtpDialog({ otpConfig }: { otpConfig: IFormOtp }) {
  const translate = useTranslation();
  const { variables } = useVariableStore();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleValue = otpConfig.dialog?.title ?? DEFAULT_OTP_TITLE;
  const contentValue = otpConfig.dialog?.content ?? DEFAULT_OTP_CONTENT;
  const buttonValue = otpConfig.dialog?.button ?? DEFAULT_OTP_BUTTON;
  const labelValue = otpConfig.dialog?.inputLabel ?? DEFAULT_OTP_LABEL;
  const placeholderValue =
    otpConfig.dialog?.inputPlaceholder ?? DEFAULT_OTP_PLACEHOLDER;

  const translatedTitle = translate(getOtpDialogTitleKey(), titleValue);
  const translatedContent = translate(getOtpDialogContentKey(), contentValue);
  const translatedButton = translate(getOtpDialogButtonKey(), buttonValue);
  const translatedLabel = translate(getOtpDialogInputLabelKey(), labelValue);
  const translatedPlaceholder = translate(
    getOtpDialogInputPlaceholderKey(),
    placeholderValue
  );

  const title = useVariableReplacement(translatedTitle);
  const content = useVariableReplacement(translatedContent);
  const buttonText = useVariableReplacement(translatedButton);
  const label = useVariableReplacement(translatedLabel);
  const placeholder = useVariableReplacement(translatedPlaceholder);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-3xl" showCloseButton={false}>
        <form onSubmit={handleSubmit} className="grid gap-4">
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
