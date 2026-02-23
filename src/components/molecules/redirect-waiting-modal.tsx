"use client";

import { useEffect, useMemo, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/atoms/dialog";
import { cn } from "@/utils/shadcn.utils";

interface RedirectWaitingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  error?: string | null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Logarithmic-ish progress: fast early, slows down near the end.
 * We intentionally cap at 99% until the redirect arrives.
 */
function computeFakeProgress(elapsedMs: number) {
  const t = Math.max(0, elapsedMs) / 1000; // seconds
  const k = 30; // larger => slower curve
  const raw = 100 * (1 - Math.exp(-t / k));
  return clamp(raw, 0, 99);
}

export function RedirectWaitingModal({
  isOpen,
  title = "Redirecting to signature",
  message = "Please wait a few seconds while we redirect you to sign this document.",
  error,
}: RedirectWaitingModalProps) {
  const start = useMemo(() => (isOpen ? Date.now() : null), [isOpen]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || !start) {
      setProgress(0);
      return;
    }

    const tick = () => {
      setProgress(computeFakeProgress(Date.now() - start));
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [isOpen, start]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        // Full-screen, non-dismissible overlay
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn(
          "max-w-none border-0 p-0 shadow-none sm:rounded-none sm:max-w-full!",
          "h-dvh w-dvw"
        )}
      >
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div className="w-full max-w-xl px-6">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">{title}</DialogTitle>
            </DialogHeader>

            <div className="mt-4 text-center">
              <p className="text-muted-foreground">{message}</p>
            </div>

            <div className="mt-8">
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                {Math.round(progress)}%
              </div>

              {error ? (
                <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

