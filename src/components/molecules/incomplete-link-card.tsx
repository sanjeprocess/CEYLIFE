import Image from "next/image";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/atoms/card";

interface IIncompleteLinkCardProps {
  missingSearchParams: string[];
}

export function IncompleteLinkCard({
  missingSearchParams,
}: IIncompleteLinkCardProps) {
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
            <CardTitle>Unable to Open Form</CardTitle>
            <CardDescription>
              We were unable to process your request because some necessary
              information is missing.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-sm">
            <p>
              The link you have used does not contain enough data to open the
              form. This may have happened because you accessed the form
              directly, rather than using the dedicated link that was sent to
              you via SMS or email.
            </p>
            <p>
              To ensure your information is processed correctly, please return
              to the original message from Ceylinco Life and use the secure form
              link provided there.
            </p>
            <p>
              If you believe you have received this message in error, or if you
              are unable to find your original form link, please contact your
              Ceylinco Life representative for kind assistance. We are happy to
              help.
            </p>
          </CardContent>
        </Card>
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 transform">
          <p className="text-muted-foreground text-xs italic">
            Missing search params: {missingSearchParams.join(", ")}
          </p>
        </div>
      </main>
    </div>
  );
}
