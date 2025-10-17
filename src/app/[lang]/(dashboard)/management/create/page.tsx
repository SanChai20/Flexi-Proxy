import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  getCachedUserPermissions,
  getAllProxyServers,
  getUserAdapterModifyVersion,
  verifyShortTimeToken,
} from "@/lib/actions";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import CreateManagementClient from "./client";
import CreateManagementSkeleton from "./skeleton";

import data from "public/config/providers.json";
const providerData: Record<string, { id: string; website: string }> = data;

export default async function ManagementCreatePage(
  props: PageProps<"/[lang]/management/create">
) {
  const { lang } = await props.params;
  const { token } = await props.searchParams;

  if (typeof token !== "string" || !(await verifyShortTimeToken(token))) {
    redirect(`/${lang}/management`);
  }

  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Suspense fallback={<CreateManagementSkeleton dict={dict} />}>
        <CreateManagementContent lang={lang} dict={dict} />
      </Suspense>
    </section>
  );
}

async function CreateManagementContent({
  lang,
  dict,
}: {
  lang: string;
  dict: any;
}) {
  const [permissions, proxies, userVersion] = await Promise.all([
    getCachedUserPermissions(),
    getAllProxyServers(),
    getUserAdapterModifyVersion(),
  ]);

  if (userVersion === undefined) {
    redirect(`/${lang}/management`);
  }

  const providers = Object.entries(providerData).map(([name, info]) => ({
    name,
    ...info,
  }));

  return (
    <CreateManagementClient
      dict={dict}
      proxies={proxies}
      providers={providers}
      advRequest={permissions.adv}
      version={userVersion}
    />
  );
}
