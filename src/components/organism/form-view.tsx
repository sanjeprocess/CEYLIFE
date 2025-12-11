"use client";

import { useEffect, useState } from "react";

import { IForm } from "@/common/interfaces/form.interfaces";
import { SubmissionDialog } from "@/components/molecules/submission-dialog";
import useFormStore from "@/stores/form.store";
import { useLocalizationStore } from "@/stores/localization.store";

import { LayoutRenderer } from "../molecules/layout-renderer";

export function FormView({ form }: { form: IForm }) {
  const { initializeForm, submissionSuccess, submissionError, submissionErrorReason, resetSubmissionState } = useFormStore();
  const { initializeLocalization } = useLocalizationStore();

  useEffect(() => {
    initializeForm(form);
    initializeLocalization(form);
  }, [form, initializeForm, initializeLocalization]);

  // Derive dialog open state from submission state (avoid setState in effect)
  const isDialogOpen = submissionSuccess || !!submissionError;

  const handleDialogClose = () => {
    resetSubmissionState();
  };

  return (
    <>
      <div className="mt-12 grid grid-cols-1 gap-4">
        {form.layout.map((item, index) => (
          <LayoutRenderer key={index} layout={item} fields={form.fields} />
        ))}
      </div>
      <SubmissionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        messages={form.submission?.response?.messages}
        errorReason={submissionErrorReason || undefined}
      />
    </>
  );
}
