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
import { useEffect, useRef, useState } from "react";
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
  dict?: {
    step?: string;
    pending?: string;
    running?: string;
    completed?: string;
    failed?: string;
    autoRefresh?: string;
  };
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
  dict = {},
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
          className: "bg-yellow-600 hover:bg-yellow-700",
          icon: <Clock className="h-3 w-3 mr-1" />,
          text: dict?.pending || "Pending",
        };
      case "running":
        return {
          variant: "secondary" as const,
          className: "bg-blue-600 hover:bg-blue-700",
          icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
          text: dict?.running || "Running",
        };
      case "success":
        return {
          variant: "default" as const,
          className: "bg-green-600 hover:bg-green-700",
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
          text: dict?.completed || "Completed",
        };
      case "error":
        return {
          variant: "destructive" as const,
          className: "",
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: dict?.failed || "Failed",
        };
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge();
  const progressPercentage = getProgressPercentage();

  if (!deploymentStatus) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {/* Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {(deploymentStatus.deploymentStatus === "pending" ||
          deploymentStatus.deploymentStatus === "running") && (
          <Badge variant="secondary" className="text-xs font-normal">
            {dict?.autoRefresh || "Auto-refresh: 5s"}
          </Badge>
        )}

        {statusBadge && (
          <Badge
            variant={statusBadge.variant}
            className={`text-xs font-normal ${statusBadge.className}`}
          >
            {statusBadge.icon}
            {statusBadge.text}
          </Badge>
        )}
      </div>

      {/* Progress Section */}
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {deploymentStatus.deploymentStatus === "pending"
              ? dict?.pending || "Waiting to start..."
              : `${dict?.step || "Step"} ${deploymentStatus.currentStep} / ${
                  deploymentStatus.totalStep
                }`}
          </span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              deploymentStatus.deploymentStatus === "error"
                ? "bg-red-600"
                : deploymentStatus.deploymentStatus === "success"
                ? "bg-green-600"
                : deploymentStatus.deploymentStatus === "pending"
                ? "bg-yellow-600"
                : "bg-blue-600"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
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

  const [filteredServers, setFilteredServers] = useState<
    {
      url: string;
      status: string;
      id: string;
      isHealthy: boolean;
      responseTime: number | undefined;
      type: string;
      error?: string | undefined;
    }[]
  >(
    proxyServers.filter(
      (server) => (server.type || "public") === defaultGatewayType
    )
  );

  useEffect(() => {
    setFilteredServers(
      proxyServers.filter((server) => (server.type || "public") === gatewayType)
    );
  }, [proxyServers, gatewayType]);

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

  const handleGetToken = async (proxyId: string) => {
    try {
      setLoadingProxyId(proxyId);
      router.push(`/token?pid=${encodeURIComponent(proxyId)}`);
    } catch (error) {
      console.error("Failed to create token:", error);
      setLoadingProxyId(null);
    }
  };

  const handleDeletePrivateGateway = async (
    proxyId: string,
    subdomainName: string
  ) => {
    if (subdomainName === undefined) {
      return;
    }
    if (subdomainName.startsWith("https://")) {
      subdomainName = subdomainName.substring(8);
    }
    try {
      setOperatingProxyId(proxyId);
      setFilteredServers((prev) =>
        prev.filter((server) => server.id !== proxyId)
      );
      await deletePrivateProxyInstance(proxyId, subdomainName);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.refresh();
    } catch (error) {
      console.error(error);
      // setFilteredServers(
      //   proxyServers.filter(
      //     (server) => (server.type || "public") === gatewayType
      //   )
      // );
      setOperatingProxyId(null);
    }
  };

  const handleOpenConfigDialog = () => {
    setShowConfigDialog(true);
  };

  const handleConfirmCreate = async () => {
    setShowConfigDialog(false);
    try {
      setPrivateCreating(true);
      if (
        !permissions.adv ||
        permissions.mppa <=
          proxyServers.filter((proxy) => proxy.type === "private").length
      ) {
        setPrivateCreating(false);
        return;
      }
      const [subdomainName, token] = await Promise.all([
        createPrivateProxyInstance(),
        createShortTimeToken(3600),
      ]);
      if (subdomainName === undefined) {
        setPrivateCreating(false);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      setPrivateCreating(false);
    }
  };

  // Currently only supports us-east-2
  const regionOptions = [
    { value: "us-east-2", label: formatLocation("us", "east") + " 2" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-0 px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-semibold mb-2">
          {dict?.gateway?.title || "Proxy Gateways"}
        </h1>
        <p className="text-muted-foreground mb-6">
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="public" className="gap-2 py-2">
                <Globe className="w-3 h-3" />
                <span className="text-xs">
                  {dict?.gateway?.public || "Public"}
                </span>
              </TabsTrigger>
              <TabsTrigger value="private" className="gap-2 py-2">
                <Lock className="w-3 h-3" />
                <span className="text-xs">
                  {dict?.gateway?.private || "Private"}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {/* Gateway Cards */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Card for Private Gateway - Always visible when in private mode */}
          {gatewayType === "private" && (
            <Card
              className={`transition-all duration-200 hover:shadow-lg border-dashed border-2 flex flex-col h-full ${
                !privateCreating &&
                permissions.adv &&
                permissions.mppa >
                  proxyServers.filter((proxy) => proxy.type === "private")
                    .length
                  ? "cursor-pointer hover:border-primary hover:bg-accent/50"
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CardTitle className="text-lg font-semibold">
                      {dict?.gateway?.createNew || "Create New Gateway"}
                    </CardTitle>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                      permissions.adv
                        ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700"
                        : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
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
                <div className="text-xs text-muted-foreground mt-1">
                  {permissions.adv
                    ? dict?.gateway?.createDescription ||
                      "Click to create a new private proxy gateway"
                    : dict?.gateway?.upgradeRequired ||
                      "Upgrade required to create private gateways"}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-center space-y-4">
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  {privateCreating ? (
                    <>
                      <div className="relative p-4 rounded-full bg-primary/10">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-base font-semibold">
                          {dict?.gateway?.creating || "Creating gateway..."}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Zap className="w-4 h-4" />
                          <span>
                            {dict?.gateway?.deployment ||
                              "Deployment takes about 5 minutes"}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative p-4 rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/30">
                        <Plus className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-base font-semibold">
                          {permissions.adv
                            ? dict?.gateway?.clickToCreate || "Click to create"
                            : dict?.gateway?.notAvailable || "Not Available"}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Zap className="w-4 h-4" />
                          <span>
                            {dict?.gateway?.deployment ||
                              "Deployment takes about 5 minutes"}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 添加占位空间，匹配其他卡片的按钮区域 */}
              </CardContent>
            </Card>
          )}

          {/* Existing Gateway Cards - 美化版本 */}
          {filteredServers.map((server) => {
            const available = isServerAvailable(server);
            const isLoading = loadingProxyId === server.id;
            const { region, direction } = parseGatewayLocation(server.id);
            const locationText = formatLocation(region, direction);

            return (
              <Card
                key={server.id}
                className="group relative transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex flex-col overflow-hidden border border-border/40 bg-gradient-to-br from-card via-card to-card/95"
              >
                {/* 顶部装饰渐变条 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="pb-4 relative z-10">
                  {/* 标题行 */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-shrink">
                        <CardTitle className="text-base font-semibold truncate leading-tight text-left">
                          <span
                            dir="ltr"
                            className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                          >
                            {server.id}
                          </span>
                        </CardTitle>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* 状态徽章 - 重新设计 */}
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset backdrop-blur-sm transition-all duration-200 ${
                          server.status === "running"
                            ? "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20"
                            : server.status === "pending"
                            ? "bg-amber-500/10 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20"
                            : "bg-gray-500/10 text-gray-700 ring-gray-600/20 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"
                        }`}
                      >
                        {getStatusText(server.status)}
                      </span>

                      {/* 健康状态指示器 - 重新设计 */}
                      <div className="relative">
                        <div
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            server.isHealthy
                              ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                              : "bg-gray-400"
                          }`}
                        />
                        {server.isHealthy && (
                          <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        )}
                      </div>

                      {/* 设置菜单 */}
                      {gatewayType === "private" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-accent/50 transition-colors duration-200">
                            {operatingProxyId === server.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                            )}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              disabled={operatingProxyId === server.id}
                              onClick={() =>
                                handleDeletePrivateGateway(
                                  server.id,
                                  server.url
                                )
                              }
                              className="cursor-pointer text-destructive focus:text-destructive gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
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

                  {/* 位置信息 - 重新设计 */}
                  {region && direction && (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent/30 w-fit mb-2 group-hover:bg-accent/50 transition-colors duration-300">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-medium text-foreground/90">
                        {locationText}
                      </span>
                    </div>
                  )}

                  {/* URL 信息 - 更优雅的展示 */}
                  <div className="flex items-start gap-2 mt-1 p-2 rounded-md bg-muted/30 group-hover:bg-muted/50 transition-colors duration-300">
                    <div className="flex-1 min-w-0">
                      <code className="text-xs text-muted-foreground break-all font-mono">
                        {server.url.startsWith("https://")
                          ? server.url
                          : `https://${server.url}`}
                      </code>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-end space-y-3 relative z-10 pt-0">
                  {/* Deployment Status - Only for private pending servers */}
                  {gatewayType === "private" && (
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <DeploymentStatus
                        sub={server.url}
                        dict={{
                          step: dict?.deployment?.step || "Step",
                          running: dict?.deployment?.running || "Running",
                          completed: dict?.deployment?.completed || "Completed",
                          failed: dict?.deployment?.failed || "Failed",
                          autoRefresh:
                            dict?.deployment?.autoRefresh || "Auto-refresh: 5s",
                        }}
                        onStatusChange={(status) => {
                          // Optionally refresh the page when deployment completes
                          if (status.deploymentStatus === "success") {
                            setTimeout(() => {
                              router.refresh();
                            }, 2000);
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* 性能指标卡片 */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* 健康状态 */}
                    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-gradient-to-br from-accent/40 to-accent/20 border border-border/40">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {dict?.gateway?.status || "Status"}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          server.isHealthy
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {server.isHealthy
                          ? dict?.gateway?.healthy || "Healthy"
                          : dict?.gateway?.unhealthy || "Unhealthy"}
                      </span>
                    </div>

                    {/* 响应时间 */}
                    {typeof server.responseTime === "number" && (
                      <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-gradient-to-br from-accent/40 to-accent/20 border border-border/40">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {dict?.gateway?.latency || "Latency"}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold tabular-nums ${
                            server.responseTime < 100
                              ? "text-emerald-600 dark:text-emerald-400"
                              : server.responseTime < 300
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {server.responseTime}
                          <span className="text-xs ml-0.5 font-normal">ms</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 - 现代化设计 */}
                  <Button
                    className={`w-full relative overflow-hidden group/btn transition-all duration-300 ${
                      available
                        ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
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
                    {/* 按钮光效 */}
                    {available && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    )}

                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {dict?.gateway?.loading || "Loading..."}
                        </>
                      ) : (
                        <>
                          <span className="font-medium">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {dict?.gateway?.configureGateway || "Configure New Gateway"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {dict?.gateway?.configureDescription ||
                "Select region and country to deploy your private proxy gateway"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Region Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {dict?.gateway?.selectRegion || "Select Region"}
              </label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full">
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
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            {selectedRegion && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {dict?.gateway?.deployment ||
                      "Deployment takes about 5 minutes"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
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
            >
              {dict?.gateway?.cancel || "Cancel"}
            </Button>
            <Button
              onClick={handleConfirmCreate}
              disabled={!selectedRegion}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              {dict?.gateway?.confirmCreate || "Confirm & Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
