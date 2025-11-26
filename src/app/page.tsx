import Image from "next/image";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/atoms/card";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
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
            <CardTitle>Customer Form Portal – Information Page</CardTitle>
            <CardDescription>
              This is not a functional page of the Ceylinco Life Customer Form
              Portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The Customer Form Portal is designed to be accessed only through
              specific form links that are provided to you by Ceylinco Life (for
              example, via email or SMS).
            </p>
            <p>
              If you are viewing this message, you have most likely reached this
              page by mistake — for instance, by navigating directly to the main
              portal address or using an incomplete or outdated link.
            </p>
            <p>
              Please return to the original communication from Ceylinco Life and
              use the dedicated form link provided there. If you believe you
              have reached this page in error or cannot find your form link,
              kindly contact your Ceylinco Life representative for assistance.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
