"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Play, Pause, Download, RefreshCw, X } from "lucide-react";
import { getConsoleLogs } from "@/lib/actions";

interface EC2LogViewerProps {
  dict: any;
  subdomain: string;
  className?: string;
}

export const EC2LogViewer: React.FC<EC2LogViewerProps> = ({
  dict,
  subdomain,
  className = "",
}) => {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<
    "all" | "error" | "warning" | "success"
  >("all");
  const logContainerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const logs = await getConsoleLogs(subdomain);
      setLogs(logs || "");
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    if (isLive) {
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [subdomain, isLive]);

  // 自动滚动到底部
  useEffect(() => {
    if (logContainerRef.current && isLive) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isLive]);

  // 过滤日志
  const filteredLogs = React.useMemo(() => {
    let lines = logs.split("\n");

    // 级别过滤
    if (filterLevel !== "all") {
      lines = lines.filter((line) => {
        switch (filterLevel) {
          case "error":
            return /error|ERROR|fail|FAIL/i.test(line);
          case "warning":
            return /warn|WARNING/i.test(line);
          case "success":
            return /success|SUCCESS|started|Started/i.test(line);
          default:
            return true;
        }
      });
    }

    // 搜索过滤
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      lines = lines.filter((line) => regex.test(line));
    }

    return lines;
  }, [logs, filterLevel, searchTerm]);

  // 高亮搜索词
  const highlightText = (text: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-300 text-black px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // 获取日志行样式
  const getLineStyle = (line: string) => {
    if (line.match(/error|ERROR|fail|FAIL/i)) {
      return "text-red-400 bg-red-950/30";
    }
    if (line.match(/warn|WARNING/i)) {
      return "text-yellow-400 bg-yellow-950/30";
    }
    if (line.match(/success|SUCCESS|started|Started/i)) {
      return "text-green-400";
    }
    return "text-gray-300";
  };

  // 下载日志
  const downloadLogs = () => {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subdomain}-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}
    >
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        {/* 左侧信息 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-950/50 rounded-md border border-blue-800/50">
            <span className="text-sm text-blue-400">📦</span>
            <span className="text-sm font-mono text-blue-300">{subdomain}</span>
          </div>

          <div
            className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${
              isLive
                ? "bg-red-950/50 text-red-400 border border-red-800/50"
                : "bg-gray-700 text-gray-400 border border-gray-600"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isLive ? "bg-red-500 animate-pulse" : "bg-gray-500"
              }`}
            />
            {isLive ? "LIVE" : "PAUSED"}
          </div>
        </div>

        {/* 右侧控制 */}
        <div className="flex items-center gap-2">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索日志..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 过滤按钮组 */}
          <div className="flex gap-1 p-1 bg-gray-700 rounded-md">
            {(["all", "error", "warning", "success"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  filterLevel === level
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-600"
                }`}
              >
                {level === "all"
                  ? "全部"
                  : level === "error"
                  ? "错误"
                  : level === "warning"
                  ? "警告"
                  : "成功"}
              </button>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 ml-2 pl-2 border-l border-gray-600">
            <button
              onClick={() => setIsLive(!isLive)}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
              title={isLive ? "暂停" : "继续"}
            >
              {isLive ? (
                <Pause className="w-4 h-4 text-gray-300" />
              ) : (
                <Play className="w-4 h-4 text-gray-300" />
              )}
            </button>

            <button
              onClick={fetchLogs}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4 text-gray-300" />
            </button>

            <button
              onClick={downloadLogs}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
              title="下载日志"
            >
              <Download className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 日志内容区域 */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm"
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">加载日志中...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-400 mb-2">❌ {error}</p>
              <button
                onClick={fetchLogs}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-200 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        )}

        {!loading && !error && filteredLogs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">
              {searchTerm || filterLevel !== "all"
                ? "没有匹配的日志"
                : "暂无日志输出"}
            </p>
          </div>
        )}

        {!loading && !error && filteredLogs.length > 0 && (
          <div className="space-y-0.5">
            {filteredLogs.map((line, index) => (
              <div
                key={index}
                className={`flex hover:bg-gray-800/50 px-2 py-0.5 rounded transition-colors ${getLineStyle(
                  line
                )}`}
              >
                <span className="inline-block w-12 text-right mr-4 text-gray-500 select-none flex-shrink-0">
                  {index + 1}
                </span>
                <span className="flex-1 break-all whitespace-pre-wrap">
                  {highlightText(line)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>总行数: {logs.split("\n").length}</span>
          {(searchTerm || filterLevel !== "all") && (
            <span>显示: {filteredLogs.length}</span>
          )}
        </div>
      </div>
    </div>
  );
};
