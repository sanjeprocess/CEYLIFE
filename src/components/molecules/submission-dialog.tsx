"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

import { IFormSubmissionMessages } from "@/common/interfaces/form.interfaces";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { useTranslation } from "@/hooks/useTranslation.hook";
import { useVariableReplacement } from "@/hooks/useVariableReplacement.hook";
import useFormStore from "@/stores/form.store";

interface SubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages?: IFormSubmissionMessages;
  errorReason?: string;
}

const DEFAULT_SUCCESS_TITLE = "Success";
const DEFAULT_SUCCESS_CONTENT = "Form submitted successfully!";
const DEFAULT_ERROR_TITLE = "Error";
const DEFAULT_ERROR_GENERIC_MESSAGE =
  "Something went wrong while submitting the form";

export function SubmissionDialog({
  isOpen,
  onClose,
  messages,
  errorReason,
}: SubmissionDialogProps) {
  const translate = useTranslation();
  const { submissionSuccess, submissionError } = useFormStore();
  const [isClosing, setIsClosing] = useState(false);

  // Determine if this is a success or error dialog
  const isSuccess = submissionSuccess && !submissionError;
  const isError = !!submissionError;

  // Get success messages
  const successTitle = messages?.success?.title || DEFAULT_SUCCESS_TITLE;
  const successContent = messages?.success?.content || DEFAULT_SUCCESS_CONTENT;

  // Get error messages
  const errorTitle = messages?.error?.title || DEFAULT_ERROR_TITLE;
  const errorContent = messages?.error?.content || errorReason || "";

  // Translate messages
  const translatedSuccessTitle = translate(
    "submission.messages.success.title",
    successTitle
  );
  const translatedSuccessContent = translate(
    "submission.messages.success.content",
    successContent
  );
  const translatedErrorTitle = translate(
    "submission.messages.error.title",
    errorTitle
  );
  const translatedErrorContent = translate(
    "submission.messages.error.content",
    errorContent
  );
  const translatedGenericError = translate(
    "submission.messages.error.generic",
    DEFAULT_ERROR_GENERIC_MESSAGE
  );

  // Apply variable replacement
  const finalSuccessTitle = useVariableReplacement(translatedSuccessTitle);
  const finalSuccessContent = useVariableReplacement(translatedSuccessContent);
  const finalErrorTitle = useVariableReplacement(translatedErrorTitle);
  const finalErrorContent = useVariableReplacement(translatedErrorContent);
  const finalGenericError = useVariableReplacement(translatedGenericError);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150); // Small delay for smooth animation
  };

  if (!isOpen || (!isSuccess && !isError)) {
    return null;
  }

  return (
    <Dialog open={isOpen && !isClosing}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isSuccess ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <DialogTitle>
              {isSuccess ? finalSuccessTitle : finalErrorTitle}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          {isSuccess ? (
            <p className="text-muted-foreground text-sm">
              {finalSuccessContent}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">{finalGenericError}</p>
              {errorReason && (
                <p className="text-muted-foreground text-xs">
                  {finalErrorContent || errorReason}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="default">
            {isSuccess ? "Close" : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
