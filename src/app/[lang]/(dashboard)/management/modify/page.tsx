import { getDictionary } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { UpdateAdapterForm } from "./update-form";

export default async function ManagementModifyPage(
  props: PageProps<"/[lang]/management/modify">
) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  const { baseUrl, modelId, providerId } = await props.searchParams;
  if (
    typeof baseUrl !== "string" ||
    typeof modelId !== "string" ||
    typeof providerId !== "string"
  ) {
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
      <UpdateAdapterForm
        dict={dict}
        baseUrl={baseUrl}
        modelId={modelId}
        providerId={providerId}
      />
    </section>
  );
}
