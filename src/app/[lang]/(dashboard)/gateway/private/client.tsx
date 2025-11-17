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
import { RefreshCw, Download } from "lucide-react";
import { fetchConsoleLogs } from "@/lib/actions";
import { useState, useEffect, useRef } from "react";

interface GatewayClientProps {
  dict: any;
  sub: string;
}

type LogLevel = "INFO" | "SUCCESS" | "ERROR" | "WARNING" | "DEBUG" | "PROGRESS";

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  component: string;
  content: string;
  id: string;
}

const getLevelColor = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    INFO: "text-blue-600 dark:text-blue-400",
    SUCCESS: "text-green-600 dark:text-green-400",
    ERROR: "text-red-600 dark:text-red-400",
    WARNING: "text-yellow-600 dark:text-yellow-500",
    DEBUG: "text-gray-600 dark:text-gray-400",
    PROGRESS: "text-purple-600 dark:text-purple-400",
  };
  return colors[level] || "text-gray-600";
};

const getLevelBadgeVariant = (
  level: LogLevel
): "default" | "destructive" | "outline" | "secondary" => {
  if (level === "ERROR") return "destructive";
  if (level === "SUCCESS") return "default";
  if (level === "WARNING") return "outline";
  return "secondary";
};

export default function GatewayPrivateClient({
  dict,
  sub,
}: GatewayClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const logsMapRef = useRef<Map<string, LogEntry>>(new Map());
  const hasInitialFetchRef = useRef(false);

  const parseLog = (logContent: string): LogEntry | null => {
    // 移除 ANSI 转义字符并清理空白
    const normalized = logContent.replace(/\x1B\[[0-9;]*m/g, "").trim();

    if (!normalized) return null;

    // 匹配新格式: [YYYY-MM-DD HH:MM:SS] [LEVEL] [COMPONENT] MESSAGE
    const logMatch = normalized.match(
      /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s+\[(INFO|SUCCESS|ERROR|WARNING|DEBUG|PROGRESS)\]\s+\[([A-Z_]+)\]\s+(.+)$/
    );

    if (!logMatch) return null;

    const [, timestamp, level, component, message] = logMatch;

    if (!message.trim()) return null;

    const timestampMs = new Date(timestamp).getTime();

    return {
      timestamp: timestampMs,
      level: level as LogLevel,
      component,
      content: message.trim(),
      id: `${timestampMs}-${component}-${level}`,
    };
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs]);

  const handleExportLogs = () => {
    if (logs.length === 0) {
      return;
    }

    const logText = logs
      .map((log) => {
        const date = new Date(log.timestamp)
          .toISOString()
          .replace("T", " ")
          .slice(0, 19);
        return `[${date}] [${log.level}] [${log.component}] ${log.content}`;
      })
      .join("\n");

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {dict?.gateway?.startLogs || "Startup logs"}
                <Badge variant="secondary" className="text-xs font-normal">
                  {dict?.gateway?.autoRefresh || "Auto-refresh: 30s"}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">{sub}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLogs}
                disabled={logs.length === 0}
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
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      {dict?.gateway?.loadingLogs || "Loading logs..."}
                    </>
                  ) : (
                    <>{dict?.gateway?.logsUnavailable || "No logs available"}</>
                  )}
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-3 py-1 px-2 rounded hover:bg-muted/50 group"
                  >
                    <span className="text-muted-foreground shrink-0 select-none">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <Badge
                      variant={getLevelBadgeVariant(log.level)}
                      className="shrink-0 h-5 text-[10px] font-semibold"
                    >
                      {log.level}
                    </Badge>
                    <span className="text-muted-foreground/70 shrink-0 font-semibold text-xs">
                      [{log.component}]
                    </span>
                    <span
                      className={`break-all flex-1 ${getLevelColor(log.level)}`}
                    >
                      {log.content}
                    </span>
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
