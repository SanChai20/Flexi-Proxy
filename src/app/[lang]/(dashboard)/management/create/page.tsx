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
import { getAllTargetProviders } from "@/lib/actions";
import { jwtVerify } from "@/lib/jwt";
import { redirect } from "next/navigation";

export default async function ManagementCreatePage(
  props: PageProps<"/[lang]/management/create">
) {
  const { lang } = await props.params;
  const { token } = await props.searchParams;
  if (typeof token !== "string") {
    redirect(`/${lang}/management`);
  }
  const { payload, error } = await jwtVerify(token);
  if (payload === undefined) {
    redirect(`/${lang}/management`);
  }
  const dict = await getTrans(lang as Locale);
  const providers: { id: string; url: string; status: string }[] =
    await getAllTargetProviders();
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.management?.adapterTitle || "Create Adapter"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.management?.adapterSubtitle ||
              "Obtain a Base URL adapted to the Target Provider API"}
          </CardDescription>
        </CardHeader>
      </Card>
      <AdapterForm dict={dict} providers={providers} />
    </section>
  );
}
