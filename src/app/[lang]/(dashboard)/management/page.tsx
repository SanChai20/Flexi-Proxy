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

import { jwtSign } from "@/lib/jwt";

async function GetAvailableTargetProviders(token: string): Promise<string[]> {
  const response = await fetch(
    [process.env.BASE_URL, "api/providers"].join("/"),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.ok) {
    const reqBody = await response.json();
    return reqBody;
  } else {
    return [];
  }
}

async function GetUserAvailableAdapters(
  token: string
): Promise<{ target: string; token: string; url: string }[]> {
  const response = await fetch(
    [process.env.BASE_URL, "api/adapters"].join("/"),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.ok) {
    const reqBody = await response.json();
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
  const { token, error } = await jwtSign(undefined, 60);
  if (!token) {
    return error;
  }
  const [targetProviders, userAdapters] = await Promise.all([
    GetAvailableTargetProviders(token),
    GetUserAvailableAdapters(token),
  ]);

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
      <ManagedTable
        dict={dict}
        targetAvailableProviders={targetProviders}
        userAvailableAdapters={userAdapters}
      />
    </section>
  );
}
