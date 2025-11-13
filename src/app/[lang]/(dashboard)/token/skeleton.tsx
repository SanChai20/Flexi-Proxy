import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccessTokenSkeleton({ dict }: { dict: any }) {
  return (
    <div className="max-w-4xl mx-auto py-0 px-4">
      {/* Header Skeleton */}
      <div className="mb-8 text-center">
        <Skeleton className="h-9 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      {/* Token Count Badge Skeleton with Add Button */}
      <div className="mb-6">
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </Card>
      </div>

      {/* Tokens Grid Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            {/* Divider */}
            <div className="border-t border-border mb-3"></div>

            {/* Base URL */}
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/30 border border-border/50">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
