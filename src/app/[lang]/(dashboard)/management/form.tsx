"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { OnceButton } from "@/components/ui/oncebutton";
import {
  createAdapterAction,
  deleteAdapterAction,
  updateAdapterAction,
} from "@/lib/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircleIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdapterForm({
  dict,
  providers,
  defaultValues,
}: {
  dict: any;
  providers: { id: string; url: string }[];
  defaultValues?: {
    adapterId: string;
    baseUrl: string;
    modelId: string;
    providerId: string;
    commentNote: string;
  };
}) {
  const router = useRouter();
  async function onSubmit(formData: FormData) {
    let canJump: boolean = false;
    if (defaultValues !== undefined) {
      // Updating Operation
      canJump = await updateAdapterAction(formData);
    } else {
      // Creating Operation
      canJump = await createAdapterAction(formData);
    }
    if (canJump) {
      router.push("/management");
    }
  }
  return (
    <form action={onSubmit} className="mt-6">
      <input type="hidden" name="adapterId" value={defaultValues?.adapterId} />
      {/* Adapter Configuration Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Source Section (OpenAI-Compatible) */}
        <div className="p-6">
          <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {dict?.management?.baseUrlTip ||
                          "Enter the base URL for the API endpoint"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <input
                  type="url"
                  id="baseUrl"
                  name="baseUrl"
                  defaultValue={defaultValues?.baseUrl}
                  className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition max-w-full"
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
                defaultValue={defaultValues?.modelId}
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
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2 flex-shrink-0">
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
                defaultValue={
                  providers.some(
                    (provider) => provider.id === defaultValues?.providerId
                  )
                    ? defaultValues?.providerId
                    : undefined
                }
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

        <div className="p-6">
          <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2 flex-shrink-0">
              {dict?.management?.noteTag || "NOTE"}
            </span>
            <span className="truncate">
              {dict?.management?.noteTitle || "Add note information"}
            </span>
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <textarea
                id="commentNote"
                name="commentNote"
                defaultValue={defaultValues?.commentNote}
                rows={3}
                className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition max-w-full"
                placeholder={
                  dict?.management?.notePlaceHolder ||
                  "Create note for this adapter...(20 words max)"
                }
                maxLength={20}
              ></textarea>
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

export function EditAdapterDropdownForm({
  dict,
  adapter_id,
}: {
  dict: any;
  adapter_id: string;
}) {
  const router = useRouter();
  async function onSubmit(formData: FormData) {
    router.push(
      `/management/modify?aid=${encodeURIComponent(
        formData.get("adapterId") as string
      )}`
    );
  }
  return (
    <form action={onSubmit}>
      <input type="hidden" name="adapterId" value={adapter_id} />
      <DropdownMenuItem
        className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
        asChild
      >
        <button type="submit" className="w-full">
          {dict?.management?.edit || "Edit"}
        </button>
      </DropdownMenuItem>
    </form>
  );
}

export function DeleteAdapterDropdownForm({
  dict,
  adapter_id,
}: {
  dict: any;
  adapter_id: string;
}) {
  const router = useRouter();
  async function onSubmit(formData: FormData) {
    const canRefresh = await deleteAdapterAction(formData);
    if (canRefresh) {
      router.push("/management");
    }
  }
  return (
    <form action={onSubmit}>
      <input type="hidden" name="adapterId" value={adapter_id} />
      <DropdownMenuItem
        className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
        asChild
      >
        <button type="submit" className="w-full">
          {dict?.management?.delete || "Delete"}
        </button>
      </DropdownMenuItem>
    </form>
  );
}

export function CreateAdapterForm({
  dict,
  currentAdapterCount,
  maxAdapterCountAllowed,
}: {
  dict: any;
  currentAdapterCount: number;
  maxAdapterCountAllowed: number;
}) {
  const router = useRouter();
  async function onSubmit(formData: FormData) {
    router.push(`/management/create`);
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <form action={onSubmit}>
            <Button
              type="submit"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">
                {dict?.management?.adapterAdd || "Add Adapter"}
              </span>
            </Button>
          </form>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {dict?.management?.adapterAdd || "Add Adapter"}{" "}
            {`(${currentAdapterCount}/${maxAdapterCountAllowed})`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
