import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { AdapterForm } from "../form";
import {
  getAdapterAction,
  getAdvProviderRequestPermissionsAction,
  getAllProxyServers,
  getUserAdapterModifyVersion,
  verifyShortTimeToken,
} from "@/lib/actions";
import path from "path";
import fs from "fs";

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
  const canRequestAdvProvider = await getAdvProviderRequestPermissionsAction();
  const proxies: { id: string; url: string; status: string; adv: boolean }[] =
    await getAllProxyServers();

  const adapter:
    | { pro: string; mid: string; pid: string; not: string; llm: string }
    | undefined = await getAdapterAction(aid);
  if (adapter === undefined) {
    redirect(`/${lang}/management`);
  }
  const userVersion = await getUserAdapterModifyVersion();
  if (userVersion === undefined) {
    redirect(`/${lang}/management`);
  }
  const docPath = path.join(
    process.cwd(),
    "public",
    dict.management.providerPage
  );
  const docContent = fs.readFileSync(docPath, "utf8");
  const data: Record<string, { id: string, website: string }> = JSON.parse(docContent);
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.management?.keyTitle || "Modify Token Pass"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.management?.keySubtitle ||
              "Refresh the Access Token for the Proxy Gateway Service"}
          </CardDescription>
        </CardHeader>
      </Card>
      <AdapterForm
        dict={dict}
        proxies={proxies}
        providers={Object.entries(data).map(([name, info]) => ({
          name,
          ...info,
        }))}
        advRequest={canRequestAdvProvider}
        version={userVersion}
        defaultValues={{
          modelId: adapter.mid,
          proxyId: adapter.pid,
          providerId: adapter.pro,
          commentNote: adapter.not,
          adapterId: aid,
          litellmParams: adapter.llm
        }}
      />
    </section>
  );
}
