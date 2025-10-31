import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  getAllPrivateProxyServers,
  getAllPublicProxyServers,
  getUserAdapterModifyVersion,
  verifyShortTimeToken,
} from "@/lib/actions";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import CreateAccessTokenClient from "./client";
import CreateAccessTokenSkeleton from "./skeleton";

import data from "public/config/providers.json";
const providerData: Record<string, { id: string; website: string }> = data;

async function CreateAccessTokenContent({
  lang,
  dict,
}: {
  lang: string;
  dict: any;
  proxyId?: any;
}) {
  const [publicProxies, privateProxies, userVersion] = await Promise.all([
    getAllPublicProxyServers(),
    getAllPrivateProxyServers(),
    getUserAdapterModifyVersion(),
  ]);

  if (userVersion === undefined) {
    redirect(`/${lang}/token`);
  }

  const providers = Object.entries(providerData).map(([name, info]) => ({
    name,
    ...info,
  }));

  return (
    <CreateAccessTokenClient
      dict={dict}
      proxies={[...publicProxies, ...privateProxies]}
      providers={providers}
      version={userVersion}
    />
  );
}

export default async function AccessTokenCreatePage(
  props: PageProps<"/[lang]/token/create">
) {
  const { lang } = await props.params;
  const { token } = await props.searchParams;

  if (typeof token !== "string" || !(await verifyShortTimeToken(token))) {
    redirect(`/${lang}/token`);
  }

  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-0 select-none">
      <Suspense fallback={<CreateAccessTokenSkeleton dict={dict} />}>
        <CreateAccessTokenContent lang={lang} dict={dict} />
      </Suspense>
    </section>
  );
}
