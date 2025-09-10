"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { XIcon, HelpCircleIcon } from "lucide-react";

export default function ManagedModal({
  isOpen,
  onClose,
  onSubmit,
  targetProviders,
  dict,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    provider: string;
    baseUrl: string;
    apiKey: string;
    modelId: string;
  }) => void;
  targetProviders: { id: string; url: string }[];
  dict: any;
}) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[95vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-lg bg-card border border-border shadow-lg focus:outline-none z-50 flex flex-col">
          <div className="flex flex-col space-y-1 pb-4 border-b border-border p-6">
            <Dialog.Title className="text-xl font-bold text-foreground">
              {dict?.management?.adapterTitle || "Create Adapter"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
              {dict?.management?.adapterSubtitle ||
                "Obtain a Base URL adapted to the Target Provider API"}
            </Dialog.Description>
          </div>
          <div className="absolute top-6 right-6">
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-full hover:bg-muted transition"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const provider = formData.get("provider") as string;
                const baseUrl = formData.get("baseUrl") as string;
                const apiKey = formData.get("apiKey") as string;
                const modelId = formData.get("modelId") as string;
                onSubmit({ provider, baseUrl, apiKey, modelId });
              }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="pt-2">
                  <div className="space-y-6">
                    {/* Source Section (OpenAI-Compatible) */}
                    <div className="bg-card border border-border rounded-lg p-6 mb-6">
                      <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                          {dict?.management?.adapterSource || "SOURCE"}
                        </span>
                        <span className="truncate">
                          {dict?.management?.sourceTitle ||
                            "OpenAI-Compatible Endpoint"}
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
                              className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                              placeholder={
                                dict?.management?.baseUrlPlaceHolder ||
                                "https://api.deepseek.com/v1"
                              }
                              required
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

                        <p className="text-xs text-muted-foreground mt-1">
                          {dict?.management?.notice ||
                            "The API key is only used to make API requests by adapter."}
                        </p>

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
                            className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                            placeholder={
                              dict?.management?.modelIdPlaceHolder ||
                              "deepseek-chat"
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Target Section (API Provider) */}
                    <div className="bg-card border border-border rounded-lg p-6 mb-6">
                      <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                          {dict?.management?.adapterTarget || "TARGET"}
                        </span>
                        <span className="truncate">
                          {dict?.management?.targetTitle ||
                            "Select Target API Provider"}
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
                            className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2U9IiNjY2NjY2MiIgc3Rva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px] appearance-none"
                            required
                          >
                            <option value="">
                              {dict.management?.selectProvider ||
                                "Select a provider"}
                            </option>
                            {targetProviders.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.id.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
                      >
                        {dict?.management?.confirm || "Confirm"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
