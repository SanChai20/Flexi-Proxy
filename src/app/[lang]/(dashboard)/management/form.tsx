"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { OnceButton } from "@/components/ui/oncebutton";
import {
  createAdapterAction,
  createShortTimeToken,
  deleteAdapterAction,
  getUserAdapterModifyVersion,
  updateAdapterAction,
  getProxyServerModels
} from "@/lib/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircleIcon,
  PlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";

export function AdapterForm({
  dict,
  proxies,
  providers,
  advRequest,
  version,
  defaultValues,
}: {
  dict: any;
  proxies: { id: string; url: string; status: string; adv: boolean }[];
  providers: { name: string; id: string; website: string }[];
  advRequest: boolean;
  version: number;
  defaultValues?: {
    adapterId: string;
    modelId: string;
    proxyId: string;
    providerId: string;
    commentNote: string;
    litellmParams: string;
  };
}) {
  const router = useRouter();
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(
    providers.some((p) => p.id === defaultValues?.providerId)
      ? defaultValues?.providerId
      : ""
  );
  const [selectedProxyId, setSelectedProxyId] = useState(
    proxies.some((p) => p.id === defaultValues?.proxyId)
      ? defaultValues?.proxyId
      : ""
  );
  const [supportedProviders, setSupportedProviders] = useState<
    { name: string; id: string; website: string }[]
  >(providers);
  const [modelsByProvider, setModelsByProvider] = useState<
    Record<string, string[]>
  >({});
  const selectedProvider = supportedProviders.find((p) => p.id === selectedProviderId);

  const handleProxyChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const proxyId = e.target.value;
      setSelectedProxyId(proxyId);
      setSupportedProviders([]);
      setModelsByProvider({});
      if (!proxyId) {
        return;
      }

      try {
        const result = await getProxyServerModels(proxyId);
        if (result && Object.keys(result).length > 0) {
          const filtered = providers.filter((p) => result[p.id]);
          setSupportedProviders(filtered);
          setModelsByProvider(result);
        } else {
          setSupportedProviders([]);
          setModelsByProvider({});
        }
      } catch (err) {
        console.error("Failed to fetch proxy models:", err);
        setSupportedProviders([]);
        setModelsByProvider({});
      }
    },
    [providers]
  );


  const onSubmit = useCallback(
    async (formData: FormData) => {
      const currentVersion = await getUserAdapterModifyVersion();
      if (currentVersion !== version) {
        router.push("/management");
      } else {
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
    },
    [router, version, defaultValues]
  );
  return (
    <form action={onSubmit} className="mt-6">
      <input type="hidden" name="adapterId" value={defaultValues?.adapterId} />
      {/* Adapter Configuration Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">

        {/* Proxy Section */}
        <div className="p-6">
          <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2 flex-shrink-0">
              {dict?.management?.proxyServer || "PROXY SERVER"}
            </span>
            <span className="truncate">
              {dict?.management?.targetTitle || "Select Proxy Service"}
            </span>
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <label
                  htmlFor="proxy"
                  className="block text-sm font-medium text-foreground"
                >
                  {<span className="text-destructive mr-1">*</span>}
                  {dict?.management?.proxy || "Proxy Gateway"}
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircleIcon className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>
                      {dict?.management?.proxyTip ||
                        "You can choose a LiteLLM proxy service based on your location and server load."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <select
                id="proxy"
                name="proxy"
                value={selectedProxyId}
                onChange={handleProxyChange}
                defaultValue={
                  proxies.some((proxy) => proxy.id === defaultValues?.proxyId)
                    ? defaultValues?.proxyId
                    : undefined
                }
                className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=')] bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px] appearance-none max-w-full"
                required
              >
                <option value="">
                  {dict.management?.selectProxy || "Select a proxy server"}
                </option>
                {proxies.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                    disabled={
                      option.status === "" ||
                      option.status === "unavailable" ||
                      (advRequest ? false : option.adv)
                    }
                    style={{
                      color:
                        option.status === "" ||
                          option.status === "unavailable" ||
                          (advRequest ? false : option.adv)
                          ? "#9ca3af" // gray
                          : option.status === "spare"
                            ? "#10b981" // green
                            : option.status === "busy"
                              ? "#f97316" // orange
                              : option.status === "full"
                                ? "#ef4444" // red
                                : "inherit", // default
                    }}
                  >
                    {" ["}
                    {(option.status === "" ||
                      option.status === "unavailable") &&
                      (dict?.management?.unavailable || "Unavailable")}
                    {option.status === "spare" &&
                      (dict?.management?.spare || "Spare")}
                    {option.status === "busy" &&
                      (dict?.management?.busy || "Busy")}
                    {option.status === "full" &&
                      (dict?.management?.full || "Full")}
                    {"] "}
                    {" ["}
                    {option.adv
                      ? dict?.management?.pro || "Pro"
                      : dict?.management?.free || "Free"}
                    {"] "}
                    {option.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Divider between sections */}
        <div className="border-t border-border"></div>

        {/* Source Section */}
        <div className={`p-6 transition ${selectedProxyId
          ? "opacity-100"
          : "opacity-50 pointer-events-none select-none"
          }`}>
          <fieldset disabled={!selectedProxyId}>
            <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2 flex-shrink-0">
                {dict?.management?.tokenPassSource || "SOURCE"}
              </span>
              <span className="truncate">
                {dict?.management?.sourceTitle || "Configure Model"}
              </span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label
                      htmlFor="provider"
                      className="block text-sm font-medium text-foreground"
                    >
                      <span className="text-destructive mr-1">*</span>
                      {dict?.management?.providerOptions || "Provider"}
                    </label>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>
                          {dict?.management?.providerOptionsTip ||
                            "E.g. Anthropic, Deepseek, OpenRouter etc."}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    {selectedProvider?.website && (
                      <a
                        href={selectedProvider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-muted-foreground hover:text-primary transition"
                        title={`Go to ${selectedProvider.name} official website`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <select
                    id="provider"
                    name="provider"
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=')] bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px] appearance-none max-w-full"
                    required
                  >
                    <option value="">
                      {dict.management?.selectProvider || "Select a provider"}
                    </option>
                    {supportedProviders.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label
                      htmlFor="modelId"
                      className="block text-sm font-medium text-foreground"
                    >
                      {<span className="text-destructive mr-1">*</span>}
                      {dict?.management?.modelId || "Model ID"}
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>
                          {dict?.management?.modelIdOptionsTip ||
                            "You can check the specific options on each provider's official website, such as OpenAI’s gpt-4 and gpt-3.5-turbo, or DeepSeek’s deepseek-chat."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    id="modelId"
                    name="modelId"
                    defaultValue={defaultValues?.modelId}
                    className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition max-w-full"
                    placeholder={
                      dict?.management?.modelIdPlaceHolder ||
                      "Select Model ID..."
                    }
                    list="modelList"
                    required
                  />
                  {selectedProviderId && modelsByProvider[selectedProviderId] && (
                    <datalist id="modelList">
                      {modelsByProvider[selectedProviderId].map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <label
                    htmlFor="apiKey"
                    className="block text-sm font-medium text-foreground"
                  >
                    {<span className="text-destructive mr-1">*</span>}
                    {dict?.management?.apiKey || "API Key"}
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {dict?.management?.apiKeyTip ||
                          "It will be used for requests only and will be securely managed."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative w-full">
                  <input
                    type={showApiKey ? "text" : "password"}
                    id="apiKey"
                    name="apiKey"
                    className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition pr-10"
                    placeholder={dict?.management?.apiKeyPlaceHolder || "Type..."}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    tabIndex={-1}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <label
                    htmlFor="litellmParams"
                    className="block text-sm font-medium text-foreground"
                  >
                    {dict?.management?.litellmParams || "LiteLLM Params"}
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {dict?.management?.litellmParamsTip ||
                          "Optional litellm params used for making a litellm.completion() call."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <input
                  type="text"
                  id="litellmParams"
                  name="litellmParams"
                  defaultValue={defaultValues?.litellmParams}
                  className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                  placeholder={
                    dict?.management?.litellmParamsPlaceHolder ||
                    '{ "rpm": 100, "timeout": 0, "stream_timeout": 0 }'
                  }
                  required={false}
                />
              </div>
            </div>
          </fieldset>
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
                  "Create note for this pass...(20 words max)"
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = useCallback(
    async (formData: FormData) => {
      if (isSubmitting) {
        return;
      }
      setIsSubmitting(true);
      try {
        const token = await createShortTimeToken(3600);
        router.push(
          `/management/modify?aid=${encodeURIComponent(
            formData.get("adapterId") as string
          )}&token=${encodeURIComponent(token)}`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, router]
  );

  return (
    <form action={onSubmit}>
      <input type="hidden" name="adapterId" value={adapter_id} />
      <DropdownMenuItem
        className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
        asChild
      >
        <button type="submit" className="w-full" disabled={isSubmitting}>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = useCallback(
    async (formData: FormData) => {
      if (isSubmitting) {
        return;
      }
      setIsSubmitting(true);
      try {
        const canRefresh = await deleteAdapterAction(formData);
        if (canRefresh) {
          router.push("/management");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, router]
  );
  return (
    <form action={onSubmit}>
      <input type="hidden" name="adapterId" value={adapter_id} />
      <DropdownMenuItem
        className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
        asChild
      >
        <button type="submit" className="w-full" disabled={isSubmitting}>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reachLimit, setReachLimit] = useState<boolean>(false);
  useEffect(() => {
    setReachLimit(currentAdapterCount >= maxAdapterCountAllowed);
  }, [currentAdapterCount, maxAdapterCountAllowed]);

  const onSubmit = useCallback(
    async (formData: FormData) => {
      if (isSubmitting) {
        return;
      }
      setIsSubmitting(true);
      try {
        const token = await createShortTimeToken(3600);
        router.push(`/management/create?token=${encodeURIComponent(token)}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, router]
  );
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <form action={onSubmit} className="flex flex-row items-center">
            <div className="mr-4 tracking-wider text-muted-foreground">{`(${currentAdapterCount}/${maxAdapterCountAllowed})`}</div>
            <Button
              type="submit"
              variant="outline"
              size="icon"
              disabled={reachLimit || isSubmitting}
              className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">
                {dict?.management?.tokenCreate || "Create Token Pass"}
              </span>
            </Button>
          </form>
        </TooltipTrigger>
        <TooltipContent>
          <p className="tracking-wider text-muted-foreground">
            {dict?.management?.tokenCreate || "Create Token Pass"}{" "}
            {`(${currentAdapterCount}/${maxAdapterCountAllowed})`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
