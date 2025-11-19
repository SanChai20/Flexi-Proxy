import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  createShortTimeToken,
  getAllUserAdapters,
  getCachedUserPermissions,
  getUserAdapterModifyVersion,
} from "@/lib/actions";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import AccessTokenClient from "./client";
import AccessTokenSkeleton from "./skeleton";

export const metadata: Metadata = {
  title: "FlexiProxy - Token Pass Management",
};

async function AccessTokenContent({
  lang,
  dict,
  open,
  pid,
  mid,
  mode,
}: {
  lang: string;
  dict: any;
  open?: any;
  pid?: any;
  mid?: any;
  mode?: any;
}) {
  const [permissions, adapters, vNumber] = await Promise.all([
    getCachedUserPermissions(),
    getAllUserAdapters(),
    getUserAdapterModifyVersion(),
  ]);

  if (!adapters || adapters.length === 0) {
    redirect(`/${lang}/token?open=true&mode=create`);
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
      proxies={}
      models={}
      version={vNumber}
      defaultMode={mode || null}
    />
  );
}

export default async function AccessTokenPage(
  props: PageProps<"/[lang]/token">
) {
  const { lang } = await props.params;
  const { open, mode, pid, mid } = await props.searchParams; // open dialog or not & mode & proxy id & model id
  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-5xl mx-auto overflow-x-auto px-0 select-none">
      <Suspense fallback={<AccessTokenSkeleton dict={dict} />}>
        <AccessTokenContent
          lang={lang}
          dict={dict}
          open={open}
          mode={mode}
          pid={pid}
          mid={mid}
        />
      </Suspense>
    </section>
  );
}
