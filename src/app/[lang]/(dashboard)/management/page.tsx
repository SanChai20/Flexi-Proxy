import { useState } from "react";
import { getDictionary } from "@/lib/get-dictionary";
import { auth } from "@/auth";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import ManagedTable from "@/components/managed/table";

async function GetAvailableTargetProviders(): Promise<
  { id: string; name: string }[]
> {
  const response = await fetch(
    [process.env.BACKEND_URL, "v1/provider"].join("/"),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (response.ok) {
    const reqBody = await response.json(); //TODO...
    return reqBody;
  } else {
    return [];
  }
}

export default async function ManagementPage(
  props: PageProps<"/[lang]/management">
) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  const providers = await GetAvailableTargetProviders();
  return (
    <section className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.management.title}</CardTitle>
          <CardDescription className="text-base">
            {dict.management.subtitle}
          </CardDescription>
        </CardHeader>
      </Card>
      <ManagedTable dict={dict} targetAvailableProviders={providers} />
    </section>
  );
}
