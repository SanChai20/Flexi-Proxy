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
import { getAdvProviderRequestPermissionsAction, getAllTargetProviders, verifyShortTimeToken } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function ManagementCreatePage(
  props: PageProps<"/[lang]/management/create">
) {
  const { lang } = await props.params;
  const { token } = await props.searchParams;
  if (typeof token !== "string") {
    redirect(`/${lang}/management`);
  }
  const isValid = await verifyShortTimeToken(token);
  if (!isValid) {
    redirect(`/${lang}/management`);
  }
  const dict = await getTrans(lang as Locale);
  const canRequestAdvProvider = await getAdvProviderRequestPermissionsAction();
  const providers: { id: string; url: string; status: string; adv: boolean }[] =
    await getAllTargetProviders();
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
      <AdapterForm dict={dict} providers={providers} advRequest={canRequestAdvProvider} />
    </section>
  );
}
