import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/atoms/card";
import { Separator } from "@/components/atoms/separator";
import { CookieInitializer } from "@/components/molecules/cookie-initializer";
import { FormExpiredView } from "@/components/molecules/form-expired-view";
import { FormHeader } from "@/components/molecules/form-header";
import { IncompleteLinkCard } from "@/components/molecules/incomplete-link-card";
import { LocaleSelector } from "@/components/molecules/locale-selector";
import { OtpDialog } from "@/components/molecules/otp-dialog";
import { FormView } from "@/components/organism/form-view";
import { VariableHandler } from "@/components/organism/variable-handler";
import { getForm, getMissingSearchParams } from "@/utils/form.utils";
import { ExpirationTimer } from "@/components/molecules/expiration-timer";

interface IFormPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: IFormPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const form = getForm(id);
    if (!form) {
      return notFound();
    }
    return {
      title: form.metadata.formTitle,
      description: form.metadata.formDescription,
    };
  } catch {
    return {
      title: "Ceylinco Life Forms Portal - Not Found",
    };
  }
}

export default async function FormPage({
  params,
  searchParams,
}: IFormPageProps) {
  try {
    const { id } = await params;
    const searchParamObj = await searchParams;
    const form = getForm(id);
    if (!form) {
      return notFound();
    }

    if (form.metadata.formExpiration) {
      const expirationTimestamp = searchParamObj[form.metadata.formExpirationQueryKey || "ts"];
      if (expirationTimestamp) {
        const timestamp = parseInt(`${expirationTimestamp}`.split("-").pop() || "0");
        if (!timestamp || isNaN(timestamp)) {
          return notFound();
        }
        const expirationDays = form.metadata.formExpirationDays || 30;
        const expirationDate = new Date(timestamp + expirationDays * 24 * 60 * 60 * 1000);
        const currentDate = new Date();
        if (currentDate > expirationDate) {
          return <FormExpiredView form={form} />;
        }
      }
    }

    if (form.metadata.searchParamsVariables) {
      const missingSearchParams = getMissingSearchParams(
        form.metadata.searchParamsVariables,
        searchParamObj
      );
      if (missingSearchParams.length > 0) {
        return <IncompleteLinkCard missingSearchParams={missingSearchParams} />;
      }
    }

    return (
      <>
        <CookieInitializer
          form={form}
          formId={id}
          searchParams={searchParamObj}
        />
        <div className="sticky top-0 z-55 flex h-10 justify-between bg-[#9f4248] text-white">

          <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 md:max-w-5xl lg:max-w-[1140px]">
            <ExpirationTimer form={form} />
            <div className="flex items-center gap-4">
              <a href="https://www.ceylincolife.com/contact-us/">
                <Phone className="size-5" />
              </a>
              <a href="https://www.ceylincolife.com/contact-us/">
                <Mail className="size-5" />
              </a>
              <a href="https://www.ceylincolife.com/branch-locator/">
                <MapPin className="size-5" />
              </a>
              <div className="h-5">
                <Separator orientation="vertical" />
              </div>
              <Globe className="size-5" />
              <LocaleSelector />
            </div>
          </nav>
        </div>
        <VariableHandler />
        {form.otp?.enabled && <OtpDialog otpConfig={form.otp} />}
        <main className="mx-auto w-full max-w-3xl py-8 md:max-w-5xl lg:max-w-[1140px]">
          <Card>
            <CardContent>
              <div className="rounded-md border py-6">
                <Image
                  src="/images/header.png"
                  alt="Ceylinco Life"
                  width={1776}
                  height={212}
                />
                <div className="mt-6 flex flex-col items-center justify-center gap-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    Ceylinco Life Tower, 106, Havelock Road, Colombo 5, Sri
                    Lanka. Co. Reg. No. PB5183 <br />
                    Tel: (+94) 11 2461461 Fax: (+94) 11 2555959 Email:
                    service@ceylife.lk Web: www.ceylincolife.com
                  </p>
                </div>
              </div>
              {form.metadata.showFormHeader === false ? undefined : (
                <FormHeader form={form} />
              )}
              <FormView form={form} />
            </CardContent>
          </Card>
        </main>
      </>
    );
  } catch {
    return notFound();
  }
}
