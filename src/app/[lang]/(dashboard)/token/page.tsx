import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  createShortTimeToken,
  getAllUserAdapters,
  getCachedUserPermissions,
} from "@/lib/actions";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import AccessTokenClient from "./client";
import AccessTokenSkeleton from "./skeleton";

export const metadata: Metadata = {
  title: "FlexiProxy - Token Pass Management",
};

async function AccessTokenContent({ lang, dict }: { lang: string; dict: any }) {
  const [permissions, adapters] = await Promise.all([
    getCachedUserPermissions(),
    getAllUserAdapters(),
  ]);

  if (!adapters || adapters.length === 0) {
    const token = await createShortTimeToken(3600);
    redirect(`/${lang}/token/create?token=${encodeURIComponent(token)}`);
  }

  return (
    <AccessTokenClient
      dict={dict}
      permissions={permissions}
      initialAdapters={adapters.map((adapter) => ({
        ...adapter,
        pul: adapter.pul.startsWith("https://")
          ? adapter.pul
          : `https://${adapter.pul}`,
      }))}
    />
  );
}

export default async function AccessTokenPage(
  props: PageProps<"/[lang]/token">
) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full mx-auto px-0 select-none">
      <Suspense fallback={<AccessTokenSkeleton dict={dict} />}>
        <AccessTokenContent lang={lang} dict={dict} />
      </Suspense>
    </section>
  );
}
