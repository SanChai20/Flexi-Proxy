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
import { fetchConsoleLogs, fetchDeploymentProgress } from "@/lib/actions";
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
    currentStep: number;
    totalStep: number;
    deploymentStatus: string;
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasInitialFetchRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!deploymentStatus || deploymentStatus.totalStep === 0) return 0;
    return Math.round(
      (deploymentStatus.currentStep / deploymentStatus.totalStep) * 100
    );
  };

  // Fetch deployment progress
  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      // const aaa = await fetchConsoleLogs(sub);
      // console.log(aaa);
      const status: null | {
        currentStep: number;
        totalStep: number;
        deploymentStatus: string;
      } = await fetchDeploymentProgress(sub);
      if (status) {
        setDeploymentStatus(status);

        // Stop auto-refresh when deployment is complete (success or error)
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

    // Only set up interval if deployment is still running
    if (
      !intervalRef.current &&
      (!deploymentStatus || deploymentStatus.deploymentStatus === "running")
    ) {
      intervalRef.current = setInterval(fetchProgress, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sub, deploymentStatus?.deploymentStatus]);

  // Get status badge configuration
  const getStatusBadge = () => {
    if (!deploymentStatus) return null;

    switch (deploymentStatus.deploymentStatus) {
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

                {deploymentStatus?.deploymentStatus === "running" && (
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
              </CardTitle>
              <CardDescription className="mt-1">{sub}</CardDescription>
            </div>
          </div>

          {/* Progress Bar */}
          {deploymentStatus && (
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {dict?.gateway?.step || "Step"} {deploymentStatus.currentStep}{" "}
                  / {deploymentStatus.totalStep}
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
                      : "bg-primary"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
