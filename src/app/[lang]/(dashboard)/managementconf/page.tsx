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

export default async function ManagementConfPage(
  props: PageProps<"/[lang]/managementconf">
) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  const providers: { id: string; url: string }[] =
    await getAllTargetProviders();
  return (
    <section className="w-full max-w-4xl mx-auto px-0">
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

      <form
        action={async (formData) => {
          "use server";
          const provider = formData.get("provider") as string;
          const baseUrl = formData.get("baseUrl") as string;
          const modelId = formData.get("modelId") as string;
          //   const session = await auth();
          //   if (!(session && session.user && session.user.id)) {
          //     console.error("You must be logged in to perform this action.");
          //     redirect("/login");
          //   }
          const result:
            | {
                provider_id: string;
                provider_url: string;
                base_url: string;
                model_id: string;
                create_time: string;
              }
            | undefined = await createAdapter(
            "AAAA", //session.user.id,
            provider,
            baseUrl,
            modelId
          );
          if (result !== undefined) {
            redirect(`/${lang}/management`);
          }
        }}
        className="mt-6"
      >
        {/* Adapter Configuration Section */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Source Section (OpenAI-Compatible) */}
          <div className="p-6">
            <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                {dict?.management?.adapterSource || "SOURCE"}
              </span>
              <span className="truncate">
                {dict?.management?.sourceTitle || "OpenAI-Compatible Endpoint"}
              </span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label
                      htmlFor="baseUrl"
                      className="block text-sm font-medium text-foreground"
                    >
                      {dict?.management?.baseUrl || "Base URL"}
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>
                          {dict?.management?.baseUrlTip ||
                            "Enter the base URL for the API endpoint\n aaaaa"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <input
                    type="url"
                    id="baseUrl"
                    name="baseUrl"
                    className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition max-w-full"
                    placeholder={
                      dict?.management?.baseUrlPlaceHolder ||
                      "https://api.deepseek.com/v1"
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
                <input
                  type="text"
                  id="modelId"
                  name="modelId"
                  className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition max-w-full"
                  placeholder={
                    dict?.management?.modelIdPlaceHolder || "deepseek-chat"
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Divider between sections */}
          <div className="border-t border-border"></div>

          {/* Target Section (API Provider) */}
          <div className="p-6">
            <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                {dict?.management?.adapterTarget || "TARGET"}
              </span>
              <span className="truncate">
                {dict?.management?.targetTitle || "Select Target API Provider"}
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
                <select
                  id="provider"
                  name="provider"
                  className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=')] bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px] appearance-none max-w-full"
                  required
                >
                  <option value="">
                    {dict.management?.selectProvider || "Select a provider"}
                  </option>
                  {providers.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.id.toUpperCase()}
                    </option>
                  ))}
                </select>
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
              {dict?.management?.confirm || "Confirm"}
            </OnceButton>
          </div>
        </div>
      </form>
    </section>
  );
}
