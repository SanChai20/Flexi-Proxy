"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { fetchDeploymentProgress } from "@/lib/actions";
import { useState, useEffect, useRef } from "react";

interface GatewayClientProps {
  dict: any;
  sub: string;
}

export default function GatewayPrivateClient({
  dict,
  sub,
}: GatewayClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<{
    stp: number;
    tot: number;
    sts: string;
    msg: string[];
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasInitialFetchRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!deploymentStatus || deploymentStatus.tot === 0) return 0;
    return Math.round((deploymentStatus.stp / deploymentStatus.tot) * 100);
  };

  // Fetch deployment progress
  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const status = await fetchDeploymentProgress(sub);
      if (status) {
        setDeploymentStatus(status);

        // Stop auto-refresh when deployment is complete (success or error)
        if (
          (status.sts === "success" || status.sts === "error") &&
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

    // Only set up interval if deployment is still running
    if (
      !intervalRef.current &&
      (!deploymentStatus || deploymentStatus.sts === "running")
    ) {
      intervalRef.current = setInterval(fetchProgress, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sub, deploymentStatus?.sts]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollAreaRef.current && deploymentStatus?.msg) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [deploymentStatus?.msg]);

  // Export logs
  const handleExportLogs = () => {
    if (!deploymentStatus?.msg || deploymentStatus.msg.length === 0) {
      return;
    }

    const logText = deploymentStatus.msg.join("\n");
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `deployment-logs-${sub}-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get status badge configuration
  const getStatusBadge = () => {
    if (!deploymentStatus) return null;

    switch (deploymentStatus.sts) {
      case "success":
        return {
          variant: "default" as const,
          className: "bg-green-600 hover:bg-green-700",
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
          text: dict?.gateway?.completed || "Completed",
        };
      case "error":
        return {
          variant: "destructive" as const,
          className: "",
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: dict?.gateway?.failed || "Failed",
        };
      case "running":
        return {
          variant: "secondary" as const,
          className: "",
          icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
          text: dict?.gateway?.running || "Running",
        };
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge();
  const progressPercentage = getProgressPercentage();

  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                {dict?.gateway?.deploymentLogs || "Deployment Logs"}

                {deploymentStatus?.sts === "running" && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {dict?.gateway?.autoRefresh || "Auto-refresh: 5s"}
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

                {deploymentStatus?.msg && deploymentStatus.msg.length > 0 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {deploymentStatus.msg.length}{" "}
                    {dict?.gateway?.logs || "logs"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">{sub}</CardDescription>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLogs}
                disabled={
                  !deploymentStatus?.msg || deploymentStatus.msg.length === 0
                }
              >
                <Download className="h-4 w-4 mr-2" />
                {dict?.gateway?.export || "Export"}
              </Button>

              {isLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {deploymentStatus && (
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {dict?.gateway?.step || "Step"} {deploymentStatus.stp} /{" "}
                  {deploymentStatus.tot}
                </span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    deploymentStatus.sts === "error"
                      ? "bg-red-600"
                      : deploymentStatus.sts === "success"
                      ? "bg-green-600"
                      : "bg-primary"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea
          className="h-[calc(100vh-300px)] w-full"
          ref={scrollAreaRef}
        >
          <div className="p-4 font-mono text-sm">
            {!deploymentStatus ||
            !deploymentStatus.msg ||
            deploymentStatus.msg.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    {dict?.gateway?.loadingLogs || "Loading logs..."}
                  </>
                ) : (
                  dict?.gateway?.noLogs || "No deployment logs available"
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {deploymentStatus.msg.map((logMessage, index) => (
                  <div
                    key={index}
                    className="py-1.5 px-3 rounded hover:bg-accent/50 transition-colors break-words"
                  >
                    <span className="text-muted-foreground mr-2">
                      [{index + 1}]
                    </span>
                    {logMessage}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
