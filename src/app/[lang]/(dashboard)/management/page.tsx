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
import { getAllUserAdapters } from "@/lib/actions";
import { redirect } from "next/navigation";

// async function CreateProvider() {
//   const { token, error } = await jwtSign(
//     { url: "https://checkcheck.com" },
//     180
//   );
//   const response = await fetch(
//     [process.env.BASE_URL, "api/providers", "anthropic3"].join("/"),
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   return response;
// }

export default async function ManagementPage(
  props: PageProps<"/[lang]/management">
) {
  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    return <div>Please sign in to manage your adapters.</div>;
  }
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  const adapters: { target: string; token: string; url: string }[] =
    await getAllUserAdapters(session.user.id);

  if (adapters.length <= 0) {
    redirect("/");
  }

  // const [targetProviders, userAdapters] = await Promise.all([
  //   GetAvailableTargetProviders(token),
  //   GetUserAvailableAdapters(token),
  // ]);

  return (
    <section className="w-full max-w-4xl mx-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.management.title}</CardTitle>
          <CardDescription className="text-base">
            {dict.management.subtitle}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* <ManagedTable
        dict={dict}
        token={token}
        targetAvailableProviders={targetProviders}
        userAvailableAdapters={userAdapters}
      /> */}
    </section>
  );
}
