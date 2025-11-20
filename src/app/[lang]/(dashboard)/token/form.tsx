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
  HelpCircleIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  Server,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export function EditAdapterDropdownForm({
  dict,
  adapter_id,
  onOpenDialog,
}: {
  dict: any;
  adapter_id: string;
  onOpenDialog: (aid: string) => void;
}) {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      onOpenDialog(formData.get("adapterId") as string);
    } catch (error) {
      console.error("Edit adapter error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="adapterId" value={adapter_id} />
      <DropdownMenuItem
        className="w-full cursor-pointer text-foreground focus:text-foreground text-xs xs:text-sm"
        asChild
      >
        <button type="submit" className="w-full">
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
        router.replace("/token");
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
  onOpenDialog,
}: {
  dict: any;
  currentAdapterCount: number;
  maxAdapterCountAllowed: number;
  onOpenDialog: () => void;
}) {
  const [reachLimit, setReachLimit] = useState<boolean>(false);

  useEffect(() => {
    setReachLimit(currentAdapterCount >= maxAdapterCountAllowed);
  }, [currentAdapterCount, maxAdapterCountAllowed]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reachLimit) {
      onOpenDialog();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <form onSubmit={handleSubmit} className="flex flex-row items-center">
            <Button
              type="submit"
              variant="outline"
              disabled={reachLimit}
              className="h-8 px-3 rounded-full sm:h-9 sm:px-4"
            >
              <span className="text-sm">
                {dict?.token?.tokenCreate || "Create"}
              </span>
            </Button>
          </form>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TokenDialog({
  dict,
  proxies, //available proxies
  models, //available models
  dialogMode,
  version,
  open,
  onOpenChange,
  defaultValues,
}: {
  dict: any;
  proxies: { id: string; url: string; status: string }[];
  models: {
    name: string;
    displayName: string;
    description?: string;
    createTime: string;
    state: string;
  }[];
  dialogMode: string;
  version: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: {
    pid?: string; // proxy id
    mid?: string; // model id
    aid?: string; // adapter id
    not?: string; // custom note
  };
}) {
  const router = useRouter();
  const [selectedProxyId, setSelectedProxyId] = useState(
    proxies.some((p) => p.id === defaultValues?.pid) ? defaultValues?.pid : ""
  );
  const [selectedModelId, setSelectedModelId] = useState(
    defaultValues?.mid || ""
  );
  const [isProxyDropdownOpen, setIsProxyDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const proxyDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        proxyDropdownRef.current &&
        !proxyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProxyDropdownOpen(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProxyChange = useCallback((proxyId: string) => {
    setSelectedProxyId(proxyId);
  }, []);

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    setIsModelDropdownOpen(false);
  }, []);

  const onSubmit = useCallback(
    async (formData: FormData) => {
      const currentVersion = await getUserAdapterModifyVersion();
      if (currentVersion !== version) {
        router.replace("/token");
      } else {
        let canRefresh: boolean = false;
        if (dialogMode === "edit") {
          canRefresh = await updateAdapterAction(formData);
        } else {
          canRefresh = await createAdapterAction(formData);
        }
        if (canRefresh) {
          onOpenChange(false);
          router.refresh();
        }
      }
    },
    [version, dialogMode, onOpenChange, router]
  );

  // Filter models based on input
  const filteredModels = useMemo(() => {
    if (!selectedModelId) return models;
    return models.filter((model) =>
      model.name.toLowerCase().includes(selectedModelId.toLowerCase())
    );
  }, [models, selectedModelId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {dialogMode === "edit"
              ? dict?.token?.edit || "Edit"
              : dict?.token?.create || "Create"}
          </DialogTitle>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="adapterId" value={defaultValues?.aid} />
          <input type="hidden" name="proxy" value={selectedProxyId} required />
          <input
            type="hidden"
            name="modelId"
            value={selectedModelId}
            required
          />

          {/* Proxy Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="proxy"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <span className="text-destructive">*</span>
                {dict?.token?.proxy || "Proxy Gateway"}
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
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
              <button
                type="button"
                onClick={() => setIsProxyDropdownOpen(!isProxyDropdownOpen)}
                className="w-full px-3 py-2 text-left bg-background border border-input rounded-md 
                          focus:outline-none focus:ring-2 focus:ring-ring 
                          hover:border-ring/50 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {selectedProxyId ? (
                    <>
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
                            <span className="font-medium truncate text-sm">
                              {proxy.id}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium ${config.color} ${config.bg} ${config.border} border flex-shrink-0`}
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
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      {dict.token?.selectProxy || "Select a proxy server"}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${
                    isProxyDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProxyDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {proxies.length === 0 ? (
                    <div className="px-3 py-6 text-center">
                      <Server className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {dict?.token?.noProxyAvailable ||
                          "No proxy servers available"}
                      </p>
                    </div>
                  ) : (
                    <div className="py-1">
                      {proxies.map((option) => {
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
                                handleProxyChange(option.id);
                                setIsProxyDropdownOpen(false);
                              }
                            }}
                            disabled={isDisabled}
                            className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm
                              ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-accent cursor-pointer"
                              }
                              ${isSelected ? "bg-accent" : ""}
                            `}
                          >
                            <span className={`flex-shrink-0 ${config.color}`}>
                              {config.icon}
                            </span>
                            <span
                              className={`font-medium flex-1 min-w-0 truncate ${
                                isDisabled ? "text-muted-foreground" : ""
                              }`}
                            >
                              {option.id}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium ${config.color} ${config.bg} ${config.border} border flex-shrink-0`}
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
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Model Selection Section - Combobox (No longer dependent on proxy) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="modelId"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <span className="text-destructive">*</span>
                {dict?.token?.modelId || "Model ID"}
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>
                    {dict?.token?.modelIdOptionsTip ||
                      "Use any model ID from your provider. Follow the format shown - you're not limited to listed options."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="relative" ref={modelDropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  id="modelId"
                  value={selectedModelId}
                  onChange={(e) => {
                    setSelectedModelId(e.target.value);
                    setIsModelDropdownOpen(true);
                  }}
                  onFocus={() => setIsModelDropdownOpen(true)}
                  className="w-full px-3 py-2 pr-10 bg-background border border-input rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  placeholder={
                    dict?.token?.modelIdPlaceHolder ||
                    "Select or enter Model ID..."
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
                >
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      isModelDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {isModelDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {filteredModels.length === 0 ? (
                    <div className="px-3 py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        {selectedModelId
                          ? dict?.token?.noMatchingModels ||
                            "No matching models found"
                          : dict?.token?.noModelsAvailable ||
                            "No models available"}
                      </p>
                      {selectedModelId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {dict?.token?.pressEnterToUseCustom ||
                            "Press Enter to use custom model ID"}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-1">
                      {filteredModels.map((model) => {
                        const isSelected = selectedModelId === model.name;
                        return (
                          <button
                            key={model.name}
                            type="button"
                            onClick={() => handleModelChange(model.name)}
                            className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm
                              hover:bg-accent cursor-pointer
                              ${isSelected ? "bg-accent" : ""}
                            `}
                          >
                            <span className="font-medium flex-1 min-w-0 truncate">
                              {model.name}
                            </span>
                            {model.displayName && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {model.displayName}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Note Section */}
          <div className="space-y-2">
            <label htmlFor="commentNote" className="text-sm font-medium">
              {dict?.token?.noteTitle || "Note"}{" "}
              <span className="text-muted-foreground font-normal">
                ({dict?.common?.optional || "Optional"})
              </span>
            </label>

            <textarea
              id="commentNote"
              name="commentNote"
              defaultValue={defaultValues?.not}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-input rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
              placeholder={
                dict?.token?.notePlaceHolder ||
                "Create note for this pass...(20 words max)"
              }
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              {dict?.token?.noteHint || "Maximum 20 characters"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 rounded-md border border-input bg-background
                       hover:bg-accent hover:text-accent-foreground text-sm font-medium
                       transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {dict?.common?.cancel || "Cancel"}
            </button>
            <OnceButton
              type="submit"
              className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground
                       hover:bg-primary/90 text-sm font-medium
                       transition-colors focus:outline-none focus:ring-2 focus:ring-ring
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            >
              {dict?.token?.confirm || "Confirm"}
            </OnceButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
