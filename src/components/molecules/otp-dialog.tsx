"use client";

import Image from "next/image";

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
import { verifyOTP } from "@/services/workhub.service";
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

  const titleValue = otpConfig.dialog?.title ?? DEFAULT_OTP_TITLE;
  const contentValue = otpConfig.dialog?.content ?? DEFAULT_OTP_CONTENT;
  const buttonValue = otpConfig.dialog?.button ?? DEFAULT_OTP_BUTTON;
  const labelValue = otpConfig.dialog?.input?.label ?? DEFAULT_OTP_LABEL;
  const placeholderValue =
    otpConfig.dialog?.input?.placeholder ?? DEFAULT_OTP_PLACEHOLDER;

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

  const verifyOTPAction = async (formData: FormData) => {
    const otp = formData.get("otp") as string;
    await verifyOTP(otp, otpConfig);
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-3xl" showCloseButton={false}>
        <form action={verifyOTPAction} className="grid gap-4">
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
              <Input id="otp" name="otp" placeholder={placeholder} />
            </div>
          </div>
          <div>
            <Button type="submit">{buttonText}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
