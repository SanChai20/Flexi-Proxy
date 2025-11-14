import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccessTokenSkeleton({ dict }: { dict: any }) {
  return (
    <div className="max-w-4xl mx-auto py-0 px-4">
      {/* Header Skeleton */}
      <div className="mb-8 text-center">
        <Skeleton className="h-9 w-64 mx-auto mb-2 bg-muted/30" />
        <Skeleton className="h-5 w-80 mx-auto bg-muted/30" />
      </div>

      {/* Token Count Badge Skeleton with Add Button */}
      <div className="mb-6">
        <Card className="group relative overflow-hidden border-border/40 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section - Token Info Skeleton */}
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-10 w-10 rounded-lg bg-muted/30" />

                <div className="flex flex-col gap-1">
                  <Skeleton className="h-3 w-32 bg-muted/30" />
                  <div className="flex items-baseline gap-2">
                    <Skeleton className="h-8 w-12 bg-muted/30" />
                    <Skeleton className="h-4 w-10 bg-muted/30" />
                  </div>
                </div>
              </div>

              {/* Right Section - Action Button Skeleton */}
              <Skeleton className="h-10 w-24 rounded-md bg-muted/30" />
            </div>
          </div>

          {/* Progress indicator skeleton */}
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-muted">
            <Skeleton className="h-full w-1/3 bg-primary/60" />
          </div>
        </Card>
      </div>

      {/* Tokens List Skeleton */}
      <Card>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Skeleton className="h-6 w-20 rounded-md bg-muted/30" />
                  <Skeleton className="h-4 w-32 bg-muted/30" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
