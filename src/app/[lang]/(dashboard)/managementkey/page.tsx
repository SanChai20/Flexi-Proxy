import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "i18n-config";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HelpCircleIcon } from "lucide-react";
import { OnceButton } from "@/components/ui/oncebutton";
import { createAdapter, getAllTargetProviders } from "@/lib/actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ManagementKeyPage(
  props: PageProps<"/[lang]/managementkey">
) {
  // const session = await auth();
  // if (!(session && session.user && session.user.id)) {
  //   return <div>Please sign in to manage your api key.</div>;
  // }
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  const { baseUrl, modelId, providerId } = await props.searchParams;
  if (!baseUrl || !modelId || !providerId) {
    redirect(`/${lang}/management`);
  }
  return (
    <section className="w-full max-w-4xl mx-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.management?.keyTitle || "API Key Management"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.management?.keySubtitle ||
              "Get available API keys for target provider"}
          </CardDescription>
        </CardHeader>
      </Card>
      <form
        action={async (formData) => {
          "use server";
          //   const provider = formData.get("provider") as string;
          //   const baseUrl = formData.get("baseUrl") as string;
          //   const modelId = formData.get("modelId") as string;
          //   const result:
          //     | {
          //         provider_id: string;
          //         provider_url: string;
          //         base_url: string;
          //         model_id: string;
          //         create_time: string;
          //       }
          //     | undefined = await createAdapter(provider, baseUrl, modelId);
          //   if (result !== undefined) {
          //     redirect(`/${lang}/management`);
          //   }
        }}
        className="mt-6"
      >
        {/* Adapter Configuration Section */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Source Section (OpenAI-Compatible) */}
          <div className="p-6">
            <h3 className="text-md font-semibold text-foreground mb-4 flex items-center w-full">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                {dict?.management?.adapterSource || "SOURCE"}
              </span>
              <span className="truncate max-w-[200px] xs:max-w-[180px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-[320px]">
                {dict?.management?.sourceTitle2 ||
                  "Configured OpenAI-Compatible Endpoint"}
              </span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label
                      htmlFor="baseUrl"
                      className="block text-sm font-medium text-foreground"
                    >
                      {dict?.management?.baseUrl || "Base URL"}
                    </label>
                  </div>
                  <div className="w-full px-4 py-2.5 text-foreground bg-background border rounded-lg max-w-full">
                    {baseUrl}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="apiKey"
                    className="block text-sm font-medium text-foreground"
                  >
                    {dict?.management?.apiKey || "API Key"}
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    name="apiKey"
                    className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                    placeholder={
                      dict?.management?.apiKeyPlaceHolder ||
                      "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    }
                    required
                  />
                </div>

              </div>
              <div className="space-y-2">
                <label
                  htmlFor="modelId"
                  className="block text-sm font-medium text-foreground"
                >
                  {dict?.management?.modelId || "Model ID"}
                </label>
                <div className="w-full px-4 py-2.5 text-foreground bg-background border rounded-lg max-w-full">
                  {modelId}
                </div>
              </div>
            </div>
          </div>

          {/* Divider between sections */}
          <div className="border-t border-border"></div>

          {/* Target Section (API Provider) */}
          <div className="p-6">
            <h3 className="text-md font-semibold text-foreground mb-4 flex items-center w-full">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                {dict?.management?.adapterTarget || "TARGET"}
              </span>
              <span className="truncate max-w-[200px] xs:max-w-[180px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-[320px]">
                {dict?.management?.targetTitle2 ||
                  "Selected Target API Provider"}
              </span>
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="provider"
                  className="block text-sm font-medium text-foreground"
                >
                  {dict?.management?.provider || "Provider"}
                </label>
                <div className="w-full px-4 py-2.5 text-foreground bg-background border rounded-lg max-w-full">
                  {providerId}
                </div>
              </div>
            </div>
          </div>

          {/* Divider between sections */}
          <div className="border-t border-border"></div>

          {/* Submit Button */}
          <div className="p-6">
            <OnceButton
              type="submit"
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring max-w-full"
            >
              {dict?.management?.acquire || "Acquire API Key"}
            </OnceButton>
          </div>
        </div>
      </form>
    </section>
  );
}
