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
import { getConsoleLogs } from "@/lib/actions";

import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogStream, FilteredLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
interface GatewayClientProps {
  dict: any;
  sub: string;
  logs: string | undefined;
}

export default function GatewayPrivateClient({
  dict,
  sub,
  logs,
}: GatewayClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10); // 秒

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      router.refresh();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

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
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
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

            {/* <Badge variant="secondary">{logs.length} events</Badge> */}
          </div>
        </CardContent>
      </Card>

      {/* 日志显示区域 */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full">
            <div className="p-4 space-y-1 font-mono text-sm">
              {isLoading && logs === undefined ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Loading logs...
                </div>
              ) : logs === undefined ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  No logs available
                </div>
              ) : (
                <div className="flex gap-3 py-1 px-2 hover:bg-muted/50 rounded group">
                  <span className={cn("break-all", getLogStyle(logs))}>
                    {logs}
                  </span>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
