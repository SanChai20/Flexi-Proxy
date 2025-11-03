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
import { Clock, RefreshCw, FileText } from "lucide-react";
import { fetchConsoleLogs } from "@/lib/actions";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const initialFetchDoneMap: Record<string, number> = {};

interface GatewayClientProps {
  dict: any;
  sub: string;
}

interface LogEntry {
  timestamp: number;
  content: string;
  id: string; // timestamp + content 的组合ID，用于去重
}

export default function GatewayPrivateClient({
  dict,
  sub,
}: GatewayClientProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const refreshInterval = 30; // 固定60秒刷新间隔
  const [logs, setLogs] = useState<LogEntry[]>([]); // 所有日志
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const logsMapRef = useRef<Map<string, LogEntry>>(new Map()); // 用于去重的Map

  // 解析单条日志
  const parseLog = (logContent: string): LogEntry | null => {
    // 清除颜色码、空格、回车符
    const normalized = logContent.replace(/\x1B\[[0-9;]*m/g, "").trim();

    // 过滤掉空行
    if (!normalized) return null;

    // 匹配 AWS Cloud Init 日志格式: [时间戳] cloud-init[进程ID]: 日志内容
    // 例如: [   81.653910] cloud-init[1054]: xxxx
    const cloudInitMatch = normalized.match(
      /\[\s*([\d.]+)\]\s+cloud-init\[\d+\]:\s*(.+)/
    );

    // 只保留符合格式的日志
    if (!cloudInitMatch) return null;

    // 提取时间戳和日志内容
    const timestamp = parseFloat(cloudInitMatch[1]);
    const content = cloudInitMatch[2].trim();

    // 过滤掉空内容
    if (!content) return null;

    // 创建唯一ID：时间戳 + 内容哈希
    const id = `${timestamp}-${content}`;

    return {
      timestamp,
      content,
      id,
    };
  };

  // 定时获取日志
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const consoleLogs: undefined | string = await fetchConsoleLogs(sub);

        if (consoleLogs) {
          const rawLogs = consoleLogs.split("\n").filter(Boolean);

          // 解析所有日志
          rawLogs.forEach((logContent) => {
            const parsedLog = parseLog(logContent);
            if (parsedLog) {
              // 使用Map去重，相同ID的日志只保留一份
              logsMapRef.current.set(parsedLog.id, parsedLog);
            }
          });

          // 将Map转换为数组并按时间戳排序
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

    // 立即执行一次（在开发模式下避免 StrictMode 二次挂载导致的重复拉取）
    if (
      typeof window !== "undefined" &&
      initialFetchDoneMap[sub] &&
      Date.now() - initialFetchDoneMap[sub] < 5000
    ) {
      // 最近刚拉取过，跳过本次立即拉取
    } else {
      fetchLogs().finally(() => {
        if (typeof window !== "undefined") {
          initialFetchDoneMap[sub] = Date.now();
        }
      });
    }

    // 设置定时器
    const interval = setInterval(fetchLogs, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [sub, refreshInterval]);

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
  }, [logs]);

  // 清空日志
  const handleClearLogs = () => {
    setLogs([]);
    logsMapRef.current.clear();
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
              <Badge variant="outline">{logs.length} logs</Badge>
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
            <Button variant="outline" size="sm" onClick={handleClearLogs}>
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
              {logs.length === 0 ? (
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
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-3 py-1 px-2 hover:bg-muted/50 rounded group"
                  >
                    <span className="text-muted-foreground shrink-0 w-24">
                      [{log.timestamp.toFixed(6)}]
                    </span>
                    <span className="break-all flex-1">{log.content}</span>
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
