"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Zap, Gift, Hash } from "lucide-react";
import { createShortTimeToken } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface GatewayClientProps {
  dict: any;
  permissions: any;
  userTokenCount: number;
  proxyServers: {
    url: string;
    status: string;
    id: string;
    adv: boolean;
    isHealthy: boolean;
    responseTime: number;
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
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      spare:
        "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
      busy: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
      full: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
      unavailable:
        "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
    };
    return styles[status.toLowerCase()] || styles.unavailable;
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      spare: dict?.token?.spare || "Spare",
      busy: dict?.token?.busy || "Busy",
      full: dict?.token?.full || "Full",
      unavailable: dict?.token?.unavailable || "Unavailable",
    };
    return texts[status.toLowerCase()] || status;
  };

  const isServerAvailable = (server: (typeof proxyServers)[0]) => {
    if ((!permissions.adv && server.adv) || userTokenCount >= permissions.maa) {
      return false;
    }
    return server.isHealthy && server.status.toLowerCase() !== "unavailable";
  };

  const handleGetToken = async (proxyId: string) => {
    try {
      const token = await createShortTimeToken(3600);
      router.push(
        `/token/create?token=${encodeURIComponent(
          token
        )}&proxyId=${encodeURIComponent(proxyId)}`
      );
    } catch (error) {
      console.error("Failed to create token:", error);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">
            {dict?.gateway?.title || "Proxy Gateways"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.gateway?.subtitle ||
              "List all available proxy gateways and their features"}
          </CardDescription>
        </CardHeader>
      </Card> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {proxyServers.map((server) => {
          const available = isServerAvailable(server);

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

                  {/* Premium/Free Badge */}
                  {server.adv ? (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700">
                      <Zap className="w-3 h-3 mr-1" />
                      {dict?.gateway?.premium || "Premium"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700">
                      <Gift className="w-3 h-3 mr-1" />
                      {dict?.gateway?.free || "Free"}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Health Check & Status Badge */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="w-4 h-4" />
                    <span>
                      {server.isHealthy
                        ? dict?.gateway?.healthy || "Healthy"
                        : dict?.gateway?.unhealthy || "Unhealthy"}
                    </span>
                  </div>
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
                  disabled={!available}
                  onClick={() => handleGetToken(server.id)}
                >
                  {dict?.gateway?.getToken || "Get Token Pass"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 空状态 */}
      {proxyServers.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              {dict?.gateway?.noServers || "No proxy servers available"}
            </p>
          </div>
        </Card>
      )}
    </section>
  );
}
