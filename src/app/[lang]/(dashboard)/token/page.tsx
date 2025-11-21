import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  createShortTimeToken,
  getAllModels,
  getAllPrivateProxyServers,
  getAllPublicProxyServers,
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

async function AccessTokenContent({ lang, dict }: { lang: string; dict: any }) {
  const [
    permissions,
    adapters,
    vNumber,
    allPublicProxies,
    allPrivateProxies,
    allModels,
  ] = await Promise.all([
    getCachedUserPermissions(),
    getAllUserAdapters(),
    getUserAdapterModifyVersion(),
    getAllPublicProxyServers(),
    getAllPrivateProxyServers(),
    getAllModels(),
  ]);

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
      proxies={[...allPublicProxies, ...allPrivateProxies]}
      models={allModels}
      version={vNumber ?? 0}
    />
  );
}

export default async function AccessTokenPage(
  props: PageProps<"/[lang]/token">
) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-5xl mx-auto overflow-x-auto px-0 select-none">
      <Suspense fallback={<AccessTokenSkeleton dict={dict} />}>
        <AccessTokenContent lang={lang} dict={dict} />
      </Suspense>
    </section>
  );
}
