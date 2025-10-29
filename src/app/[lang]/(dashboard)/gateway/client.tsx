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
} from "lucide-react";
import { createShortTimeToken } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
}

export default function GatewayClient({
  dict,
  permissions,
  userTokenCount,
  proxyServers,
}: GatewayClientProps) {
  const router = useRouter();
  const [loadingProxyId, setLoadingProxyId] = useState<string | null>(null);
  const [gatewayType, setGatewayType] = useState<string>("public");
  const filteredServers = proxyServers.filter(
    (server) => (server.type || "public") === gatewayType
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

  const isServerAvailable = (server: (typeof proxyServers)[0]) => {
    if (userTokenCount >= permissions.maa) {
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
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
                <TabsTrigger value="public" className="gap-2">
                  <Globe className="w-4 h-4" />
                  {dict?.gateway?.public || "Public"}
                </TabsTrigger>
                <TabsTrigger
                  value="private"
                  disabled={!permissions.adv}
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {dict?.gateway?.private || "Private"}
                  {!permissions.adv && (
                    <Lock className="w-3 h-3 ml-1 opacity-50" />
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServers.map((server) => {
            const available = isServerAvailable(server);
            const isLoading = loadingProxyId === server.id;
            const { region, direction } = parseGatewayLocation(server.id);
            const locationText = formatLocation(region, direction);

            return (
              <Card
                key={server.id}
                className={`transition-all duration-200 hover:shadow-lg ${
                  !available ? "opacity-60" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Hash className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <CardTitle
                        className="text-lg font-semibold truncate direction-rtl"
                        dir="rtl"
                      >
                        <span dir="ltr">{server.id}</span>
                      </CardTitle>
                    </div>
                    <div
                      className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
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
                    {server.url}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getStatusStyle(
                        server.status
                      )}`}
                    >
                      {getStatusText(server.status)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
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

                  {/* Error Info */}
                  {server.error && (
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                      {server.error}
                    </div>
                  )}

                  {/* Get Token Pass */}
                  <Button
                    className="w-full"
                    variant={available ? "default" : "secondary"}
                    disabled={!available || loadingProxyId !== null}
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

        {/* Empty State */}
        {filteredServers.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {gatewayType === "private"
                  ? dict?.gateway?.noPrivateServers ||
                    "No private proxy servers available"
                  : dict?.gateway?.noServers || "No proxy servers available"}
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
