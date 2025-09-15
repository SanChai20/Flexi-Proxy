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
import { getAdapterAction, getAllTargetProviders } from "@/lib/actions";

export default async function ManagementModifyPage(
  props: PageProps<"/[lang]/management/modify">
) {
  const { lang } = await props.params;
  const { aid } = await props.searchParams;
  if (typeof aid !== "string") {
    redirect(`/${lang}/management`);
  }
  const dict = await getTrans(lang as Locale);
  const providers: { id: string; url: string }[] =
    await getAllTargetProviders();

  const adapter: { url: string; mid: string; pid: string; not: string; } | undefined = await getAdapterAction(aid);
  if (adapter === undefined) {
    redirect(`/${lang}/management`);
  }

  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.management?.keyTitle || "API Key Management"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.management?.keySubtitle ||
              "Get available API key for target provider"}
          </CardDescription>
        </CardHeader>
      </Card>
      <AdapterForm
        dict={dict}
        providers={providers}
        defaultValues={{ baseUrl: adapter.url, modelId: adapter.mid, providerId: adapter.pid, commentNote: adapter.not }}
      />
    </section>
  );
}
