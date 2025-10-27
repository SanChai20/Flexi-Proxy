"use client";

import { OnceButton } from "@/components/ui/oncebutton";
import {
  createAdapterAction,
  createShortTimeToken,
  deleteAdapterAction,
  getUserAdapterModifyVersion,
  updateAdapterAction,
  getProxyServerModels,
} from "@/lib/actions";
import {
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircleIcon,
  PlusIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  Server,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const Tooltip = dynamic(
  () => import("@/components/ui/tooltip").then((m) => m.Tooltip),
  { ssr: false }
);
const TooltipContent = dynamic(
  () => import("@/components/ui/tooltip").then((m) => m.TooltipContent),
  { ssr: false }
);
const TooltipProvider = dynamic(
  () => import("@/components/ui/tooltip").then((m) => m.TooltipProvider),
  { ssr: false }
);
const TooltipTrigger = dynamic(
  () => import("@/components/ui/tooltip").then((m) => m.TooltipTrigger),
  { ssr: false }
);
const DropdownMenuItem = dynamic(
  () => import("@/components/ui/dropdown-menu").then((m) => m.DropdownMenuItem),
  { ssr: false }
);

const getProxyStatusConfig = (status: string) => {
  switch (status) {
    case "spare":
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-800",
      };
    case "busy":
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-950/30",
        border: "border-orange-200 dark:border-orange-800",
      };
    case "full":
      return {
        icon: <XCircle className="h-4 w-4" />,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-950/30",
        border: "border-red-200 dark:border-red-800",
      };
    default:
      return {
        icon: <XCircle className="h-4 w-4" />,
        color: "text-gray-400",
        bg: "bg-gray-50 dark:bg-gray-900/30",
        border: "border-gray-200 dark:border-gray-700",
      };
  }
};

