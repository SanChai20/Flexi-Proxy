"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, RefreshCw, FileText } from "lucide-react";
import { fetchConsoleLogs } from "@/lib/actions";
import { useState, useEffect, useRef } from "react";

interface GatewayClientProps {
  dict: any;
  sub: string;
}

interface LogEntry {
  timestamp: number;
  content: string;
  id: string;
}

export default function GatewayPrivateClient({
  dict,
  sub,
}: GatewayClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const refreshInterval = 30;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const logsMapRef = useRef<Map<string, LogEntry>>(new Map());
  const hasInitialFetchRef = useRef(false);

  const parseLog = (logContent: string): LogEntry | null => {
    const normalized = logContent.replace(/\x1B\[[0-9;]*m/g, "").trim();

    if (!normalized) return null;

    const cloudInitMatch = normalized.match(
      /\[\s*([\d.]+)\]\s+cloud-init\[\d+\]:\s*(.+)/
    );

    if (!cloudInitMatch) return null;

    const timestamp = parseFloat(cloudInitMatch[1]);
    const content = cloudInitMatch[2].trim();
    if (!content) return null;

    return {
      timestamp,
      content,
      id: timestamp.toString(),
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

    const interval = setInterval(fetchLogs, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [sub, refreshInterval]);

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Instance Logs
              </CardTitle>
              <CardDescription className="mt-1">{sub}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              Auto-refresh: {refreshInterval}s
            </Badge>
          </div>
        </CardContent>
      </Card>

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
