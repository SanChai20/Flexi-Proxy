"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
          <Skeleton className="h-10 w-48" />
        </div>
      </div>

      {/* Gateway Cards Grid Skeleton */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Generate 6 skeleton cards */}
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="transition-all duration-200">
              <CardHeader className="pb-3">
                {/* Gateway ID and Status Indicator */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Hash className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="flex-shrink-0 w-3 h-3 rounded-full mt-1" />
                </div>

                {/* Location Info Skeleton */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* URL Skeleton */}
                <Skeleton className="h-3 w-full mt-1" />

                {/* Status and Premium/Free Badges */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Health Check & Response Time */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>

                {/* Get Token Button Skeleton */}
                <Skeleton className="h-10 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
