"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function GatewayPrivateSkeleton({ dict }: { dict: any }) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center">
                {dict?.gateway?.startLogs || "Startup logs"}
              </CardTitle>
              <CardDescription className="mt-1">
                <Skeleton className="h-4 w-64 mt-1" />
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-250px)] w-full">
            <div className="p-4 space-y-1 font-mono text-sm">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex gap-3 py-1 px-2 rounded">
                  <Skeleton
                    className="h-4 flex-1"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
