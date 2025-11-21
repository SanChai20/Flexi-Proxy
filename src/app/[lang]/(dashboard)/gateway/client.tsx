"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Clock,
  Zap,
  Gift,
  Hash,
  MapPin,
  Loader2,
  Lock,
  Globe,
  Unlock,
  Plus,
  Settings,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  checkProxyServerHealth,
  createPrivateProxyInstance,
  createShortTimeToken,
  deletePrivateProxyInstance,
  fetchDeploymentProgress,
} from "@/lib/actions";
import { redirect, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface GatewayClientProps {
  dict: any;
  permissions: any;
  userTokenCount: number;
  proxyServers: {
    url: string;
    status: string;
    id: string;
    isHealthy: boolean;
    responseTime: number | undefined;
    type: string;
    error?: string | undefined;
  }[];
  defaultGatewayType: string;
}

interface DeploymentStatusProps {
  sub: string;
  dict: any;
  onStatusChange?: (status: {
    currentStep: number;
    totalStep: number;
    deploymentStatus: string;
  }) => void;
  refreshInterval?: number; // milliseconds, default 5000
}

// 显示部署状态和进度
export function DeploymentStatus({
  sub,
  dict,
  onStatusChange,
  refreshInterval = 5000,
}: DeploymentStatusProps) {
  const [deploymentStatus, setDeploymentStatus] = useState<{
    currentStep: number;
    totalStep: number;
    deploymentStatus: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialFetchRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!deploymentStatus || deploymentStatus.totalStep === 0) return 0;

    // For pending status, show 0% progress
    if (deploymentStatus.deploymentStatus === "pending") return 0;

    return Math.round(
      (deploymentStatus.currentStep / deploymentStatus.totalStep) * 100
    );
  };

  // Fetch deployment progress
  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const status: null | {
        currentStep: number;
        totalStep: number;
        deploymentStatus: string;
      } = await fetchDeploymentProgress(sub);

      if (status) {
        setDeploymentStatus(status);
        onStatusChange?.(status);

        // Stop auto-refresh when deployment is complete or failed
        if (
          (status.deploymentStatus === "success" ||
            status.deploymentStatus === "error") &&
          intervalRef.current
        ) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Failed to fetch deployment progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    if (!hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      fetchProgress();
    }

    // Set up interval for pending and running states
    if (
      !intervalRef.current &&
      (!deploymentStatus ||
        deploymentStatus.deploymentStatus === "pending" ||
        deploymentStatus.deploymentStatus === "running")
    ) {
      intervalRef.current = setInterval(fetchProgress, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sub, deploymentStatus?.deploymentStatus, refreshInterval]);

  // Get status badge configuration
  const getStatusBadge = () => {
    if (!deploymentStatus) return null;

    switch (deploymentStatus.deploymentStatus) {
      case "pending":
        return {
          variant: "secondary" as const,
          className: "bg-amber-500/90 hover:bg-amber-600 border-amber-500/20",
          icon: <Clock className="h-2.5 w-2.5 mr-1" />,
          text: dict?.gateway?.pending || "Pending",
        };
      case "running":
        return {
          variant: "secondary" as const,
          className: "bg-blue-500/90 hover:bg-blue-600 border-blue-500/20",
          icon: <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />,
          text: dict?.gateway?.deploying || "Deploying",
        };
      case "success":
        return {
          variant: "default" as const,
          className:
            "bg-emerald-500/90 hover:bg-emerald-600 border-emerald-500/20",
          icon: <CheckCircle2 className="h-2.5 w-2.5 mr-1" />,
          text: dict?.gateway?.completed || "Completed",
        };
      case "error":
        return {
          variant: "destructive" as const,
          className: "bg-red-500/90 hover:bg-red-600 border-red-500/20",
          icon: <AlertCircle className="h-2.5 w-2.5 mr-1" />,
          text: dict?.gateway?.failed || "Failed",
        };
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge();
  const progressPercentage = getProgressPercentage();

  if (!deploymentStatus) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {/* Status Badge */}
      <div className="flex items-center gap-1.5">
        {statusBadge && (
          <Badge
            variant={statusBadge.variant}
            className={`text-[10px] font-medium px-1.5 py-0.5 ${statusBadge.className} shadow-sm`}
          >
            {statusBadge.icon}
            {statusBadge.text}
          </Badge>
        )}
      </div>

      {/* Progress Section */}
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-medium">
            {deploymentStatus.deploymentStatus === "pending"
              ? dict?.gateway?.waiting || "Waiting to start..."
              : `${dict?.gateway?.step || "Step"} ${
                  deploymentStatus.currentStep
                } / ${deploymentStatus.totalStep}`}
          </span>
          <span className="font-semibold tabular-nums">
            {progressPercentage}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden ring-1 ring-border/30">
          <div
            className={`h-full transition-all duration-500 ease-out relative ${
              deploymentStatus.deploymentStatus === "error"
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : deploymentStatus.deploymentStatus === "success"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : deploymentStatus.deploymentStatus === "pending"
                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            {/* 进度条光效 */}
            {deploymentStatus.deploymentStatus === "running" &&
              progressPercentage > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GatewayClient({
  dict,
  permissions,
  userTokenCount,
  proxyServers,
  defaultGatewayType,
}: GatewayClientProps) {
  const router = useRouter();
  const [operatingProxyId, setOperatingProxyId] = useState<string | null>(null);
  const [privateCreating, setPrivateCreating] = useState<boolean>(false);
  const [loadingProxyId, setLoadingProxyId] = useState<string | null>(null);
  const [gatewayType, setGatewayType] = useState<string>(defaultGatewayType);
  const [showConfigDialog, setShowConfigDialog] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const filteredServers = useMemo(
    () =>
      proxyServers.filter(
        (server) => (server.type || "public") === gatewayType
      ),
    [proxyServers, gatewayType]
  );

  const parseGatewayLocation = (id: string) => {
    // Format: gateway-xx-yy-zz
    const parts = id.split("-");
    if (parts.length >= 3) {
      const region = parts[1]; // xx: Country/Region
      const direction = parts[2]; // yy: e.g. East/North
      return { region, direction };
    }
    return { region: "", direction: "" };
  };

  const formatLocation = (region: string, direction: string) => {
    const regionMap: Record<string, string> = {
      us: dict?.regions?.us || "US",
      eu: dict?.regions?.eu || "EU",
      ca: dict?.regions?.ca || "Canada",
      ap: dict?.regions?.ap || "Asia Pacific",
      cn: dict?.regions?.cn || "China",
      jp: dict?.regions?.jp || "Japan",
      kr: dict?.regions?.kr || "Korea",
      sg: dict?.regions?.sg || "Singapore",
      au: dict?.regions?.au || "Australia",
    };

    const directionMap: Record<string, string> = {
      east: dict?.directions?.east || "East",
      west: dict?.directions?.west || "West",
      north: dict?.directions?.north || "North",
      northeast: dict?.directions?.northeast || "NorthEast",
      northwest: dict?.directions?.northwest || "NorthWest",
      south: dict?.directions?.south || "South",
      southeast: dict?.directions?.southeast || "SouthEast",
      southwest: dict?.directions?.southwest || "SouthWest",
      central: dict?.directions?.central || "Central",
    };

    const regionText = regionMap[region.toLowerCase()] || region.toUpperCase();
    const directionText = directionMap[direction.toLowerCase()] || direction;

    return `${regionText} ${directionText}`;
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      spare: dict?.token?.spare || "Spare",
      busy: dict?.token?.busy || "Busy",
      full: dict?.token?.full || "Full",
      unavailable: dict?.token?.unavailable || "Unavailable",
    };
    if (status === undefined || status.length <= 0) {
      return texts.unavailable;
    }
    return texts[status.toLowerCase()] || status;
  };

  const isServerAvailable = (server: (typeof proxyServers)[0]) => {
    if (userTokenCount >= permissions.maa) {
      return false;
    }
    if (server === undefined || server.status === undefined) {
      return false;
    }
    return server.isHealthy && server.status.toLowerCase() !== "unavailable";
  };

  const handleGetToken = useCallback(
    async (proxyId: string) => {
      if (loadingProxyId !== null) {
        console.warn("Another operation is in progress");
        return;
      }

      try {
        setLoadingProxyId(proxyId);
        router.push(`/token?pid=${encodeURIComponent(proxyId)}`);
      } catch (error) {
        console.error("Failed to create token:", error);
      } finally {
        setLoadingProxyId(null);
      }
    },
    [loadingProxyId, router]
  );

  const handleDeletePrivateGateway = useCallback(
    async (proxyId: string, subdomainName: string) => {
      if (operatingProxyId !== null) {
        console.warn("Another operation is in progress");
        return;
      }

      if (!subdomainName) return;

      const cleanSubdomain = subdomainName.startsWith("https://")
        ? subdomainName.substring(8)
        : subdomainName;

      try {
        setOperatingProxyId(proxyId);
        await deletePrivateProxyInstance(proxyId, cleanSubdomain);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.refresh();
      } catch (error) {
        console.error("Failed to delete gateway:", error);
      } finally {
        setOperatingProxyId(null);
      }
    },
    [operatingProxyId, router]
  );

  const handleOpenConfigDialog = () => {
    setShowConfigDialog(true);
  };

  const handleConfirmCreate = useCallback(async () => {
    if (
      !permissions.adv ||
      permissions.mppa <=
        proxyServers.filter((proxy) => proxy.type === "private").length
    ) {
      router.push("/subscription");
      return;
    }

    setShowConfigDialog(false);
    setPrivateCreating(true);

    try {
      const subdomainName = await createPrivateProxyInstance();
      if (!subdomainName) {
        throw new Error("Failed to create subdomain");
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to create private gateway:", error);
    } finally {
      setPrivateCreating(false);
      setSelectedRegion("");
    }
  }, [permissions, proxyServers, router]);

  // Currently only supports us-east-2
  const regionOptions = [
    { value: "us-east-2", label: formatLocation("us", "east") + " 2" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-0 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-1.5 bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          {dict?.gateway?.title || "Proxy Gateways"}
        </h1>
        <p className="text-sm text-muted-foreground/80 mb-5">
          {dict?.gateway?.subtitle ||
            "List all available proxy gateways and their features"}
        </p>
        <div className="flex justify-center">
          <Tabs
            value={gatewayType}
            onValueChange={(value) =>
              setGatewayType(value as "public" | "private")
            }
          >
            <TabsList className="grid w-full grid-cols-2 h-9 bg-muted/40 backdrop-blur-sm">
              <TabsTrigger
                value="public"
                className="gap-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Globe className="w-3 h-3" />
                <span>{dict?.gateway?.public || "Public"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="gap-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Lock className="w-3 h-3" />
                <span>{dict?.gateway?.private || "Private"}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Gateway Cards */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
          {/* Add Card for Private Gateway */}
          {gatewayType === "private" && (
            <Card
              className={`group relative transition-all duration-300 hover:shadow-lg border-dashed border-[1.5px] flex flex-col h-full overflow-hidden ${
                !privateCreating &&
                permissions.adv &&
                permissions.mppa >
                  proxyServers.filter((proxy) => proxy.type === "private")
                    .length
                  ? "cursor-pointer hover:border-primary/60 hover:bg-accent/30"
                  : "cursor-pointer opacity-60"
              }`}
              onClick={() => {
                if (
                  !privateCreating &&
                  permissions.adv &&
                  permissions.mppa >
                    proxyServers.filter((proxy) => proxy.type === "private")
                      .length
                ) {
                  handleOpenConfigDialog();
                } else {
                  router.push("/subscription");
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="pb-2.5 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CardTitle className="text-sm font-semibold">
                      {dict?.gateway?.createNew || "Create New Gateway"}
                    </CardTitle>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset backdrop-blur-sm ${
                      permissions.adv
                        ? "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20"
                        : "bg-muted text-muted-foreground ring-border"
                    }`}
                  >
                    {permissions.adv
                      ? `${
                          proxyServers.filter(
                            (proxy) => proxy.type === "private"
                          ).length
                        } / ${permissions.mppa}`
                      : dict?.gateway?.notAvailable || "Not Available"}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground/70 mt-0.5 leading-tight">
                  {permissions.adv
                    ? dict?.gateway?.createDescription ||
                      "Click to create a new private proxy gateway"
                    : dict?.gateway?.upgradeRequired ||
                      "Upgrade required to create private gateways"}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-center pt-0 pb-3 relative z-10">
                <div className="flex flex-col items-center justify-center py-4 gap-2.5">
                  {privateCreating ? (
                    <>
                      <div className="relative p-2.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold">
                          {dict?.gateway?.creating || "Creating gateway..."}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                          <Zap className="w-3 h-3" />
                          <span>
                            {dict?.gateway?.deployment ||
                              "Deployment takes about 5 minutes"}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative p-2.5 rounded-xl bg-muted/40 ring-1 ring-border/50 group-hover:ring-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                        <Plus className="w-6 h-6 text-muted-foreground/60 group-hover:text-primary/80 transition-colors duration-300" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold">
                          {permissions.adv
                            ? dict?.gateway?.clickToCreate || "Click to create"
                            : dict?.gateway?.notAvailable || "Not Available"}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                          <Zap className="w-3 h-3" />
                          <span>
                            {dict?.gateway?.deployment ||
                              "Deployment takes about 5 minutes"}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Gateway Cards */}
          {filteredServers.map((server) => {
            const available = isServerAvailable(server);
            const isLoading = loadingProxyId === server.id;
            const { region, direction } = parseGatewayLocation(server.id);
            const locationText = formatLocation(region, direction);

            return (
              <Card
                key={server.id}
                className="group relative transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex flex-col overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="pb-2.5 relative z-10">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="p-1 rounded-md bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors duration-300 shrink-0">
                        <Hash className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-shrink">
                        <CardTitle className="text-sm font-semibold truncate leading-tight text-left">
                          <span
                            dir="ltr"
                            className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                          >
                            {server.id}
                          </span>
                        </CardTitle>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset backdrop-blur-sm ${
                          server.status === "running"
                            ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20"
                            : server.status === "pending"
                            ? "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20"
                            : "bg-muted text-muted-foreground ring-border"
                        }`}
                      >
                        {getStatusText(server.status)}
                      </span>

                      <div className="relative shrink-0">
                        <div
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            server.isHealthy
                              ? "bg-emerald-500 shadow-md shadow-emerald-500/50"
                              : "bg-muted-foreground/30"
                          }`}
                        />
                        {server.isHealthy && (
                          <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        )}
                      </div>

                      {gatewayType === "private" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 rounded-md hover:bg-accent/50 transition-colors duration-200 shrink-0">
                            {operatingProxyId === server.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            ) : (
                              <Settings className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                            )}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              disabled={operatingProxyId === server.id}
                              onClick={() =>
                                handleDeletePrivateGateway(
                                  server.id,
                                  server.url
                                )
                              }
                              className="cursor-pointer text-destructive focus:text-destructive gap-2 text-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>
                                {dict?.gateway?.deleteProxy ||
                                  "Delete Proxy Server"}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {region && direction && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/30 w-fit mb-1.5 group-hover:bg-accent/50 transition-colors duration-300">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-[11px] font-medium text-foreground/90">
                        {locationText}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-1.5 p-1.5 rounded-md bg-muted/30 group-hover:bg-muted/50 transition-colors duration-300">
                    <div className="flex-1 min-w-0">
                      <code className="text-[10px] text-muted-foreground break-all font-mono leading-relaxed">
                        {server.url.startsWith("https://")
                          ? server.url
                          : `https://${server.url}`}
                      </code>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-end space-y-2 relative z-10 pt-0 pb-3">
                  {gatewayType === "private" && (
                    <div className="rounded-md border bg-muted/30 p-2">
                      <DeploymentStatus
                        sub={
                          server.url.startsWith("https://")
                            ? server.url.substring(8)
                            : server.url
                        }
                        dict={dict}
                        onStatusChange={(status) => {
                          if (status.deploymentStatus === "success") {
                            setTimeout(() => {
                              router.refresh();
                            }, 3000);
                          }
                        }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5">
                    {
                      <div className="flex flex-col gap-1 p-2 rounded-md bg-gradient-to-br from-accent/40 to-accent/20 border border-border/40">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {dict?.gateway?.status || "Status"}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            server.isHealthy
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {server.isHealthy
                            ? dict?.gateway?.healthy || "Healthy"
                            : dict?.gateway?.unhealthy || "Unhealthy"}
                        </span>
                      </div>
                    }

                    {
                      <div className="flex flex-col gap-1 p-2 rounded-md bg-gradient-to-br from-accent/40 to-accent/20 border border-border/40">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {dict?.gateway?.latency || "Latency"}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold tabular-nums ${
                            typeof server.responseTime === "number"
                              ? server.responseTime < 100
                                ? "text-emerald-600 dark:text-emerald-400"
                                : server.responseTime < 300
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {typeof server.responseTime === "number" ? (
                            <>
                              {server.responseTime}
                              <span className="text-[10px] ml-0.5 font-normal">
                                ms
                              </span>
                            </>
                          ) : (
                            "-"
                          )}
                        </span>
                      </div>
                    }
                  </div>

                  <Button
                    className={`w-full relative overflow-hidden group/btn transition-all duration-300 h-8 text-xs font-medium ${
                      available
                        ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25"
                        : ""
                    }`}
                    variant={available ? "default" : "secondary"}
                    disabled={
                      !available ||
                      loadingProxyId !== null ||
                      operatingProxyId === server.id
                    }
                    onClick={() => handleGetToken(server.id)}
                  >
                    {available && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    )}

                    <span className="relative z-10 flex items-center justify-center gap-1.5">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          {dict?.gateway?.loading || "Loading..."}
                        </>
                      ) : (
                        <>
                          <span>
                            {dict?.gateway?.getToken || "Get Token Pass"}
                          </span>
                          <span className="transform group-hover/btn:translate-x-0.5 transition-transform duration-200">
                            →
                          </span>
                        </>
                      )}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              {dict?.gateway?.configureGateway || "Configure New Gateway"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {dict?.gateway?.configureDescription ||
                "Select region and country to deploy your private proxy gateway"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {dict?.gateway?.selectRegion || "Select Region"}
              </label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue
                    placeholder={
                      dict?.gateway?.regionPlaceholder || "Choose a region"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRegion && (
              <div className="rounded-md border bg-muted/40 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">
                    {dict?.gateway?.deployment ||
                      "Deployment takes about 5 minutes"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {regionOptions.find((r) => r.value === selectedRegion)?.label}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfigDialog(false);
                setSelectedRegion("");
              }}
              className="h-9 text-sm"
            >
              {dict?.gateway?.cancel || "Cancel"}
            </Button>
            <Button
              onClick={handleConfirmCreate}
              disabled={!selectedRegion}
              className="gap-1.5 h-9 text-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              {dict?.gateway?.confirmCreate || "Confirm & Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
