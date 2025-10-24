import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModifyAccessTokenSkeleton({ dict }: { dict: any }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.token?.keyTitle || "Modify Token Pass"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.token?.keySubtitle ||
              "Refresh the Access Token for the Proxy Gateway Service"}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center justify-between h-10 px-3 border rounded-md">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-3 w-64 opacity-70" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center justify-between h-10 px-3 border rounded-md">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-3 w-56 opacity-70" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-72 opacity-70" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
              <Skeleton className="h-3 w-80 opacity-70" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20 opacity-60" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-48 opacity-70" />
            </div>

            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-5 w-44" />
              </div>

              <div className="space-y-2 pl-6 opacity-90">
                <Skeleton className="h-4 w-36" />
                <div className="border rounded-md p-3 space-y-2 bg-muted/20">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-3 w-64 opacity-70" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
