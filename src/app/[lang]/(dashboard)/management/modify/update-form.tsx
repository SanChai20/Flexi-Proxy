"use client";

import { OnceButton } from "@/components/ui/oncebutton";
import { updateAdapterAction } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function UpdateAdapterForm({
  dict,
  baseUrl,
  modelId,
  providerId,
}: {
  dict: any;
  baseUrl: string;
  modelId: string;
  providerId: string;
}) {
  const router = useRouter();
  async function onSubmit(formData: FormData) {
    const redirectTo = await updateAdapterAction(formData);
    if (redirectTo !== undefined) {
      router.push(redirectTo);
    }
  }
  return (
    <form action={onSubmit} className="mt-6">
      {/* Adapter Configuration Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Source Section (OpenAI-Compatible) */}
        <div className="p-6">
          <h3 className="text-md font-semibold text-foreground mb-4 flex items-center w-full">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2 flex-shrink-0">
              {dict?.management?.adapterSource || "SOURCE"}
            </span>
            <span className="truncate">
              {dict?.management?.sourceTitle ||
                "Configure OpenAI-Compatible Endpoint"}
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
                <input
                  type="text"
                  id="baseUrl"
                  name="baseUrl"
                  value={baseUrl}
                  readOnly
                  className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition cursor-not-allowed opacity-75"
                />
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
              <input
                type="text"
                id="modelId"
                name="modelId"
                value={modelId}
                readOnly
                className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition cursor-not-allowed opacity-75"
              />
            </div>
          </div>
        </div>

        {/* Divider between sections */}
        <div className="border-t border-border"></div>

        {/* Target Section (API Provider) */}
        <div className="p-6">
          <h3 className="text-md font-semibold text-foreground mb-4 flex items-center w-full">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2 flex-shrink-0">
              {dict?.management?.adapterTarget || "TARGET"}
            </span>
            <span className="truncate">
              {dict?.management?.targetTitle2 || "Selected Target API Provider"}
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
              <input
                type="text"
                id="provider"
                name="provider"
                value={providerId}
                readOnly
                className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition cursor-not-allowed opacity-75"
              />
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
  );
}
