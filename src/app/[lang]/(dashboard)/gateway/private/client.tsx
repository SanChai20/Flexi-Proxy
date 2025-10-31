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
import { fetchConsoleLogs } from "@/lib/actions";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface GatewayClientProps {
  dict: any;
  sub: string;
}

interface LogEntry {
  id: string;
  content: string;
  fetchTimestamp: Date;
}

export default function GatewayPrivateClient({
  dict,
  sub,
}: GatewayClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const refreshInterval = 60; // 固定60秒刷新间隔
  const [displayedLogs, setDisplayedLogs] = useState<LogEntry[]>([]); // 已显示的日志
  const [logQueue, setLogQueue] = useState<LogEntry[]>([]); // 待显示的日志队列
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const logCounterRef = useRef<number>(0); // 用于生成唯一ID的计数器
  const logSetRef = useRef<Set<string>>(new Set()); // 用于去重的Set（使用ref避免依赖问题）

  // 定时获取日志
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const result:
          | undefined
          | { logs: string; timestamp: Date | undefined } =
          await fetchConsoleLogs(sub);

        if (result && result.logs) {
          const fetchTimestamp = result.timestamp || new Date();
          const rawLogs = result.logs.split("\n").filter(Boolean);

          // 处理新日志
          const newLogEntries: LogEntry[] = [];

          rawLogs.forEach((logContent) => {
            // 清除颜色码、空格、回车符
            const normalized = logContent.replace(/\x1B\[[0-9;]*m/g, "").trim();

            // 过滤掉空行
            if (!normalized) return;

            // 去重
            if (!logSetRef.current.has(normalized)) {
              logSetRef.current.add(normalized);

              newLogEntries.push({
                id: crypto.randomUUID(),
                content: normalized,
                fetchTimestamp,
              });
            }
          });

          // 如果有新日志，添加到队列
          if (newLogEntries.length > 0) {
            setLogQueue((prevQueue) => [...prevQueue, ...newLogEntries]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // 立即执行一次
    fetchLogs();

    // 设置定时器
    const interval = setInterval(fetchLogs, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [sub, refreshInterval]);

  // 逐条显示日志（从队列中dequeue）
  useEffect(() => {
    if (logQueue.length === 0) return;

    // 动态计算显示间隔，确保在刷新间隔内显示完所有日志
    // 预留5秒缓冲时间，用55秒来显示所有日志
    const availableTime = (refreshInterval - 5) * 1000; // 转换为毫秒
    const calculatedInterval = Math.max(
      50, // 最小间隔50ms，避免显示太快
      Math.min(
        500, // 最大间隔500ms，避免显示太慢
        availableTime / logQueue.length
      )
    );

    const displayInterval = setInterval(() => {
      setLogQueue((prevQueue) => {
        if (prevQueue.length === 0) {
          return prevQueue;
        }

        // 从队列头部取出一条日志
        const [nextLog, ...remainingQueue] = prevQueue;

        // 将其添加到已显示列表
        setDisplayedLogs((prevDisplayed) => [...prevDisplayed, nextLog]);

        return remainingQueue;
      });
    }, calculatedInterval);

    return () => clearInterval(displayInterval);
  }, [logQueue, refreshInterval]); // 依赖整个队列和刷新间隔

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [displayedLogs]);

  // 格式化时间
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // 格式化完整日期时间
  const formatDateTime = (timestamp: Date) => {
    return timestamp.toLocaleString("zh-CN");
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

  // 获取日志级别badge
  const getLogLevel = (message: string) => {
    if (message.includes("ERROR") || message.includes("FATAL")) return "ERROR";
    if (message.includes("WARN")) return "WARN";
    if (message.includes("INFO")) return "INFO";
    if (message.includes("DEBUG")) return "DEBUG";
    return null;
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
              {isLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Badge variant="outline">
                {displayedLogs.length} logs
                {logQueue.length > 0 && ` (+${logQueue.length} pending)`}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {/* 刷新间隔显示（固定60秒） */}
            <Badge variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              Auto-refresh: {refreshInterval}s
            </Badge>

            {/* 清空日志按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDisplayedLogs([]);
                setLogQueue([]);
                logSetRef.current = new Set();
              }}
            >
              Clear Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 日志显示区域 */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-1 font-mono text-sm">
              {displayedLogs.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Loading logs...
                    </>
                  ) : (
                    "No logs available"
                  )}
                </div>
              ) : (
                displayedLogs.map((log, index) => {
                  const logStyle = getLogStyle(log.content);
                  const logLevel = getLogLevel(log.content);

                  return (
                    <div
                      key={log.id}
                      className="flex gap-3 py-1 px-2 hover:bg-muted/50 rounded group animate-fade-in"
                    >
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        [{formatTime(log.fetchTimestamp)}]
                      </span>
                      {logLevel && (
                        <Badge
                          variant={
                            logLevel === "ERROR"
                              ? "destructive"
                              : logLevel === "WARN"
                              ? "outline"
                              : "secondary"
                          }
                          className="h-5 text-xs"
                        >
                          {logLevel}
                        </Badge>
                      )}
                      <span className={cn("break-all flex-1", logStyle)}>
                        {log.content}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
