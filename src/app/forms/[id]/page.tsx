import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/atoms/card";
import { Separator } from "@/components/atoms/separator";
import { CookieInitializer } from "@/components/molecules/cookie-initializer";
import { FormHeader } from "@/components/molecules/form-header";
import { IncompleteLinkCard } from "@/components/molecules/incomplete-link-card";
import { LocaleSelector } from "@/components/molecules/locale-selector";
import { OtpDialog } from "@/components/molecules/otp-dialog";
import { FormView } from "@/components/organism/form-view";
import { VariableHandler } from "@/components/organism/variable-handler";
import { getForm, getMissingSearchParams } from "@/utils/form.utils";

interface IFormPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: IFormPageProps): Promise<Metadata> {
  const { id } = await params;
  const form = getForm(id);
  if (!form) {
    return notFound();
  }
  return {
    title: form.metadata.formTitle,
    description: form.metadata.formDescription,
  };
}

export default async function FormPage({
  params,
  searchParams,
}: IFormPageProps) {
  const { id } = await params;
  const searchParamObj = await searchParams;
  const form = getForm(id);
  if (!form) {
    return notFound();
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
      <div className="sticky top-0 z-55 flex h-10 justify-end bg-[#9f4248] text-white">
        <nav className="mx-auto flex w-full max-w-3xl items-center justify-end gap-4 md:max-w-5xl lg:max-w-[1140px]">
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
        </nav>
      </div>
      <VariableHandler />
      {form.otp && <OtpDialog otpConfig={form.otp} />}
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
                <h1 className="text-4xl font-bold">Ceylinco Life</h1>
                <p className="text-muted-foreground text-sm">
                  Ceylinco Life Insurance Limited, Ceylinco Life Tower, 106
                  Havelock Road, Colombo 5. <br />
                  <b> Tel:</b> (+94) 11 2461000, 2461461
                  <b> Fax:</b> (+94) 11 2555959 <br />
                  <b> Website:</b> www.ceylincolife.com
                  <b> E-mail:</b>
                  <a href="mailto:service@ceylife.lk">service@ceylife.lk</a>
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
}
