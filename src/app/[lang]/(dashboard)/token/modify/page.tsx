import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import { redirect } from "next/navigation";
import {
  getAdapterAction,
  getAllPrivateProxyServers,
  getAllPublicProxyServers,
  getUserAdapterModifyVersion,
  verifyShortTimeToken,
} from "@/lib/actions";
import { Suspense } from "react";
import ModifyAccessTokenClient from "./client";
import ModifyAccessTokenSkeleton from "./skeleton";

import data from "public/config/providers.json";
const providerData: Record<string, { id: string; website: string }> = data;

async function ModifyAccessTokenContent({
  lang,
  dict,
  aid,
}: {
  lang: string;
  dict: any;
  aid: string;
}) {
  const [publicProxies, privateProxies, adapter, userVersion] =
    await Promise.all([
      getAllPublicProxyServers(),
      getAllPrivateProxyServers(),
      getAdapterAction(aid),
      getUserAdapterModifyVersion(),
    ]);

  if (!adapter || userVersion === undefined) {
    redirect(`/${lang}/token`);
  }

  const providers = Object.entries(providerData).map(([name, info]) => ({
    name,
    ...info,
  }));

  return (
    <ModifyAccessTokenClient
      dict={dict}
      proxies={[...publicProxies, ...privateProxies]}
      providers={providers}
      version={userVersion}
      defaultValues={{
        modelId: adapter.mid,
        proxyId: adapter.pid,
        commentNote: adapter.not,
        adapterId: aid,
      }}
    />
  );
}

export default async function AccessTokenModifyPage(
  props: PageProps<"/[lang]/token/modify">
) {
  const { lang } = await props.params;
  const { aid, token } = await props.searchParams;

  if (typeof aid !== "string" || typeof token !== "string") {
    redirect(`/${lang}/token`);
  }

  const isValid = await verifyShortTimeToken(token);
  if (!isValid) {
    redirect(`/${lang}/token`);
  }

  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-5xl mx-auto overflow-x-auto px-0 select-none">
      <Suspense fallback={<ModifyAccessTokenSkeleton dict={dict} />}>
        <ModifyAccessTokenContent lang={lang} dict={dict} aid={aid} />
      </Suspense>
    </section>
  );
}
