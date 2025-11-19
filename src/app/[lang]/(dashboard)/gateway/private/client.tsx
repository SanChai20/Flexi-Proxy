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
import { RefreshCw, Download, Filter } from "lucide-react";
import { fetchConsoleLogs } from "@/lib/actions";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GatewayClientProps {
  dict: any;
  sub: string;
}

interface LogEntry {
  timestamp: number;
  content: string;
  id: string;
  level: string;
  component: string;
  message: string;
  step?: number;
  totalSteps?: number;
}

type LogLevel = "INFO" | "SUCCESS" | "ERROR" | "WARNING" | "DEBUG" | "PROGRESS";

export default function GatewayPrivateClient({
  dict,
  sub,
}: GatewayClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [levelFilters, setLevelFilters] = useState<Set<LogLevel>>(new Set());
  const [deploymentProgress, setDeploymentProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const logsMapRef = useRef<Map<string, LogEntry>>(new Map());
  const hasInitialFetchRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse deployment log format: [TIMESTAMP] [LEVEL] [COMPONENT] MESSAGE
  // Extract step information if present: Step ${step}/${total}
  const parseLog = (logContent: string): LogEntry | null => {
    const normalized = logContent.replace(/\x1B\[[0-9;]*m/g, "").trim();

    if (!normalized) return null;

    // First extract from cloud-init format
    const cloudInitMatch = normalized.match(
      /\[\s*([\d.]+)\]\s+cloud-init\[\d+\]:\s*(.+)/
    );

    if (!cloudInitMatch) return null;

    const timestamp = parseFloat(cloudInitMatch[1]);
    const content = cloudInitMatch[2].trim();
    if (!content) return null;

    // Now check if it matches deployment log format: [TIMESTAMP] [LEVEL] [COMPONENT] MESSAGE
    const deploymentLogPattern =
      /\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+(.+)/;
    const deploymentMatch = content.match(deploymentLogPattern);

    // Only return if it matches deployment log format
    if (!deploymentMatch) return null;

    const message = deploymentMatch[4].trim();

    // Extract step information if present: Step ${step}/${total}
    const stepMatch = message.match(/Step (\d+)\/(\d+)/);
    let step: number | undefined;
    let totalSteps: number | undefined;

    if (stepMatch) {
      step = parseInt(stepMatch[1], 10);
      totalSteps = parseInt(stepMatch[2], 10);
    }

    return {
      timestamp,
      content,
      id: `${timestamp}-${content.substring(0, 50)}`,
      level: deploymentMatch[2].trim(),
      component: deploymentMatch[3].trim(),
      message,
      step,
      totalSteps,
    };
  };

  // Calculate deployment progress from logs
  const calculateProgress = (logEntries: LogEntry[]) => {
    let maxStep = 0;
    let totalSteps = 0;

    logEntries.forEach((log) => {
      if (log.step !== undefined && log.totalSteps !== undefined) {
        maxStep = Math.max(maxStep, log.step);
        totalSteps = log.totalSteps;
      }
    });

    if (totalSteps > 0) {
      const percentage = Math.round((maxStep / totalSteps) * 100);
      setDeploymentProgress({
        current: maxStep,
        total: totalSteps,
        percentage,
      });

      // Stop auto-refresh when progress reaches 100%
      if (percentage >= 100 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const consoleLogs: undefined | string = await fetchConsoleLogs(sub);
        if (consoleLogs) {
          const rawLogs = consoleLogs.split("\n").filter(Boolean);
          rawLogs.forEach((logContent) => {
            const parsedLog = parseLog(logContent);
            // Only add logs that match the deployment format
            if (parsedLog) {
              logsMapRef.current.set(parsedLog.id, parsedLog);
            }
          });
          const sortedLogs = Array.from(logsMapRef.current.values()).sort(
            (a, b) => a.timestamp - b.timestamp
          );
          setLogs(sortedLogs);
          calculateProgress(sortedLogs);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      fetchLogs();
    }

    // Only set up interval if progress is not 100%
    if (
      !intervalRef.current &&
      (!deploymentProgress || deploymentProgress.percentage < 100)
    ) {
      intervalRef.current = setInterval(fetchLogs, 15000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sub, deploymentProgress]);

  // Apply level filters
  useEffect(() => {
    let result = logs;

    // Filter by log levels
    if (levelFilters.size > 0) {
      result = result.filter((log) => levelFilters.has(log.level as LogLevel));
    }

    setFilteredLogs(result);
  }, [logs, levelFilters]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [filteredLogs]);

  const handleExportLogs = () => {
    if (filteredLogs.length === 0) {
      return;
    }

    const logText = filteredLogs.map((log) => log.content).join("\n");
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `instance-logs-${sub}-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleLevelFilter = (level: LogLevel) => {
    const newFilters = new Set(levelFilters);
    if (newFilters.has(level)) {
      newFilters.delete(level);
    } else {
      newFilters.add(level);
    }
    setLevelFilters(newFilters);
  };

  const getLogLevelColor = (level: string): string => {
    switch (level) {
      case "SUCCESS":
        return "text-green-600 dark:text-green-400";
      case "ERROR":
        return "text-red-600 dark:text-red-400";
      case "WARNING":
        return "text-yellow-600 dark:text-yellow-400";
      case "INFO":
        return "text-blue-600 dark:text-blue-400";
      case "DEBUG":
        return "text-gray-600 dark:text-gray-400";
      case "PROGRESS":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-foreground";
    }
  };

  const getLogLevelBadgeVariant = (
    level: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case "SUCCESS":
        return "default";
      case "ERROR":
        return "destructive";
      case "WARNING":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  {dict?.gateway?.startLogs || "Deployment logs"}
                  {
                    <Badge variant="secondary" className="text-xs font-normal">
                      {dict?.gateway?.autoRefresh || "Auto-refresh: 15s"}
                    </Badge>
                  }
                  {deploymentProgress &&
                    deploymentProgress.percentage >= 100 && (
                      <Badge
                        variant="default"
                        className="text-xs font-normal bg-green-600"
                      >
                        Completed
                      </Badge>
                    )}
                  {logs.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {logs.length} logs
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">{sub}</CardDescription>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {dict?.gateway?.filter || "Filter"}
                      {levelFilters.size > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {levelFilters.size}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Log Levels</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(
                      [
                        "INFO",
                        "SUCCESS",
                        "ERROR",
                        "WARNING",
                        "DEBUG",
                        "PROGRESS",
                      ] as LogLevel[]
                    ).map((level) => (
                      <DropdownMenuCheckboxItem
                        key={level}
                        checked={levelFilters.has(level)}
                        onCheckedChange={() => toggleLevelFilter(level)}
                      >
                        <span className={getLogLevelColor(level)}>{level}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportLogs}
                  disabled={filteredLogs.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {dict?.gateway?.export || "Export"}
                </Button>
                {isLoading && (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Custom Progress Bar - Full Width Below Buttons */}
            {deploymentProgress && (
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Step {deploymentProgress.current} /{" "}
                    {deploymentProgress.total}
                  </span>
                  <span className="font-medium">
                    {deploymentProgress.percentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${deploymentProgress.percentage}%` }}
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
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      {dict?.gateway?.loadingLogs || "Loading logs..."}
                    </>
                  ) : (
                    <>
                      {logs.length === 0
                        ? dict?.gateway?.logsUnavailable ||
                          "No deployment logs available"
                        : "No logs match the current filters"}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="grid grid-cols-[100px_140px_1fr] gap-3 py-1.5 px-2 rounded hover:bg-accent/50 transition-colors items-start"
                    >
                      <div className="flex items-center">
                        <Badge
                          variant={getLogLevelBadgeVariant(log.level)}
                          className="h-6 w-full justify-center"
                        >
                          {log.level}
                        </Badge>
                      </div>
                      <div
                        className="text-muted-foreground truncate"
                        title={log.component}
                      >
                        [{log.component}]
                      </div>
                      <div className="break-words">{log.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
