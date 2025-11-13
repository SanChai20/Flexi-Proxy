"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Hash, MapPin, Activity, Clock } from "lucide-react";

export default function GatewaySkeleton({ dict }: { dict: any }) {
  return (
    <div className="max-w-4xl mx-auto py-0 px-4">
      {/* Header Skeleton */}
      <div className="mb-12 text-center">
        <Skeleton className="h-9 w-48 mx-auto mb-2" />
        <Skeleton className="h-5 w-96 mx-auto mb-6" />
        <div className="flex justify-center">
          <Skeleton className="h-10 w-[200px]" />
        </div>
      </div>

      {/* Gateway Cards Grid Skeleton */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Generate 6 skeleton cards */}
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="group relative transition-all duration-300 flex flex-col overflow-hidden border border-border/40 bg-gradient-to-br from-card via-card to-card/95"
            >
              {/* 顶部装饰渐变条占位 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20" />

              <CardHeader className="pb-4 relative z-10">
                {/* 标题行 */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-1.5 rounded-lg bg-muted/50">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Skeleton className="h-5 w-32" />
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* 状态徽章 */}
                    <Skeleton className="h-6 w-16 rounded-md" />
                    {/* 健康状态指示器 */}
                    <Skeleton className="w-2 h-2 rounded-full" />
                    {/* 设置菜单图标占位 */}
                    <Skeleton className="w-8 h-8 rounded-md" />
                  </div>
                </div>

                {/* 位置信息 */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent/30 w-fit mb-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* URL 信息 */}
                <div className="flex items-start gap-2 mt-1 p-2 rounded-md bg-muted/30">
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-end space-y-3 relative z-10 pt-0">
                {/* 性能指标卡片 - 2列网格 */}
                <div className="grid grid-cols-2 gap-2">
                  {/* 健康状态 */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-gradient-to-br from-accent/40 to-accent/20 border border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>

                  {/* 响应时间 */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-gradient-to-br from-accent/40 to-accent/20 border border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>

                {/* 操作按钮 */}
                <Skeleton className="h-10 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
