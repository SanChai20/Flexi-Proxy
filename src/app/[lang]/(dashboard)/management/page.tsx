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
import ManagementClient from "./client";
import ManagementSkeleton from "./skeleton";

export const metadata: Metadata = {
  title: "FlexiProxy - Token Pass Management",
};

export default async function ManagementPage(
  props: PageProps<"/[lang]/management">
) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Suspense fallback={<ManagementSkeleton dict={dict} />}>
        <ManagementContent lang={lang} dict={dict} />
      </Suspense>
    </section>
  );
}

async function ManagementContent({ lang, dict }: { lang: string; dict: any }) {
  const [permissions, adapters] = await Promise.all([
    getCachedUserPermissions(),
    getAllUserAdapters(),
  ]);

  if (!adapters || adapters.length === 0) {
    const token = await createShortTimeToken(3600);
    redirect(`/${lang}/management/create?token=${encodeURIComponent(token)}`);
  }

  return (
    <ManagementClient
      dict={dict}
      permissions={permissions}
      initialAdapters={adapters}
    />
  );
}
