import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdapterForm } from "../form";
import {
  getCachedUserPermissions,
  getAllProxyServers,
  getUserAdapterModifyVersion,
  verifyShortTimeToken,
} from "@/lib/actions";
import { redirect } from "next/navigation";
import path from "path";
import fs from "fs";

export default async function ManagementCreatePage(
  props: PageProps<"/[lang]/management/create">
) {
  const { lang } = await props.params;
  const { token } = await props.searchParams;
  if (typeof token !== "string" || !(await verifyShortTimeToken(token))) {
    redirect(`/${lang}/management`);
  }
  const [dict, permissions, proxies, userVersion] = await Promise.all([
    getTrans(lang as Locale),
    getCachedUserPermissions(),
    getAllProxyServers(),
    getUserAdapterModifyVersion(),
  ]);

  if (!userVersion) {
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
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.management?.tokenPassTitle || "Create Token Pass"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.management?.tokenPassSubtitle ||
              "Obtain an Access Token for the Proxy Gateway Service"}
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
        advRequest={permissions?.adv ?? false}
        version={userVersion}
      />
    </section>
  );
}
