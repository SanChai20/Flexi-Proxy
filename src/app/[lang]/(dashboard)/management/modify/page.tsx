import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import { redirect } from "next/navigation";
import {
  getAdapterAction,
  getCachedUserPermissions,
  getAllProxyServers,
  getUserAdapterModifyVersion,
  verifyShortTimeToken,
} from "@/lib/actions";
import path from "path";
import fs from "fs";
import { Suspense } from "react";
import ModifyManagementClient from "./client";
import ModifyManagementSkeleton from "./skeleton";

export default async function ManagementModifyPage(
  props: PageProps<"/[lang]/management/modify">
) {
  const { lang } = await props.params;
  const { aid, token } = await props.searchParams;

  if (typeof aid !== "string" || typeof token !== "string") {
    redirect(`/${lang}/management`);
  }

  const isValid = await verifyShortTimeToken(token);
  if (!isValid) {
    redirect(`/${lang}/management`);
  }

  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Suspense fallback={<ModifyManagementSkeleton dict={dict} />}>
        <ModifyManagementContent lang={lang} dict={dict} aid={aid} />
      </Suspense>
    </section>
  );
}

async function ModifyManagementContent({
  lang,
  dict,
  aid,
}: {
  lang: string;
  dict: any;
  aid: string;
}) {
  const [permissions, proxies, adapter, userVersion] = await Promise.all([
    getCachedUserPermissions(),
    getAllProxyServers(),
    getAdapterAction(aid),
    getUserAdapterModifyVersion(),
  ]);

  if (!adapter || userVersion === undefined) {
    redirect(`/${lang}/management`);
  }

  const docPath = path.join(
    process.cwd(),
    "public",
    dict.management.providerPage
  );
  const docContent = fs.readFileSync(docPath, "utf8");
  const data: Record<string, { id: string; website: string }> =
    JSON.parse(docContent);

  const providers = Object.entries(data).map(([name, info]) => ({
    name,
    ...info,
  }));

  return (
    <ModifyManagementClient
      dict={dict}
      proxies={proxies}
      providers={providers}
      advRequest={permissions.adv}
      version={userVersion}
      defaultValues={{
        modelId: adapter.mid,
        proxyId: adapter.pid,
        providerId: adapter.pro,
        commentNote: adapter.not,
        adapterId: aid,
        litellmParams: adapter.llm,
      }}
    />
  );
}
