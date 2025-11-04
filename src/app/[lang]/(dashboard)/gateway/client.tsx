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
} from "lucide-react";
import {
  checkProxyServerHealth,
  createPrivateProxyInstance,
  createShortTimeToken,
  deletePrivateProxyInstance,
} from "@/lib/actions";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [allProxyServers, setAllProxyServers] = useState<
    {
      url: string;
      status: string;
      id: string;
      isHealthy: boolean;
      responseTime: number | undefined;
      type: string;
      error?: string | undefined;
    }[]
  >(proxyServers);

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
  >([]);

  useEffect(() => {
    setFilteredServers(
      allProxyServers.filter(
        (server) => (server.type || "public") === gatewayType
      )
    );
  }, [allProxyServers, gatewayType]);

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

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      spare:
        "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
      busy: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
      full: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
      unavailable:
        "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
    };
    if (status === undefined || status.length <= 0) {
      return styles.unavailable;
    }
    return styles[status.toLowerCase()] || styles.unavailable;
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

  const isServerAvailable = (server: (typeof allProxyServers)[0]) => {
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
      const token = await createShortTimeToken(3600);
      router.push(
        `/token/create?token=${encodeURIComponent(
          token
        )}&proxyId=${encodeURIComponent(proxyId)}`
      );
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
      await deletePrivateProxyInstance(proxyId, subdomainName);
      router.replace("/gateway?dft=private");
    } catch (error) {
      console.error(error);
      setOperatingProxyId(null);
    }
  };

  const handleViewPrivateGateway = async (
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
      const token = await createShortTimeToken(3600);
      router.push(
        `/gateway/private?sub=${encodeURIComponent(
          subdomainName
        )}&token=${encodeURIComponent(token)}`
      );
    } catch (error) {
      console.error(error);
      setOperatingProxyId(null);
    }
  };

  const handleCheckPrivateGateway = async (proxy: {
    url: string;
    status: string;
    id: string;
    type: string;
  }) => {
    try {
      setOperatingProxyId(proxy.id);
      const result = await checkProxyServerHealth(proxy);
      setAllProxyServers((prev) => {
        return prev.map((item) =>
          item.id === result.id ? { ...item, ...result } : item
        );
      });
    } catch (error) {
      console.error(error);
    } finally {
      setOperatingProxyId(null);
    }
  };

  const handleCreatePrivateGateway = async () => {
    try {
      setPrivateCreating(true);
      if (
        !permissions.adv ||
        permissions.mppa <=
          allProxyServers.filter((proxy) => proxy.type === "private").length
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
      router.replace("/gateway?dft=private");
    } catch (error) {
      console.error(error);
      setPrivateCreating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {dict?.gateway?.title || "Proxy Gateways"}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {dict?.gateway?.subtitle ||
                  "List all available proxy gateways and their features"}
              </CardDescription>
            </div>

            <Tabs
              value={gatewayType}
              onValueChange={(value) =>
                setGatewayType(value as "public" | "private")
              }
              className="flex-shrink-0"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="public" className="gap-1">
                  <Globe className="w-3 h-3" />
                  <span className="text-xs">
                    {dict?.gateway?.public || "Public"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="private" className="gap-1">
                  <Lock className="w-3 h-3" />
                  <span className="text-xs">
                    {dict?.gateway?.private || "Private"}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Card for Private Gateway - Always visible when in private mode */}
          {gatewayType === "private" && (
            <Card
              className={`transition-all duration-200 hover:shadow-lg border-dashed border-2 ${
                !privateCreating &&
                permissions.adv &&
                permissions.mppa >
                  allProxyServers.filter((proxy) => proxy.type === "private")
                    .length
                  ? "cursor-pointer hover:border-primary hover:bg-accent/50"
                  : "opacity-60 cursor-not-allowed"
              }`}
              onClick={() => {
                if (
                  !privateCreating &&
                  permissions.adv &&
                  permissions.mppa >
                    allProxyServers.filter((proxy) => proxy.type === "private")
                      .length
                ) {
                  handleCreatePrivateGateway();
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
                          allProxyServers.filter(
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

              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center py-4 gap-3">
                  {privateCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        {dict?.gateway?.creating || "Creating gateway..."}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Plus className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium">
                          {permissions.adv
                            ? dict?.gateway?.clickToCreate || "Click to create"
                            : dict?.gateway?.notAvailable || "Not Available"}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3" />
                          <span>
                            {dict?.gateway?.instantDeploy ||
                              "Instant deployment"}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredServers.map((server) => {
            const available = isServerAvailable(server);
            const isLoading = loadingProxyId === server.id;
            const { region, direction } = parseGatewayLocation(server.id);
            const locationText = formatLocation(region, direction);

            return (
              <Card
                key={server.id}
                className="transition-all duration-200 hover:shadow-lg flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Hash className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <CardTitle
                        className="text-lg font-semibold truncate direction-rtl"
                        dir="rtl"
                      >
                        <span dir="ltr">{server.id}</span>
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getStatusStyle(
                          server.status
                        )}`}
                      >
                        {getStatusText(server.status)}
                      </span>

                      <div
                        className={`w-3 h-3 rounded-full ${
                          server.isHealthy
                            ? "bg-green-500 animate-pulse"
                            : "bg-gray-400"
                        }`}
                        title={
                          server.isHealthy
                            ? dict?.gateway?.healthy || "Healthy"
                            : dict?.gateway?.unhealthy || "Unhealthy"
                        }
                      />

                      {gatewayType === "private" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            {operatingProxyId === server.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Settings className="w-4 h-4 text-muted-foreground" />
                            )}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleViewPrivateGateway(server.id, server.url)
                              }
                              disabled={operatingProxyId === server.id}
                              className="cursor-pointer"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              {dict?.gateway?.viewLogs || "View Startup Logs"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCheckPrivateGateway(server)}
                              disabled={operatingProxyId === server.id}
                              className="cursor-pointer"
                            >
                              <Activity className="w-4 h-4 mr-2" />
                              {dict?.gateway?.healthCheck || "Health Check"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={operatingProxyId === server.id}
                              onClick={() =>
                                handleDeletePrivateGateway(
                                  server.id,
                                  server.url
                                )
                              }
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {dict?.gateway?.deleteProxy ||
                                "Delete Proxy Server"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* Location Info */}
                  {region && direction && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{locationText}</span>
                    </div>
                  )}

                  {/* URL as secondary info */}
                  <div className="text-xs text-muted-foreground break-all mt-1">
                    {server.url.startsWith("https://")
                      ? server.url
                      : `https://${server.url}`}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                  {/* Health Check & Response Time */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="w-4 h-4" />
                      <span>
                        {server.isHealthy
                          ? dict?.gateway?.healthy || "Healthy"
                          : dict?.gateway?.unhealthy || "Unhealthy"}
                      </span>
                    </div>
                    {typeof server.responseTime === "number" && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span
                          className={`font-medium ${
                            server.responseTime < 100
                              ? "text-green-600 dark:text-green-400"
                              : server.responseTime < 300
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {server.responseTime}ms
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Get Token Pass */}
                  <Button
                    className="w-full"
                    variant={available ? "default" : "secondary"}
                    disabled={
                      !available ||
                      loadingProxyId !== null ||
                      operatingProxyId === server.id
                    }
                    onClick={() => handleGetToken(server.id)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {dict?.gateway?.loading || "Loading..."}
                      </>
                    ) : (
                      dict?.gateway?.getToken || "Get Token Pass"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State - Only for public gateways */}
        {filteredServers.length === 0 && gatewayType === "public" && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-4">
                {dict?.gateway?.noServers || "No proxy servers available"}
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
