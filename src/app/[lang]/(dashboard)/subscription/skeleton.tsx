import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-0 px-4">
      {/* Header Skeleton */}
      <div className="mb-12 text-center">
        <Skeleton className="h-9 w-48 mx-auto mb-2" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      {/* Status Alert Skeleton (optional, shown conditionally) */}
      <div className="mb-6">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </Card>
      </div>

      {/* Plans Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan Skeleton */}
        <Card className="p-6">
          {/* Plan Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <div className="flex items-end gap-3">
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-6 w-20 mb-2" />
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-start gap-3">
                <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
                <Skeleton className="h-4 flex-1" />
              </li>
            ))}
          </ul>
        </Card>

        {/* Pro Plan Skeleton */}
        <Card className="p-6">
          {/* Plan Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <div className="flex items-end gap-3">
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-6 w-20 mb-2" />
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-start gap-3">
                <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
                <Skeleton className="h-4 flex-1" />
              </li>
            ))}
          </ul>

          {/* Instance Counter Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-48 mb-2" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 flex-1 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>

          {/* CTA Buttons Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </Card>
      </div>

      {/* Refund Policy Notice Skeleton */}
      <div className="mt-8">
        <Card className="p-4 bg-muted/50 border-muted">
          <div className="flex items-start gap-3">
            <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