export function AdapterForm({
  dict,
  proxies,
  providers,

  version,
  defaultValues,
  initProxyId,
}: {
  dict: any;
  proxies: { id: string; url: string; status: string }[];
  providers: { name: string; id: string; website: string }[];
  version: number;
  defaultValues?: {
    adapterId: string;
    modelId: string;
    providerId: string;
    commentNote: string;
    litellmParams: string;
  };
  initProxyId?: string;
}) {
  const router = useRouter();
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(
    providers.some((p) => p.id === defaultValues?.providerId)
      ? defaultValues?.providerId
      : ""
  );
  const [selectedProxyId, setSelectedProxyId] = useState(
    proxies.some((p) => p.id === initProxyId) ? initProxyId : ""
  );
  const [modelId, setModelId] = useState(defaultValues?.modelId || "");
  const [supportedProviders, setSupportedProviders] =
    useState<{ name: string; id: string; website: string }[]>(providers);
  const [modelsByProvider, setModelsByProvider] = useState<
    Record<string, string[]>
  >({});

  const [isProxyDropdownOpen, setIsProxyDropdownOpen] = useState(false);
  const proxyDropdownRef = useRef<HTMLDivElement>(null);

  const selectedProvider = supportedProviders.find(
    (p) => p.id === selectedProviderId
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        proxyDropdownRef.current &&
        !proxyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProxyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAndSetProxyModels = useCallback(
    async (proxyId: string, clearModel = false) => {
      setSelectedProxyId(proxyId);
      setSupportedProviders([]);
      setModelsByProvider({});

      if (clearModel) {
        setModelId("");
      }

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

  const handleProxyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      fetchAndSetProxyModels(e.target.value, true);
    },
    [fetchAndSetProxyModels]
  );

  const initializeProxy = useCallback(
    (proxyId: string) => {
      fetchAndSetProxyModels(proxyId, false);
    },
    [fetchAndSetProxyModels]
  );

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProviderId(e.target.value);
    setModelId("");
  };

  useEffect(() => {
    if (initProxyId) {
      initializeProxy(initProxyId);
    }
  }, [initProxyId, initializeProxy]);

  const onSubmit = useCallback(
    async (formData: FormData) => {
      const currentVersion = await getUserAdapterModifyVersion();
      if (currentVersion !== version) {
        router.push("/token");
      } else {
        let canJump: boolean = false;
        if (defaultValues !== undefined) {
          canJump = await updateAdapterAction(formData);
        } else {
          canJump = await createAdapterAction(formData);
        }
        if (canJump) {
          router.push("/token");
        }
      }
    },
    [router, version, defaultValues, initProxyId]
  );

  return (
    <form action={onSubmit} className="mt-8 max-w-4xl mx-auto">
      <input type="hidden" name="adapterId" value={defaultValues?.adapterId} />

      {/* Main Container with Enhanced Shadow */}
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        {/* Proxy Section */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
              {dict?.token?.proxyServer || "PROXY SERVER"}
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {dict?.token?.targetTitle || "Select Proxy Service"}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="proxy"
                className="text-sm font-medium text-foreground flex items-center gap-1.5"
              >
                <span className="text-destructive">*</span>
                {dict?.token?.proxy || "Proxy Gateway"}
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>
                    {dict?.token?.proxyTip ||
                      "You can choose a LiteLLM proxy service based on your location and server load."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="relative" ref={proxyDropdownRef}>
              <select
                id="proxy"
                name="proxy"
                value={selectedProxyId}
                onChange={handleProxyChange}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                required
                style={{ pointerEvents: "none" }}
              >
                <option value="">
                  {dict.token?.selectProxy || "Select a proxy server"}
                </option>
                {proxies.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.id}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsProxyDropdownOpen(!isProxyDropdownOpen)}
                className="w-full px-4 py-3 text-left text-foreground bg-background border border-input rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
                          transition-all duration-200 hover:border-ring/50 shadow-sm
                          flex items-center justify-between gap-3 group relative z-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {selectedProxyId ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {(() => {
                        const proxy = proxies.find(
                          (p) => p.id === selectedProxyId
                        );
                        if (!proxy) return null;
                        const config = getProxyStatusConfig(proxy.status);
                        return (
                          <>
                            <span className={`flex-shrink-0 ${config.color}`}>
                              {config.icon}
                            </span>
                            <span className="font-medium truncate">
                              {proxy.id}
                            </span>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bg} ${config.border} border`}
                              >
                                {proxy.status === "spare" &&
                                  (dict?.token?.spare || "Spare")}
                                {proxy.status === "busy" &&
                                  (dict?.token?.busy || "Busy")}
                                {proxy.status === "full" &&
                                  (dict?.token?.full || "Full")}
                                {(proxy.status === "" ||
                                  proxy.status === "unavailable") &&
                                  (dict?.token?.unavailable || "Unavailable")}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      {dict.token?.selectProxy || "Select a proxy server"}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                    isProxyDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProxyDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                  <div className="py-1">
                    {proxies.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Server className="h-8 w-8 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">
                            {dict?.token?.noProxyAvailable ||
                              "No proxy servers available"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      proxies.map((option) => {
                        const isDisabled =
                          option.status === "" ||
                          option.status === "unavailable";
                        const config = getProxyStatusConfig(option.status);
                        const isSelected = selectedProxyId === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              if (!isDisabled) {
                                handleProxyChange({
                                  target: { value: option.id },
                                } as React.ChangeEvent<HTMLSelectElement>);
                                setIsProxyDropdownOpen(false);
                              }
                            }}
                            disabled={isDisabled}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                              ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-muted cursor-pointer"
                              }
                              ${isSelected ? "bg-muted/50" : ""}
                            `}
                          >
                            <span className={`flex-shrink-0 ${config.color}`}>
                              {config.icon}
                            </span>
                            <span
                              className={`font-medium flex-1 min-w-0 truncate ${
                                isDisabled
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {option.id}
                            </span>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bg} ${config.border} border`}
                              >
                                {option.status === "spare" &&
                                  (dict?.token?.spare || "Spare")}
                                {option.status === "busy" &&
                                  (dict?.token?.busy || "Busy")}
                                {option.status === "full" &&
                                  (dict?.token?.full || "Full")}
                                {(option.status === "" ||
                                  option.status === "unavailable") &&
                                  (dict?.token?.unavailable || "Unavailable")}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-xs text-muted-foreground">
              •••
            </span>
          </div>
        </div>

        {/* Source Section */}
        <div
          className={`p-8 transition-all duration-300 ${
            selectedProxyId
              ? "opacity-100"
              : "opacity-40 pointer-events-none select-none"
          }`}
        >
          <fieldset disabled={!selectedProxyId}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
                {dict?.token?.tokenPassSource || "SOURCE"}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {dict?.token?.sourceTitle || "Configure Model"}
              </h3>
            </div>

            <div className="space-y-6">
              {/* Provider and Model Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provider Select */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="provider"
                        className="text-sm font-medium text-foreground flex items-center gap-1.5"
                      >
                        <span className="text-destructive">*</span>
                        {dict?.token?.providerOptions || "Provider"}
                      </label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>
                            {dict?.token?.providerOptionsTip ||
                              "E.g. Anthropic, Deepseek, OpenRouter etc."}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {selectedProvider?.website && (
                      <a
                        href={selectedProvider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors group"
                        title={`Go to ${selectedProvider.name} official website`}
                      >
                        <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                  </div>

                  <select
                    id="provider"
                    name="provider"
                    value={selectedProviderId}
                    onChange={handleProviderChange}
                    className="w-full px-4 py-3 text-foreground bg-background border border-input rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
             transition-all duration-200 hover:border-ring/50
             bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNiA5IDYgNiA2LTYiLz48L3N2Zz4=')] 
             bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px] appearance-none
             shadow-sm"
                    required
                  >
                    <option value="">
                      {dict.token?.selectProvider || "Select a provider"}
                    </option>
                    {supportedProviders.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model ID Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="modelId"
                      className="text-sm font-medium text-foreground flex items-center gap-1.5"
                    >
                      <span className="text-destructive">*</span>
                      {dict?.token?.modelId || "Model ID"}
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>
                          {dict?.token?.modelIdOptionsTip ||
                            "Use any model ID from your provider (e.g., `gpt-4`, `deepseek-chat`). Follow the format shown - you're not limited to listed options. See provider docs for available models."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <input
                    type="text"
                    id="modelId"
                    name="modelId"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full px-4 py-3 text-foreground bg-background border border-input rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
             transition-all duration-200 hover:border-ring/50 shadow-sm"
                    placeholder={
                      dict?.token?.modelIdPlaceHolder || "Select Model ID..."
                    }
                    list="modelList"
                    required
                  />
                  {selectedProviderId &&
                    modelsByProvider[selectedProviderId] && (
                      <datalist id="modelList">
                        {modelsByProvider[selectedProviderId].map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    )}
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="apiKey"
                    className="text-sm font-medium text-foreground flex items-center gap-1.5"
                  >
                    <span className="text-destructive">*</span>
                    {dict?.token?.apiKey || "API Key"}
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {dict?.token?.apiKeyTip ||
                          "It will be used for requests only and will be securely managed."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="relative group">
                  <input
                    type={showApiKey ? "text" : "password"}
                    id="apiKey"
                    name="apiKey"
                    className="w-full px-4 py-3 pr-12 text-foreground bg-background border border-input rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
                             transition-all duration-200 hover:border-ring/50 shadow-sm"
                    placeholder={dict?.token?.apiKeyPlaceHolder || "Type..."}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md
                             text-muted-foreground hover:text-foreground hover:bg-muted/50
                             transition-all duration-200"
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

              {/* LiteLLM Params */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="litellmParams"
                    className="text-sm font-medium text-foreground"
                  >
                    {dict?.token?.litellmParams || "LiteLLM Params"}
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {dict?.token?.litellmParamsTip ||
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
                  className="w-full px-4 py-3 text-foreground bg-background border border-input rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
                           transition-all duration-200 hover:border-ring/50 shadow-sm font-mono text-sm"
                  placeholder={
                    dict?.token?.litellmParamsPlaceHolder ||
                    '{ "rpm": 100, "timeout": 0, "stream_timeout": 0 }'
                  }
                />
              </div>
            </div>
          </fieldset>
        </div>

        {/* Enhanced Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-xs text-muted-foreground">
              •••
            </span>
          </div>
        </div>

        {/* Note Section */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
              {dict?.token?.noteTag || "NOTE"}
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {dict?.token?.noteTitle || "Add note information"}
            </h3>
          </div>

          <div className="space-y-3">
            <textarea
              id="commentNote"
              name="commentNote"
              defaultValue={defaultValues?.commentNote}
              rows={3}
              className="w-full px-4 py-3 text-foreground bg-background border border-input rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
                       transition-all duration-200 hover:border-ring/50 resize-none shadow-sm"
              placeholder={
                dict?.token?.notePlaceHolder ||
                "Create note for this pass...(20 words max)"
              }
              maxLength={20}
            ></textarea>
            <p className="text-xs text-muted-foreground">
              {dict?.token?.noteHint || "Maximum 20 characters"}
            </p>
          </div>
        </div>

        {/* Enhanced Divider */}
        <div className="border-t border-border"></div>

        {/* Submit Button */}
        <div className="p-8">
          <OnceButton
            type="submit"
            className="w-full rounded-lg bg-primary text-primary-foreground px-6 py-3.5
                     font-medium shadow-md hover:shadow-lg
                     transition-all duration-200 hover:opacity-90 hover:scale-[1.02]
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring
                     active:scale-[0.98]"
          >
            {dict?.token?.confirm || "Confirm"}
          </OnceButton>
        </div>
      </div>
    </form>
  );
}

export function EditAdapterDropdownForm({
  dict,
  adapter_id,
  onSubmitStart,
  onSubmitEnd,
}: {
  dict: any;
  adapter_id: string;
  onSubmitStart: () => void;
  onSubmitEnd: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    onSubmitStart();

    try {
      const formData = new FormData(e.currentTarget);
      const token = await createShortTimeToken(3600);
      router.push(
        `/token/modify?aid=${encodeURIComponent(
          formData.get("adapterId") as string
        )}&token=${encodeURIComponent(token)}`
      );
    } catch (error) {
      console.error("Edit adapter error:", error);
      setIsSubmitting(false);
      onSubmitEnd();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="adapterId" value={adapter_id} />
      <DropdownMenuItem
        className="w-full cursor-pointer text-foreground focus:text-foreground text-xs xs:text-sm"
        asChild
      >
        <button type="submit" className="w-full" disabled={isSubmitting}>
          {dict?.token?.edit || "Edit"}
        </button>
      </DropdownMenuItem>
    </form>
  );
}

export function DeleteAdapterDropdownForm({
  dict,
  adapter_id,
  onSubmitStart,
  onSubmitEnd,
}: {
  dict: any;
  adapter_id: string;
  onSubmitStart: () => void;
  onSubmitEnd: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    onSubmitStart();

    try {
      const formData = new FormData(e.currentTarget);
      const canRefresh = await deleteAdapterAction(formData);
      if (canRefresh) {
        router.refresh();
      }
    } catch (error) {
      console.error("Delete adapter error:", error);
      setIsSubmitting(false);
      onSubmitEnd();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="adapterId" value={adapter_id} />
      <DropdownMenuItem
        className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
        asChild
      >
        <button type="submit" className="w-full" disabled={isSubmitting}>
          {dict?.token?.delete || "Delete"}
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting || reachLimit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await createShortTimeToken(3600);
      router.push(`/token/create?token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error("Failed to create token:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <form onSubmit={handleSubmit} className="flex flex-row items-center">
            <div className="mr-4 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold tracking-wide">
              {`${currentAdapterCount}/${maxAdapterCountAllowed}`}
            </div>

            <Button
              type="submit"
              variant="outline"
              size="icon"
              disabled={reachLimit || isSubmitting}
              className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="sr-only">
                {dict?.token?.tokenCreate || "Create Token Pass"}
              </span>
            </Button>
          </form>
        </TooltipTrigger>
        <TooltipContent>
          <p className="tracking-wider text-muted-foreground">
            {dict?.token?.tokenCreate || "Create Token Pass"}{" "}
            <span className="font-medium">
              ({currentAdapterCount}/{maxAdapterCountAllowed})
            </span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
