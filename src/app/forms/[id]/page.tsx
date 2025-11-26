import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";

import { FORM_LOCALES } from "@/common/constants/form.constants";
import { Card, CardContent } from "@/components/atoms/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Separator } from "@/components/atoms/separator";
import { H1, P } from "@/components/atoms/typography";
import { getForm } from "@/forms";

interface IFormPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: IFormPageProps): Promise<Metadata> {
  const { id } = await params;
  const form = getForm(id);
  return {
    title: form.metadata.formTitle,
    description: form.metadata.formDescription,
  };
}

export default async function FormPage({ params }: IFormPageProps) {
  const { id } = await params;
  const form = getForm(id);
  return (
    <>
      <div className="bg-[#9f4248] text-white h-10 flex justify-end sticky top-0 z-10">
        <nav className="flex justify-end items-center gap-4 max-w-3xl md:max-w-5xl lg:max-w-[1140px] mx-auto w-full">
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
          <Select defaultValue="en">
            <SelectTrigger className="w-[100px]" size="sm">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Language</SelectLabel>
                {form.metadata.availableLocales.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    {FORM_LOCALES[locale as keyof typeof FORM_LOCALES]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </nav>
      </div>
      <main className="max-w-3xl md:max-w-5xl lg:max-w-[1140px] mx-auto w-full py-8">
        <Card>
          <CardContent>
            <Image
              src="/images/header.png"
              alt="Ceylinco Life"
              width={1776}
              height={212}
            />

            <div className="my-6 text-center">
              <H1>{form.metadata.formTitle}</H1>
              <P className="text-muted-foreground">
                {form.metadata.formDescription}
              </P>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
