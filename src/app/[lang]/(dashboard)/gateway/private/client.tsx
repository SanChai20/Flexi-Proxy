// app/[lang]/gateway/private/client.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Clock,
  RefreshCw,
  FileText,
  ChevronDown,
  Download,
  Pause,
  Play,
} from "lucide-react";
import { getLogEvents } from "@/lib/actions";
import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogStream, FilteredLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import { cn } from "@/lib/utils";

interface GatewayClientProps {
  dict: any;
  sub: string;
  logStream: LogStream[] | undefined;
}

export default function GatewayPrivateClient({
  dict,
  sub,
  logStream,
}: GatewayClientProps) {
  const [selectedStream, setSelectedStream] = useState<string | undefined>(
    logStream?.[0]?.logStreamName
  );
  const [logs, setLogs] = useState<FilteredLogEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10); // 秒
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // 获取日志的函数
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const events = await getLogEvents(sub, selectedStream, undefined, 200);
      setLogs(events);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sub, selectedStream]);

  // 初始加载
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchLogs]);

  // 切换日志流时重新获取
  useEffect(() => {
    if (selectedStream) {
      fetchLogs();
    }
  }, [selectedStream, fetchLogs]);

  // 导出日志
  const exportLogs = () => {
    const text = logs
      .map((log) => {
        const timestamp = new Date(log.timestamp!).toISOString();
        return `[${timestamp}] ${log.message}`;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${sub}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // 格式化完整日期时间
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN");
  };

  // 日志级别检测和样式
  const getLogStyle = (message: string) => {
    if (message.includes("ERROR") || message.includes("FATAL")) {
      return "text-red-500";
    }
    if (message.includes("WARN")) {
      return "text-yellow-500";
    }
    if (message.includes("INFO")) {
      return "text-blue-500";
    }
    if (message.includes("DEBUG")) {
      return "text-gray-500";
    }
    return "text-foreground";
  };

  return (
    <div className="space-y-4">
      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Instance Logs
              </CardTitle>
              <CardDescription className="mt-1">
                Instance ID: {sub}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {lastRefreshTime.toLocaleTimeString("zh-CN")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {/* 日志流选择 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Activity className="h-4 w-4" />
                  {selectedStream || "Select Log Stream"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[300px]">
                <DropdownMenuItem onClick={() => setSelectedStream(undefined)}>
                  All Streams
                </DropdownMenuItem>
                {logStream?.map((stream) => (
                  <DropdownMenuItem
                    key={stream.logStreamName}
                    onClick={() => setSelectedStream(stream.logStreamName)}
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-xs">
                        {stream.logStreamName}
                      </span>
                      {stream.lastEventTimestamp && (
                        <span className="text-xs text-muted-foreground">
                          Last: {formatDateTime(stream.lastEventTimestamp)}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 刷新间隔选择 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Clock className="h-4 w-4" />
                  {refreshInterval}s
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[5, 10, 30, 60].map((interval) => (
                  <DropdownMenuItem
                    key={interval}
                    onClick={() => setRefreshInterval(interval)}
                  >
                    {interval} seconds
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 自动刷新开关 */}
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2"
            >
              {autoRefresh ? (
                <>
                  <Pause className="h-4 w-4" />
                  Auto Refresh ON
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Auto Refresh OFF
                </>
              )}
            </Button>

            {/* 手动刷新 */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
              Refresh
            </Button>

            {/* 导出日志 */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={logs.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Badge variant="secondary">{logs.length} events</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 日志显示区域 */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full">
            <div className="p-4 space-y-1 font-mono text-sm">
              {isLoading && logs.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Loading logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  No logs available
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={`${log.eventId}-${index}`}
                    className="flex gap-3 py-1 px-2 hover:bg-muted/50 rounded group"
                  >
                    <span className="text-muted-foreground shrink-0 w-20">
                      {formatTime(log.timestamp!)}
                    </span>
                    <span
                      className={cn("break-all", getLogStyle(log.message!))}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
