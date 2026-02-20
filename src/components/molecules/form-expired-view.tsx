import Image from "next/image";

import { IForm } from "@/common/interfaces/form.interfaces";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/atoms/card";

interface IFormExpiredViewProps {
  form: IForm;
}

export function FormExpiredView({ form }: IFormExpiredViewProps) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <main className="w-full max-w-2xl px-4 py-16">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/header.png"
            alt="Ceylinco Life"
            width={1776}
            height={212}
            priority
            className="h-auto w-full max-w-full"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Form Link Expired</CardTitle>
            <CardDescription>
              This form link has expired and is no longer available for
              submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-sm">
            <p>
              The form link you are trying to access has expired. Form links are
              valid for a limited time to ensure the security and accuracy of
              the information being collected.
            </p>
            <p>
              If you need to submit this form, please contact your Ceylinco Life
              representative to request a new form link. They will be happy to
              assist you with obtaining a fresh link.
            </p>
            <p>
              If you believe you have received this message in error, or if you
              have any questions, please contact your Ceylinco Life
              representative for kind assistance. We are happy to help.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
