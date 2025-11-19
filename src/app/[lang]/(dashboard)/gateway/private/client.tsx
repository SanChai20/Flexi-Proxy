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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const logsMapRef = useRef<Map<string, LogEntry>>(new Map());
  const hasInitialFetchRef = useRef(false);

  // Parse deployment log format: [TIMESTAMP] [LEVEL] [COMPONENT] MESSAGE
  // Only return logs that match this exact format
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

    return {
      timestamp,
      content,
      id: `${timestamp}-${content.substring(0, 50)}`,
      level: deploymentMatch[2].trim(),
      component: deploymentMatch[3].trim(),
      message: deploymentMatch[4].trim(),
    };
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

    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [sub]);

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {dict?.gateway?.startLogs || "Deployment logs"}
                <Badge variant="secondary" className="text-xs font-normal">
                  {dict?.gateway?.autoRefresh || "Auto-refresh: 30s"}
                </Badge>
                {logs.length > 0 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {logs.length} logs
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">{sub}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea
            className="h-[calc(100vh-250px)] w-full"
            ref={scrollAreaRef}
          >
            <div className="p-4 space-y-1 font-mono text-sm">
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
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-2 py-1.5 px-2 rounded hover:bg-accent/50 group transition-colors"
                  >
                    <Badge
                      variant={getLogLevelBadgeVariant(log.level)}
                      className="h-6 shrink-0"
                    >
                      {log.level}
                    </Badge>
                    <span className="text-muted-foreground shrink-0 min-w-[120px]">
                      [{log.component}]
                    </span>
                    <span className="break-all flex-1">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
